<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

class ProjectController extends Controller
{
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
            'error' => 'Usuário não autenticado'
        ], 401);
    }

    private function gitlabJsonResponse($response, string $message)
    {
        if (!$response->successful()) {
            return response()->json([
                'error' => $message
            ], $response->status());
        }

        return response()->json($response->json());
    }

    public function getCommitDiff($projectId, $sha, Request $request)
    {
        try {
            $token = $this->getGitlabToken($request);

            if (!$token) {
                return $this->unauthorizedResponse();
            }

            $response = $this->gitlabClient($token)
                ->get("https://gitlab.com/api/v4/projects/{$projectId}/repository/commits/{$sha}/diff");

            return $this->gitlabJsonResponse($response, 'Erro ao buscar diff do commit');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao buscar diff do commit'
            ], 500);
        }
    }

    public function getCommit($projectId, $sha, Request $request)
    {
        try {
            $token = $this->getGitlabToken($request);

            if (!$token) {
                return $this->unauthorizedResponse();
            }

            $response = $this->gitlabClient($token)
                ->get("https://gitlab.com/api/v4/projects/{$projectId}/repository/commits/{$sha}");

            return $this->gitlabJsonResponse($response, 'Erro ao buscar commit');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao buscar commit'
            ], 500);
        }
    }

    public function getLastCommitAllProject(Request $request)
    {
        $token = $this->getGitlabToken($request);

        if (!$token) {
            return $this->unauthorizedResponse();
        }

        $params = [];

        if ($request->type === 'owned') {
            $params = ['owned' => true];
        } elseif ($request->type === 'membership') {
            $params = ['membership' => true];
        }

        $projectsResponse = $this->gitlabClient($token)
            ->get('https://gitlab.com/api/v4/projects', $params);

        if (!$projectsResponse->successful()) {
            return response()->json([
                'error' => 'Erro ao buscar projetos'
            ], $projectsResponse->status());
        }

        $projects = $projectsResponse->json();
        $result = [];

        foreach ($projects as $project) {
            $commitsResponse = $this->gitlabClient($token)
                ->get("https://gitlab.com/api/v4/projects/{$project['id']}/repository/commits", [
                    'per_page' => 1
                ]);

            $commits = $commitsResponse->successful() ? $commitsResponse->json() : [];
            $lastCommit = $commits[0] ?? null;

            $result[] = [
                'project_id' => $project['id'],
                'project_name' => $project['name'],
                'last_commit' => $lastCommit
            ];
        }

        return response()->json($result);
    }

    public function getFileContent($id, Request $request)
    {
        $token = $this->getGitlabToken($request);

        if (!$token) {
            return $this->unauthorizedResponse();
        }

        $path = $request->query('path');

        if (!is_string($path) || $path === '') {
            return response()->json([
                'error' => 'Caminho do arquivo inválido'
            ], 422);
        }

        $response = $this->gitlabClient($token)
            ->get("https://gitlab.com/api/v4/projects/$id/repository/files/" . urlencode($path) . "/raw", [
                'ref' => 'main'
            ]);

        if (!$response->successful()) {
            return response()->json([
                'error' => 'Erro ao buscar arquivo'
            ], $response->status());
        }

        return response($response->body(), 200, [
            'Content-Type' => $response->header('Content-Type', 'text/plain; charset=UTF-8')
        ]);
    }

    public function getFiles($id, Request $request)
    {
        $token = $this->getGitlabToken($request);

        if (!$token) {
            return $this->unauthorizedResponse();
        }

        $path = $request->query('path', '');

        $response = $this->gitlabClient($token)
            ->get("https://gitlab.com/api/v4/projects/$id/repository/tree", [
                'path' => $path,
                'per_page' => 100
            ]);

        return $this->gitlabJsonResponse($response, 'Erro ao buscar arquivos');
    }

    public function members($id, Request $request)
    {
        $token = $this->getGitlabToken($request);

        if (!$token) {
            return $this->unauthorizedResponse();
        }

        $response = $this->gitlabClient($token)
            ->get("https://gitlab.com/api/v4/projects/$id/members");

        return $this->gitlabJsonResponse($response, 'Erro ao buscar membros');
    }

    public function getMergeRequests($id, Request $request)
    {
        try {
            $token = $this->getGitlabToken($request);

            if (!$token) {
                return $this->unauthorizedResponse();
            }

            $response = $this->gitlabClient($token)
                ->get("https://gitlab.com/api/v4/projects/$id/merge_requests", [
                    'state' => 'all'
                ]);

            if (!$response->successful()) {
                Log::warning("GitLab MR Error", ['status' => $response->status()]);

                return response()->json([
                    'error' => 'GitLab API error'
                ], $response->status());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error("ProjectController MR Exception", ['message' => $e->getMessage()]);

            return response()->json([
                'error' => 'Erro ao buscar merge requests'
            ], 500);
        }
    }

    public function getBranches($id, Request $request)
    {
        $token = $this->getGitlabToken($request);

        if (!$token) {
            return $this->unauthorizedResponse();
        }

        $response = $this->gitlabClient($token)
            ->get("https://gitlab.com/api/v4/projects/$id/repository/branches");

        return $this->gitlabJsonResponse($response, 'Erro ao buscar branches');
    }

    public function getCommits($id, Request $request)
    {
        try {
            $token = $this->getGitlabToken($request);

            if (!$token) {
                return $this->unauthorizedResponse();
            }

            $branch = $request->query('branch', 'main');

            $response = $this->gitlabClient($token)
                ->get("https://gitlab.com/api/v4/projects/$id/repository/commits", [
                    'ref_name' => $branch,
                    'per_page' => 100
                ]);

            return $this->gitlabJsonResponse($response, 'Erro ao buscar commits');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao buscar commits'
            ], 500);
        }
    }

    public function index(Request $request)
    {
        $token = $this->getGitlabToken($request);

        if (!$token) {
            return $this->unauthorizedResponse();
        }

        $params = [];

        if ($request->type === 'owned') {
            $params = ['owned' => true];
        } elseif ($request->type === 'membership') {
            $params = ['membership' => true];
        }

        $response = $this->gitlabClient($token)
            ->get('https://gitlab.com/api/v4/projects', $params);

        return $this->gitlabJsonResponse($response, 'Erro ao buscar projetos');
    }

    public function getProjectById($id, Request $request)
    {
        $token = $this->getGitlabToken($request);

        if (!$token) {
            return $this->unauthorizedResponse();
        }

        $response = $this->gitlabClient($token)
            ->get("https://gitlab.com/api/v4/projects/$id");

        if (!$response->successful()) {
            return response()->json([
                'error' => 'Erro ao buscar projeto'
            ], $response->status());
        }

        return response()->json($response->json());
    }
}
