<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Return a paginated list of all users.
     */
    public function index(): JsonResponse
    {
        $users = User::withCount('enrollments')
            ->latest()
            ->paginate(20);

        return response()->json($users);
    }

    /**
     * Create a new user (admin-managed).
     *
     * @todo Add form request validation in Phase 2.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role'     => ['nullable', 'string', 'in:student,instructor,admin'],
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return response()->json($user, 201);
    }

    /**
     * Return a single user with details.
     */
    public function show(User $user): JsonResponse
    {
        $user->loadCount(['enrollments']);

        return response()->json($user);
    }

    /**
     * Update an existing user.
     *
     * @todo Add form request validation in Phase 2.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name'     => ['sometimes', 'string', 'max:255'],
            'email'    => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['sometimes', 'string', 'min:8'],
            'role'     => ['nullable', 'string', 'in:student,instructor,admin'],
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json($user->fresh());
    }

    /**
     * Delete a user.
     *
     * @todo Add soft-delete and cascade checks in Phase 2.
     */
    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'message' => 'Usuario removido com sucesso.',
        ]);
    }
}
