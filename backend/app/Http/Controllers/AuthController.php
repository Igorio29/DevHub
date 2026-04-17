<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    private function publicUserPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar,
        ];
    }

    public function show(Request $request)
    {
        return response()->json($this->publicUserPayload($request->user()));
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $avatar = $request->input('avatar');

        if (is_string($avatar) && trim($avatar) === '') {
            $request->merge(['avatar' => null]);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'avatar' => 'nullable|url|max:2048',
        ]);

        if ($request->name !== $user->name) {
            $user->custom_name = true;
        }

        if ($request->avatar !== $user->avatar) {
            $user->custom_avatar = true;
        }

        $user->update([
            'name' => $request->name,
            'avatar' => $request->avatar,
        ]);

        return response()->json($this->publicUserPayload($user));
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|max:255',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Credenciais inválidas'
            ], 401);
        }

        $user = Auth::user();
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $this->publicUserPayload($user),
            'token' => $token
        ]);
    }

    public function redirectAuthGitlab()
    {
        $sslVerify = Config::get('services.gitlab.ssl_verify', true);

        return Socialite::driver('gitlab')
            ->scopes(['api', 'read_user', 'read_api'])
            ->setHttpClient(new \GuzzleHttp\Client([
                'verify' => $sslVerify,
            ]))
            ->redirect();
    }

    public function handleGitlabCallback()
    {
        try {
            $sslVerify = Config::get('services.gitlab.ssl_verify', true);

            $gitlabUser = Socialite::driver('gitlab')
                ->setHttpClient(new \GuzzleHttp\Client([
                    'verify' => $sslVerify,
                ]))
                ->user();

            $gitlabToken = $gitlabUser->token;
            $email = $gitlabUser->getEmail() ?? ($gitlabUser->getId() . '@gitlab.com');

            $user = User::where('email', $email)->first();

            if (!$user) {
                $user = User::create([
                    'email' => $email,
                    'name' => $gitlabUser->getName()
                        ?: $gitlabUser->getNickname()
                        ?: 'Usuário GitLab',
                    'gitlab_id' => $gitlabUser->getId(),
                    'avatar' => $gitlabUser->getAvatar() ?? 'https://i.pravatar.cc/150',
                    'gitlab_token' => $gitlabToken,
                ]);
            } else {
                if (!$user->custom_name) {
                    $user->name = $gitlabUser->getName()
                        ?: $gitlabUser->getNickname()
                        ?: $user->name;
                }

                if (!$user->custom_avatar) {
                    $user->avatar = $gitlabUser->getAvatar() ?? $user->avatar;
                }

                $user->gitlab_token = $gitlabToken;
                $user->save();
            }

            $user->tokens()->delete();
            $token = $user->createToken('auth_token')->plainTextToken;
            $frontendUrl = rtrim((string) env('FRONTEND_URL'), '/');
            $safeUser = urlencode(json_encode($this->publicUserPayload($user)));

            return redirect("{$frontendUrl}/auth/gitlab/callback#token={$token}&user={$safeUser}");
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Falha na autenticação com GitLab'
            ], 500);
        }
    }
}
