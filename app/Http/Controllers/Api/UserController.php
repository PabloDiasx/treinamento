<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Return the currently authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    /**
     * Update the authenticated user's profile.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'bio' => ['nullable', 'string', 'max:1000'],
            'avatar_url' => ['nullable', 'string', 'url', 'max:500'],
        ], [
            'name.max' => 'O nome nao pode ter mais de 255 caracteres.',
            'email.email' => 'O e-mail informado nao e valido.',
            'email.unique' => 'Este e-mail ja esta em uso.',
            'bio.max' => 'A biografia nao pode ter mais de 1000 caracteres.',
            'avatar_url.url' => 'A URL do avatar nao e valida.',
            'avatar_url.max' => 'A URL do avatar nao pode ter mais de 500 caracteres.',
        ]);

        $user->update($validated);

        return response()->json($user->fresh());
    }

    /**
     * Update the authenticated user's password.
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'current_password.required' => 'A senha atual e obrigatoria.',
            'password.required' => 'A nova senha e obrigatoria.',
            'password.min' => 'A nova senha deve ter pelo menos 8 caracteres.',
            'password.confirmed' => 'As senhas nao coincidem.',
        ]);

        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'A senha atual esta incorreta.',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Senha alterada com sucesso.']);
    }
}
