<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProjectController extends Controller
{

    public function getCommitDiff($projectId, $sha, Request $request)
    {
        try {
            $user = $request->user();

            $response = Http::withToken($user->gitlab_token)
                ->withOptions([
                    'verify' => false
                ])
                ->get("https://gitlab.com/api/v4/projects/{$projectId}/repository/commits/{$sha}/diff");

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao buscar diff do commit',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function getCommit($projectId, $sha, Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json(['error' => 'Usuário não autenticado'], 401);
            }

            $response = Http::withToken($user->gitlab_token)
                ->withOptions([
                    'verify' => false
                ])
                ->get("https://gitlab.com/api/v4/projects/{$projectId}/repository/commits/{$sha}");

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao buscar commit',
                'details' => $e->getMessage()
            ], 500);
        }
    }   

    public function getLastCommitAllProject(Request $request)
    {
        $user = $request->user();

        $params = [];

        if ($request->type === 'owned') {
            $params = ['owned' => true];
        } elseif ($request->type === 'membership') {
            $params = ['membership' => true];
        } else {
            $params = [];
        }

        $projects = Http::withOptions([
            'verify' => false // 
        ])->withToken($user->gitlab_token)
            ->get('https://gitlab.com/api/v4/projects', $params)->json();

        $result = [];

        foreach ($projects as $project) {
            $commits = Http::withOptions([
                'verify' => false
            ])->withToken($user->gitlab_token)
                ->get("https://gitlab.com/api/v4/projects/{$project['id']}/repository/commits", [
                    'per_page' => 1
                ])->json();

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
        $user = $request->user();

        $path = $request->query('path');

        $response = Http::withOptions([
            'verify' => false
        ])->withToken($user->gitlab_token)
            ->get("https://gitlab.com/api/v4/projects/$id/repository/files/" . urlencode($path) . "/raw", [
                'ref' => 'main'
            ]);

        return response($response->body());
    }

    public function getFiles($id, Request $request)
    {
        $user = $request->user();

        $path = $request->query('path', '');

        $response = Http::withOptions([
            'verify' => false
        ])->withToken($user->gitlab_token)
            ->get("https://gitlab.com/api/v4/projects/$id/repository/tree", [
                'path' => $path,
                'per_page' => 100
            ]);

        return response()->json($response->json());
    }

    public function members($id, Request $request)
    {
        $user = $request->user();

        $response = Http::withOptions([
            'verify' => false
        ])->withToken($user->gitlab_token)
            ->get("https://gitlab.com/api/v4/projects/$id/members");

        return response()->json($response->json());
    }

    public function getMergeRequests($id, Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) return response()->json(['error' => 'Não autenticado'], 401);

            $response = Http::withToken($user->gitlab_token)
                ->withOptions(['verify' => false])
                ->get("https://gitlab.com/api/v4/projects/$id/merge_requests", [
                    'state' => 'all'
                ]);

            if (!$response->successful()) {
                Log::error("GitLab MR Error: " . $response->body());
                return response()->json(['error' => 'GitLab API error', 'details' => $response->json()], $response->status());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error("ProjectController MR Exception: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getBranches($id, Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Não autenticado'], 401);
        }

        $response = Http::withToken($user->gitlab_token)
            ->withOptions([
                'verify' => false,
            ])
            ->get("https://gitlab.com/api/v4/projects/$id/repository/branches");

        return response()->json($response->json());
    }

    public function getCommits($id, Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json(['error' => 'Usuário não autenticado'], 401);
            }

            $branch = $request->query('branch', 'main'); // 👈 AQUI

            $response = Http::withToken($user->gitlab_token)
                ->withOptions([
                    'verify' => false,
                ])
                ->get("https://gitlab.com/api/v4/projects/$id/repository/commits", [
                    'ref_name' => $branch,
                    'per_page' => 100
                ]);

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function index(Request $request)
    {
        $user = $request->user();

        $params = [];

        if ($request->type === 'owned') {
            $params = ['owned' => true];
        } elseif ($request->type === 'membership') {
            $params = ['membership' => true];
        } else {
            $params = [];
        }


        $response = Http::withOptions([
            'verify' => false // 
        ])->withToken($user->gitlab_token)
            ->get('https://gitlab.com/api/v4/projects', $params);

        return response()->json($response->json());
    }



    public function getProjectById($id, Request $request)
    {
        $user = $request->user();

        if (!$user->gitlab_token) {
            return response()->json([
                'error' => 'Usuário não autenticado ou sem token'
            ], 401);
        }

        $response = Http::withOptions([
            'verify' => false // 
        ])->withToken($user->gitlab_token)
            ->get("https://gitlab.com/api/v4/projects/$id");

        if (!$response->successful()) {
            return response()->json([
                'error' => 'Erro ao buscar projeto',
                'status' => $response->status(),
                'body' => $response->body()
            ], 500);
        }

        return response()->json($response->json());
    }
}
