<?php

namespace App\Services;

use App\Models\CommitComment;
use App\Models\CommitReview;
use App\Models\User;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Schema;

class DashboardService
{
    private const MAX_PROJECTS = 8;
    private const MAX_ACTIVITY_ITEMS = 8;
    private const MAX_ATTENTION_ITEMS = 6;
    private const MAX_OWNED_OPEN_MERGES = 8;
    private const WINDOW_DAYS = 7;

    public function __construct(
        private readonly HttpFactory $http
    ) {
    }

    public function build(Request $request): array
    {
        $token = $request->user()?->gitlab_token;

        if (!is_string($token) || $token === '') {
            throw new \RuntimeException('Usuario nao autenticado');
        }

        $gitlabUserId = (string) ($request->user()?->gitlab_id ?? '');
        $projects = collect($this->fetchProjects($token));
        $projectIds = $projects->pluck('id')->filter()->values()->all();
        $projectSnapshots = $this->buildProjectSnapshots($token, $projects, $gitlabUserId);

        return [
            'window_days' => self::WINDOW_DAYS,
            'generated_at' => now()->toIso8601String(),
            'overview' => $this->buildOverview($projects, $projectSnapshots),
            'health' => $this->buildHealth($projectIds),
            'top_projects' => $this->buildTopProjects($projectSnapshots),
            'owned_open_merges' => $this->buildOwnedOpenMerges($projectSnapshots),
            'recent_activity' => $this->buildRecentActivity($projectSnapshots, $projectIds),
            'review_insights' => $this->buildReviewInsights($projectIds),
            'attention_items' => $this->buildAttentionItems($projectSnapshots, $projectIds),
        ];
    }

    private function gitlabClient(string $token)
    {
        $sslVerify = Config::get('services.gitlab.ssl_verify', true);

        return $this->http->withToken($token)
            ->acceptJson()
            ->timeout(15)
            ->withOptions([
                'verify' => $sslVerify,
            ]);
    }

    private function fetchProjects(string $token): array
    {
        $response = $this->gitlabClient($token)
            ->get('https://gitlab.com/api/v4/projects', [
                'membership' => true,
                'per_page' => 100,
                'order_by' => 'last_activity_at',
                'sort' => 'desc',
                'simple' => true,
            ]);

        if (!$response->successful()) {
            throw new \RuntimeException('Erro ao buscar projetos do GitLab.');
        }

        $data = $response->json();

        return is_array($data) ? $data : [];
    }

    private function buildProjectSnapshots(string $token, Collection $projects, string $gitlabUserId): Collection
    {
        return $projects
            ->take(self::MAX_PROJECTS)
            ->map(function (array $project) use ($token, $gitlabUserId) {
                $projectId = $project['id'] ?? null;

                if (!$projectId) {
                    return null;
                }

                $lastCommitResponse = $this->gitlabClient($token)
                    ->get("https://gitlab.com/api/v4/projects/{$projectId}/repository/commits", [
                        'per_page' => 1,
                    ]);

                $recentCommitsResponse = $this->gitlabClient($token)
                    ->get("https://gitlab.com/api/v4/projects/{$projectId}/repository/commits", [
                        'per_page' => 100,
                        'since' => now()->subDays(self::WINDOW_DAYS)->toIso8601String(),
                    ]);

                $mergeRequestResponse = $this->gitlabClient($token)
                    ->get("https://gitlab.com/api/v4/projects/{$projectId}/merge_requests", [
                        'state' => 'opened',
                        'per_page' => 20,
                    ]);

                $membersResponse = $this->gitlabClient($token)
                    ->get("https://gitlab.com/api/v4/projects/{$projectId}/members");

                $lastCommit = null;
                $recentCommits = [];
                $openedMergeRequests = [];
                $isOwner = false;

                if ($lastCommitResponse->successful()) {
                    $commits = $lastCommitResponse->json();
                    $lastCommit = is_array($commits) ? ($commits[0] ?? null) : null;
                }

                if ($recentCommitsResponse->successful()) {
                    $commits = $recentCommitsResponse->json();
                    $recentCommits = is_array($commits) ? $commits : [];
                }

                if ($mergeRequestResponse->successful()) {
                    $mergeRequests = $mergeRequestResponse->json();
                    $openedMergeRequests = is_array($mergeRequests) ? $mergeRequests : [];
                }

                if ($membersResponse->successful()) {
                    $members = $membersResponse->json();

                    if (is_array($members)) {
                        $owner = collect($members)
                            ->first(fn (array $member) => (int) ($member['access_level'] ?? 0) === 50);

                        $isOwner = (string) ($owner['id'] ?? '') === (string) $gitlabUserId;

                        if (!$isOwner) {
                            $isOwner = collect($members)->contains(function (array $member) use ($gitlabUserId) {
                                return (string) ($member['id'] ?? '') === (string) $gitlabUserId
                                    && (int) ($member['access_level'] ?? 0) === 50;
                            });
                        }
                    }
                }

                return [
                    'project_id' => $projectId,
                    'project_name' => $project['name'] ?? 'Projeto',
                    'web_url' => $project['web_url'] ?? null,
                    'owner_name' => $project['owner']['name'] ?? null,
                    'is_owner' => $isOwner,
                    'last_activity_at' => $project['last_activity_at'] ?? null,
                    'last_commit' => $lastCommit,
                    'recent_commits_count' => count($recentCommits),
                    'opened_merge_requests' => $openedMergeRequests,
                ];
            })
            ->filter()
            ->values();
    }

