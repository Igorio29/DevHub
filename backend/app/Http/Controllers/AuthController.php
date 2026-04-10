<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
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
        return Socialite::driver('gitlab')->stateless()->redirect();
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

            $email = $gitlabUser->getEmail()
                ?? $gitlabUser->getId() . '@gitlab.com';

            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $gitlabUser->getName() ?? $gitlabUser->getNickname(),
                    'gitlab_id' => $gitlabUser->getId(),
                    'avatar' => $gitlabUser->getAvatar(),
                ]
            );

            Auth::login($user);

            $token = $user->createToken('auth_token')->plainTextToken;

            return redirect("http://localhost:5173/auth/gitlab/callback?token=$token&user=" . urlencode(json_encode($user)));
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
