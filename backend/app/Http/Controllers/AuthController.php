<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{

    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'provider' => 'local',
        ]);

        $token = $user->createToken('api_token')->plainTextToken;

        return response()->json([
            'message' => 'Register berhasil',
            'user'    => $user,
            'token'   => $token
        ]);
    }


    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Email atau password salah'], 401);
        }

        $token = $user->createToken('api_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'user'    => $user,
            'token'   => $token
        ]);
    }


    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }


   public function handleGoogleCallback()
{
    $googleUser = Socialite::driver('google')->stateless()->user();

    $user = User::updateOrCreate(
        ['email' => $googleUser->getEmail()],
        [
            'name'        => $googleUser->getName(),
            'provider'    => 'google',
            'provider_id' => $googleUser->getId(),
            'avatar'      => $googleUser->getAvatar(),
        ]
    );

    $token = $user->createToken('api_token')->plainTextToken;

    return redirect("http://localhost:5173/google/callback?token=$token&user=" . urlencode(json_encode($user)));

}



    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }


    public function redirectToGithub()
    {
        return Socialite::driver('github')->stateless()->redirect();
    }

    public function handleGithubCallback()
    {
        $githubUser = Socialite::driver('github')->stateless()->user();

        $user = User::updateOrCreate(
            ['email' => $githubUser->getEmail()],
            [
                'name'        => $githubUser->getName() ?? $githubUser->getNickname(),
                'provider'    => 'github',
                'provider_id' => $githubUser->getId(),
                'avatar'      => $githubUser->getAvatar(),
            ]
        );


        $token = $user->createToken('api_token')->plainTextToken;

        return redirect("http://localhost:5173/github/callback?token=$token&user=" . urlencode(json_encode($user)));
    }
}
