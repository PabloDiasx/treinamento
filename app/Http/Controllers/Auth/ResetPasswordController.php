<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class ResetPasswordController extends Controller
{
    /**
     * Reset the user's password.
     */
    public function reset(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'token.required' => 'O token de redefinicao e obrigatorio.',
            'email.required' => 'O campo e-mail e obrigatorio.',
            'email.email' => 'O e-mail informado nao e valido.',
            'password.required' => 'O campo senha e obrigatorio.',
            'password.min' => 'A senha deve ter pelo menos 8 caracteres.',
            'password.confirmed' => 'A confirmacao de senha nao confere.',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Senha redefinida com sucesso.',
            ], 200);
        }

        return response()->json([
            'message' => 'Nao foi possivel redefinir a senha.',
            'errors' => [
                'email' => [__($status)],
            ],
        ], 422);
    }
}
