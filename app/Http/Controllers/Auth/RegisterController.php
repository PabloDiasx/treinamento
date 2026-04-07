<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class RegisterController extends Controller
{
    /**
     * Register a new user account.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'name.required' => 'O campo nome e obrigatorio.',
            'name.max' => 'O nome nao pode ter mais de 255 caracteres.',
            'email.required' => 'O campo e-mail e obrigatorio.',
            'email.email' => 'O e-mail informado nao e valido.',
            'email.unique' => 'Este e-mail ja esta em uso.',
            'password.required' => 'O campo senha e obrigatorio.',
            'password.min' => 'A senha deve ter pelo menos 8 caracteres.',
            'password.confirmed' => 'A confirmacao de senha nao confere.',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => UserRole::Student->value,
        ]);

        Auth::login($user);

        return response()->json([
            'user' => $user,
        ], 201);
    }
}
