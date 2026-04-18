<?php

namespace App\Http\Controllers;

use App\Models\CommitComment;
use App\Models\CommitReview;
use App\Models\User;
use App\Services\AiCommitReviewService;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class CommitCommentController extends Controller
{
    public function __construct(
        private readonly AiCommitReviewService $aiCommitReviewService
    ) {
    }

    private function getGitlabToken(Request $request): ?string
    {
        return $request->user()?->gitlab_token;
    }

    private function gitlabClient(string $token)
    {
        $sslVerify = Config::get('services.gitlab.ssl_verify', true);

        return Http::withToken($token)
            ->acceptJson()
            ->timeout(15)
            ->withOptions([
                'verify' => $sslVerify,
            ]);
    }

    private function unauthorizedResponse()
    {
        return response()->json([
            'error' => 'Usuario nao autenticado'
        ], 401);
    }

    private function getCommitData(string $token, $projectId, $sha)
    {
        return $this->gitlabClient($token)
            ->get("https://gitlab.com/api/v4/projects/{$projectId}/repository/commits/{$sha}");
    }

    private function getCommitDiffData(string $token, $projectId, $sha)
    {
        return $this->gitlabClient($token)
            ->get("https://gitlab.com/api/v4/projects/{$projectId}/repository/commits/{$sha}/diff");
    }

    private function aiReviewerUser(): User
    {
        return User::query()->firstOrCreate(
            ['email' => 'devhub-ai@local.dev'],
            [
                'name' => 'DevHub AI',
                'password' => Hash::make(bin2hex(random_bytes(16))),
            ]
        );
    }

    private function validDiffLocations(array $diff): array
    {
        $locations = [];

        foreach ($diff as $file) {
            $filePath = $file['new_path'] ?? $file['old_path'] ?? null;

            if (!is_string($filePath) || $filePath === '') {
                continue;
            }

            $oldLineNumber = null;
            $newLineNumber = null;
            $lines = preg_split("/\r\n|\n|\r/", (string) ($file['diff'] ?? '')) ?: [];

            foreach ($lines as $line) {
                if (str_starts_with($line, '@@')) {
                    if (preg_match('/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/', $line, $match) === 1) {
                        $oldLineNumber = (int) $match[1];
                        $newLineNumber = (int) $match[2];
                    } else {
                        $oldLineNumber = null;
                        $newLineNumber = null;
                    }

                    continue;
                }

                if (str_starts_with($line, '+') && !str_starts_with($line, '+++')) {
                    if (is_int($newLineNumber)) {
                        $locations[$this->lineKey($filePath, 'new', $newLineNumber)] = true;
                        $newLineNumber += 1;
                    }
                    continue;
                }

                if (str_starts_with($line, '-') && !str_starts_with($line, '---')) {
                    if (is_int($oldLineNumber)) {
                        $locations[$this->lineKey($filePath, 'old', $oldLineNumber)] = true;
                        $oldLineNumber += 1;
                    }
                    continue;
                }

                if (is_int($newLineNumber)) {
                    $locations[$this->lineKey($filePath, 'new', $newLineNumber)] = true;
                    $newLineNumber += 1;
                }

                if (is_int($oldLineNumber)) {
                    $oldLineNumber += 1;
                }
            }
        }

        return $locations;
    }

    private function lineKey(string $filePath, string $lineSide, int $lineNumber): string
    {
        return "{$filePath}::{$lineSide}::{$lineNumber}";
    }

    private function userOwnsProject($projectId, Request $request): bool
    {
        $token = $this->getGitlabToken($request);

        if (!$token) {
            return false;
        }

        $membersResponse = $this->gitlabClient($token)
            ->get("https://gitlab.com/api/v4/projects/$projectId/members");

        if (!$membersResponse->successful()) {
            return false;
        }

        $owner = collect($membersResponse->json())
            ->first(fn ($member) => (int) ($member['access_level'] ?? 0) === 50);

        if (!$owner) {
            return false;
        }

        return (string) ($owner['id'] ?? '') === (string) ($request->user()?->gitlab_id ?? '');
    }

    private function canCommentPayload($projectId, Request $request): array
    {
        try {
            return [
                'can_comment' => $this->userOwnsProject($projectId, $request),
                'permission_error' => null,
            ];
        } catch (ConnectionException $exception) {
            Log::warning('GitLab permission lookup failed', [
                'project_id' => $projectId,
                'message' => $exception->getMessage(),
            ]);

            return [
                'can_comment' => false,
                'permission_error' => $this->normalizeGitlabConnectionMessage($exception),
            ];
        }
    }

    private function normalizeGitlabConnectionMessage(ConnectionException $exception): string
    {
        $message = (string) $exception->getMessage();

        if (str_contains($message, 'Could not resolve host: gitlab.com')) {
            return 'GitLab indisponivel: falha ao resolver o host gitlab.com.';
        }

        if (str_contains($message, 'cURL error 60')) {
            return 'GitLab indisponivel: falha na validacao SSL do PHP/cURL.';
        }

        if (str_contains($message, 'cURL error 28')) {
            return 'GitLab indisponivel: tempo limite excedido ao consultar a API.';
        }

        return 'GitLab indisponivel no momento.';
    }

    private function isMissingTable(QueryException $exception, string $table): bool
    {
        return str_contains((string) $exception->getMessage(), "Table 'devhub.{$table}' doesn't exist");
    }

    private function isAiProviderError(\RuntimeException $exception): bool
    {
        $message = (string) $exception->getMessage();

        return str_starts_with($message, 'GROQ:') || str_starts_with($message, 'OPENAI:');
    }

    private function aiProviderStatusCode(\RuntimeException $exception): int
    {
        $message = (string) $exception->getMessage();

        if (str_contains($message, 'excede o limite do provedor')) {
            return 413;
        }

        if (str_contains($message, 'limite de requisicoes excedido')) {
            return 429;
        }

        return 502;
    }

    public function permission($projectId, $sha, Request $request)
    {
        $token = $this->getGitlabToken($request);

        if (!$token) {
            return $this->unauthorizedResponse();
        }

        return response()->json($this->canCommentPayload($projectId, $request));
    }

    public function index($projectId, $sha, Request $request)
    {
        $token = $this->getGitlabToken($request);

        if (!$token) {
            return $this->unauthorizedResponse();
        }

        $comments = CommitComment::query()
            ->where('project_id', $projectId)
            ->where('commit_sha', $sha)
            ->with(['user:id,name,email,avatar'])
            ->orderBy('created_at')
            ->get();

        $review = null;
        $reviewWarning = null;

        if (Schema::hasTable('commit_reviews')) {
            try {
                $review = CommitReview::query()
                    ->where('project_id', $projectId)
                    ->where('commit_sha', $sha)
                    ->latest()
                    ->first();
            } catch (QueryException $exception) {
                if (!$this->isMissingTable($exception, 'commit_reviews')) {
                    throw $exception;
                }

                $reviewWarning = 'Tabela commit_reviews ausente. Execute as migrations pendentes.';
            }
        } else {
            $reviewWarning = 'Tabela commit_reviews ausente. Execute as migrations pendentes.';
        }

        return response()->json([
            ...$this->canCommentPayload($projectId, $request),
            'comments' => $comments,
            'review' => $review,
            'review_warning' => $reviewWarning,
        ]);
    }

    public function store($projectId, $sha, Request $request)
    {
        $token = $this->getGitlabToken($request);

        if (!$token) {
            return $this->unauthorizedResponse();
        }

        if (!$this->userOwnsProject($projectId, $request)) {
            return response()->json([
                'error' => 'Somente o owner do projeto pode comentar'
            ], 403);
        }

        $validated = $request->validate([
            'body' => 'required|string|max:2000',
            'file_path' => 'required|string|max:1024',
            'line_number' => 'required|integer|min:1',
            'line_side' => 'required|string|in:old,new',
            'line_text' => 'nullable|string|max:5000',
        ]);

        $comment = CommitComment::create([
            'project_id' => $projectId,
            'commit_sha' => $sha,
            'file_path' => trim($validated['file_path']),
            'line_number' => $validated['line_number'],
            'line_side' => $validated['line_side'],
            'line_text' => isset($validated['line_text']) ? trim($validated['line_text']) : null,
            'user_id' => $request->user()->id,
            'body' => trim($validated['body']),
        ])->load('user:id,name,email,avatar');

        return response()->json($comment, 201);
    }

    public function generateAiReview($projectId, $sha, Request $request)
    {
        $token = $this->getGitlabToken($request);

        if (!$token) {
            return $this->unauthorizedResponse();
        }

        try {
            $commitResponse = $this->getCommitData($token, $projectId, $sha);
            $diffResponse = $this->getCommitDiffData($token, $projectId, $sha);

            if (!$commitResponse->successful() || !$diffResponse->successful()) {
                return response()->json([
                    'error' => 'Nao foi possivel carregar os dados do commit para o review'
                ], 422);
            }

            $commit = $commitResponse->json();
            $diff = $diffResponse->json();

            if (!is_array($diff) || $diff === []) {
                return response()->json([
                    'error' => 'O commit nao possui diff suficiente para review'
                ], 422);
            }

            $aiReview = $this->aiCommitReviewService->review(
                is_array($commit) ? $commit : [],
                $diff
            );

            $validLocations = $this->validDiffLocations($diff);
            $aiUser = $this->aiReviewerUser();

            CommitComment::query()
                ->where('project_id', $projectId)
                ->where('commit_sha', $sha)
                ->where('user_id', $aiUser->id)
                ->delete();

            $persistedComments = collect($aiReview['comments'])
                ->filter(function (array $comment) use ($validLocations) {
                    return isset($validLocations[$this->lineKey(
                        $comment['file_path'],
                        $comment['line_side'],
                        $comment['line_number']
                    )]);
                })
                ->map(function (array $comment) use ($projectId, $sha, $aiUser) {
                    return CommitComment::create([
                        'project_id' => $projectId,
                        'commit_sha' => $sha,
                        'file_path' => $comment['file_path'],
                        'line_number' => $comment['line_number'],
                        'line_side' => $comment['line_side'],
                        'line_text' => null,
                        'user_id' => $aiUser->id,
                        'body' => $comment['body'],
                    ])->load('user:id,name,email,avatar');
                })
                ->values();

            $review = null;
            $reviewWarning = null;

            if (Schema::hasTable('commit_reviews')) {
                $review = CommitReview::query()->updateOrCreate(
                    [
                        'project_id' => $projectId,
                        'commit_sha' => $sha,
                    ],
                    [
                        'score' => $aiReview['score'],
                        'summary' => $aiReview['summary'] !== '' ? $aiReview['summary'] : 'Review gerado sem resumo adicional.',
                        'reviewed_by_user_id' => $request->user()?->id,
                        'model' => $aiReview['model'],
                    ]
                );
            } else {
                $reviewWarning = 'Review gerado, mas nao foi persistido porque a tabela commit_reviews ainda nao existe.';
            }

            return response()->json([
                'review' => $review,
                'comments' => $persistedComments,
                'review_warning' => $reviewWarning,
            ]);
        } catch (ConnectionException $exception) {
            return response()->json([
                'error' => $this->normalizeGitlabConnectionMessage($exception),
            ], 503);
        } catch (\RuntimeException $exception) {
            if ($this->isAiProviderError($exception)) {
                return response()->json([
                    'error' => $exception->getMessage(),
                ], $this->aiProviderStatusCode($exception));
            }

            throw $exception;
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json([
                'error' => $exception->getMessage() ?: 'Erro ao gerar review com IA',
            ], 500);
        }
    }
}
