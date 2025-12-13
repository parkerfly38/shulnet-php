<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireAllRolesMiddleware
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

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Convert string roles to UserRole enums
        $requiredRoles = array_map(fn($role) => UserRole::from($role), $roles);

        // Check if user has all of the required roles
        if (!$user->hasAllRoles($requiredRoles)) {
            return response()->json([
                'message' => 'Insufficient permissions. You must have all of these roles: ' . implode(', ', array_map(fn($r) => $r->label(), $requiredRoles))
            ], 403);
        }

        return $next($request);
    }
}
