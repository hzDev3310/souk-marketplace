<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SeparateSession
{
    public function handle(Request $request, Closure $next): Response
    {
        $path = $request->path();

        $isDashboard = str_starts_with($path, 'api')
            || str_starts_with($path, 'dashboard')
            || str_starts_with($path, 'sanctum');

        if ($isDashboard) {
            config([
                'session.cookie'        => 'souk_dashboard_session',
                'session.table'         => 'dashboard_sessions',
                'auth.defaults.guard'   => 'react_app',
            ]);
        } else {
            config([
                'session.cookie'        => 'souk_public_session',
                'session.table'         => 'sessions',
                'auth.defaults.guard'   => 'web',
            ]);
        }

        // The session Store (cookie name / table) is resolved with the config during
        // bootstrap — before this middleware runs. Drop the cached instance so the
        // *next* startSession rebuilds it from the path-specific config above.
        if (app()->bound('session')) {
            app('session')->forgetDrivers();
        }

        return $next($request);
    }
}
