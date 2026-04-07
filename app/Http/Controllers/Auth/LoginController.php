<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
     * Authenticate the user and start a session.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ], [
            'email.required' => 'O campo e-mail e obrigatorio.',
            'email.email' => 'O e-mail informado nao e valido.',
            'password.required' => 'O campo senha e obrigatorio.',
        ]);

        if (! Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Credenciais invalidas.',
            ], 401);
        }

        $request->session()->regenerate();

        return response()->json([
            'user' => Auth::user(),
        ], 200);
    }

    /**
     * Log the user out and invalidate the session.
     */
    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(null, 204);
    }
}
