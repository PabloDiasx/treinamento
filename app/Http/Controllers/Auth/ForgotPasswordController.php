<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

class ForgotPasswordController extends Controller
{
    /**
     * Send a password reset link to the given email.
     */
    public function sendResetLink(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
        ], [
            'email.required' => 'O campo e-mail e obrigatorio.',
            'email.email' => 'O e-mail informado nao e valido.',
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => 'Link de redefinicao de senha enviado para seu e-mail.',
            ], 200);
        }

        return response()->json([
            'message' => 'Nao foi possivel enviar o link de redefinicao de senha.',
            'errors' => [
                'email' => [__($status)],
            ],
        ], 422);
    }
}
