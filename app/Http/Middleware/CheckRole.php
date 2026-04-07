<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Acesso nao autorizado.'], 403);
        }

        $userRole = $user->role instanceof UserRole
            ? $user->role
            : UserRole::tryFrom($user->role);

        $allowedRoles = array_map(
            fn (string $role) => UserRole::tryFrom($role),
            $roles
        );

        $allowedRoles = array_filter($allowedRoles);

        if (! $userRole || ! in_array($userRole, $allowedRoles, true)) {
            return response()->json(['message' => 'Acesso nao autorizado.'], 403);
        }

        return $next($request);
    }
}