    private function buildOverview(Collection $projects, Collection $projectSnapshots): array
    {
        $recentCommits = $projectSnapshots->sum(
            fn (array $project) => (int) ($project['recent_commits_count'] ?? 0)
        );
        $openedMergeRequests = $projectSnapshots->sum(
            fn (array $project) => count($project['opened_merge_requests'] ?? [])
        );
        $reviewsGenerated = Schema::hasTable('commit_reviews')
            ? CommitReview::query()
                ->where('created_at', '>=', now()->subDays(self::WINDOW_DAYS))
                ->count()
            : 0;

        return [
            'projects_monitored' => $projects->count(),
            'recent_commits' => $recentCommits,
            'opened_merge_requests' => $openedMergeRequests,
            'reviews_generated' => $reviewsGenerated,
        ];
    }

    private function buildHealth(array $projectIds): array
    {
        $default = [
            'average_score' => null,
            'low_score_commits' => 0,
            'manual_comments' => 0,
            'ai_comments' => 0,
        ];

        if ($projectIds === []) {
            return $default;
        }

        $aiUserId = User::query()->where('email', 'devhub-ai@local.dev')->value('id');

        if (!Schema::hasTable('commit_reviews') || !Schema::hasTable('commit_comments')) {
            return $default;
        }

        $reviews = CommitReview::query()
            ->whereIn('project_id', $projectIds)
            ->where('created_at', '>=', now()->subDays(self::WINDOW_DAYS));

        $comments = CommitComment::query()
            ->whereIn('project_id', $projectIds)
            ->where('created_at', '>=', now()->subDays(self::WINDOW_DAYS));

        return [
            'average_score' => round((float) ($reviews->clone()->avg('score') ?? 0), 1),
            'low_score_commits' => $reviews->clone()->where('score', '<=', 5)->count(),
            'manual_comments' => $comments->clone()->when(
                $aiUserId,
                fn ($query) => $query->where('user_id', '!=', $aiUserId)
            )->count(),
            'ai_comments' => $aiUserId
                ? $comments->clone()->where('user_id', $aiUserId)->count()
                : 0,
        ];
    }

    private function buildTopProjects(Collection $projectSnapshots): array
    {
        return $projectSnapshots
            ->sortByDesc(function (array $project) {
                return sprintf(
                    '%05d|%s',
                    (int) ($project['recent_commits_count'] ?? 0),
                    $project['last_activity_at'] ?? ''
                );
            })
            ->take(5)
            ->map(function (array $project) {
                return [
                    'project_id' => $project['project_id'],
                    'project_name' => $project['project_name'],
                    'owner_name' => $project['owner_name'],
                    'recent_commit_author' => $project['last_commit']['author_name'] ?? null,
                    'recent_commit_message' => $project['last_commit']['message'] ?? null,
                    'recent_commit_sha' => $project['last_commit']['id'] ?? null,
                    'recent_commits_count' => (int) ($project['recent_commits_count'] ?? 0),
                    'opened_merge_requests' => count($project['opened_merge_requests'] ?? []),
                    'activity_basis' => 'commits',
                    'route' => "/project/{$project['project_id']}",
                ];
            })
            ->values()
            ->all();
    }

