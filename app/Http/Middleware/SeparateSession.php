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
                'session.cookie' => 'souk_dashboard_session',
                'session.table'  => 'dashboard_sessions',
            ]);
        } else {
            config([
                'session.cookie' => 'souk_public_session',
                'session.table'  => 'sessions',
            ]);
        }

        return $next($request);
    }
}
