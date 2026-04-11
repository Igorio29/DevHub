<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function show(Request $request)
    {
        return response()->json([
            "name" => $request->user()->name,
            "avatar" => $request->user()->avatar
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        

        $request->validate([
            'name' => 'required|string|max:255',
            'avatar' => 'nullable|string'
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

        return response()->json($user);
    }

    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Credenciais inválidas'
            ], 401);
        }

        $user = Auth::user();

        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    public function redirectAuthGitlab()
    {
        return Socialite::driver('gitlab')->scopes(['api', 'read_user', 'read_api'])->stateless()->redirect();
    }

    public function handleGitlabCallback()
    {
        try {
            $gitlabUser = Socialite::driver('gitlab')
                ->stateless()
                ->setHttpClient(new \GuzzleHttp\Client([
                    'verify' => false,
                ]))
                ->user();

            $gitlab_token = $gitlabUser->token;
            $email = $gitlabUser->getEmail()
                ?? $gitlabUser->getId() . '@gitlab.com';

            $user = User::where('email', $email)->first();

            if (!$user) {
                // novo usuário
                $user = User::create([
                    'email' => $email,
                    'name' => $gitlabUser->getName()
                        ?: $gitlabUser->getNickname()
                        ?: 'Usuário GitLab',
                    'gitlab_id' => $gitlabUser->getId(),
                    'avatar' => $gitlabUser->getAvatar() ?? 'https://i.pravatar.cc/150',
                    'gitlab_token' => $gitlab_token,
                ]);
            } else {
                // 🔥 atualização inteligente
                if (!$user->custom_name) {
                    $user->name = $gitlabUser->getName()
                        ?: $gitlabUser->getNickname()
                        ?: $user->name;
                }

                if (!$user->custom_avatar) {
                    $user->avatar = $gitlabUser->getAvatar() ?? $user->avatar;
                }
                $user->gitlab_token = $gitlab_token;
                $user->save();
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return redirect("http://localhost:5173/auth/gitlab/callback?token=$token&user=" . urlencode(json_encode($user)));
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