    private function buildRecentActivity(Collection $projectSnapshots, array $projectIds): array
    {
        $commitActivity = $projectSnapshots
            ->filter(fn (array $project) => !empty($project['last_commit']))
            ->map(function (array $project) {
                $commit = $project['last_commit'];

                return [
                    'type' => 'commit',
                    'title' => $project['project_name'],
                    'subtitle' => $commit['message'] ?? 'Commit recente',
                    'meta' => $commit['author_name'] ?? 'Autor desconhecido',
                    'timestamp' => $commit['created_at'] ?? $commit['committed_date'] ?? null,
                    'route' => isset($commit['id'])
                        ? "/projects/{$project['project_id']}/commits/{$commit['id']}"
                        : "/project/{$project['project_id']}?tab=commits",
                ];
            });

        $reviewActivity = collect();

        if ($projectIds !== [] && Schema::hasTable('commit_reviews')) {
            $reviewActivity = CommitReview::query()
                ->whereIn('project_id', $projectIds)
                ->latest()
                ->take(4)
                ->get()
                ->map(function (CommitReview $review) {
                    return [
                        'type' => 'review',
                        'title' => "Review do commit {$review->commit_sha}",
                        'subtitle' => $review->summary,
                        'meta' => "Score {$review->score}/10",
                        'timestamp' => $review->created_at?->toIso8601String(),
                        'route' => "/projects/{$review->project_id}/commits/{$review->commit_sha}",
                    ];
                });
        }

        return $commitActivity
            ->concat($reviewActivity)
            ->sortByDesc(fn (array $item) => $item['timestamp'] ?? '')
            ->take(self::MAX_ACTIVITY_ITEMS)
            ->values()
            ->all();
    }

    private function buildOwnedOpenMerges(Collection $projectSnapshots): array
    {
        return $projectSnapshots
            ->filter(fn (array $project) => ($project['is_owner'] ?? false) === true)
            ->flatMap(function (array $project) {
                return collect($project['opened_merge_requests'] ?? [])
                    ->map(function (array $mergeRequest) use ($project) {
                        return [
                            'project_id' => $project['project_id'],
                            'project_name' => $project['project_name'],
                            'title' => $mergeRequest['title'] ?? 'Merge Request aberta',
                            'author_name' => $mergeRequest['author']['name'] ?? 'Autor desconhecido',
                            'updated_at' => $mergeRequest['updated_at'] ?? $mergeRequest['created_at'] ?? null,
                            'has_conflicts' => (bool) ($mergeRequest['has_conflicts'] ?? false),
                            'route' => "/project/{$project['project_id']}?tab=merge-requests",
                        ];
                    });
            })
            ->sortByDesc(function (array $item) {
                return sprintf(
                    '%d|%s',
                    $item['has_conflicts'] ? 1 : 0,
                    $item['updated_at'] ?? ''
                );
            })
            ->take(self::MAX_OWNED_OPEN_MERGES)
            ->values()
            ->all();
    }

    private function buildReviewInsights(array $projectIds): array
    {
        $default = [
            'reviewed_commits' => 0,
            'average_score' => null,
            'lowest_score' => null,
            'top_model' => null,
        ];

        if ($projectIds === [] || !Schema::hasTable('commit_reviews')) {
            return $default;
        }

        $reviews = CommitReview::query()
            ->whereIn('project_id', $projectIds)
            ->where('created_at', '>=', now()->subDays(self::WINDOW_DAYS));

        $topModel = $reviews->clone()
            ->selectRaw('model, COUNT(*) as total')
            ->whereNotNull('model')
            ->groupBy('model')
            ->orderByDesc('total')
            ->value('model');

        return [
            'reviewed_commits' => $reviews->clone()->count(),
            'average_score' => round((float) ($reviews->clone()->avg('score') ?? 0), 1),
            'lowest_score' => $reviews->clone()->min('score'),
            'top_model' => $topModel,
        ];
    }

    private function buildAttentionItems(Collection $projectSnapshots, array $projectIds): array
    {
        $items = collect();

        if ($projectIds !== [] && Schema::hasTable('commit_reviews')) {
            $lowScoreReviews = CommitReview::query()
                ->whereIn('project_id', $projectIds)
                ->where('score', '<=', 5)
                ->latest()
                ->take(3)
                ->get();

            $items = $items->concat($lowScoreReviews->map(function (CommitReview $review) {
                return [
                    'type' => 'low_score_review',
                    'title' => "Commit {$review->commit_sha} com score baixo",
                    'description' => $review->summary,
                    'severity' => 'high',
                    'route' => "/projects/{$review->project_id}/commits/{$review->commit_sha}",
                ];
            }));
        }

        $mergeRequestItems = $projectSnapshots
            ->flatMap(function (array $project) {
                return collect($project['opened_merge_requests'] ?? [])
                    ->filter(fn (array $mr) => ($mr['has_conflicts'] ?? false) === true)
                    ->map(function (array $mr) use ($project) {
                        return [
                            'type' => 'merge_request_conflict',
                            'title' => $project['project_name'],
                            'description' => $mr['title'] ?? 'Merge Request com conflito',
                            'severity' => 'medium',
                            'route' => "/project/{$project['project_id']}?tab=merge-requests",
                        ];
                    });
            })
            ->take(3);

        $items = $items->concat($mergeRequestItems);

        return $items
            ->take(self::MAX_ATTENTION_ITEMS)
            ->values()
            ->all();
    }
}
