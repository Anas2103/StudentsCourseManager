<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Allow access only to users whose role matches one of the given roles.
     * Usage: middleware('role:super_admin,admin')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (empty($roles) || in_array($user->role?->name, $roles)) {
            return $next($request);
        }

        return response()->json(['message' => 'Unauthorized. Insufficient permissions.'], 403);
    }
}
