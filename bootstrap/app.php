<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            // Use `web` (session + CSRF) for all /api/* routes so cookie auth matches /api/me and /api/admin/*.
            // The default `api` group only gets sessions when Sanctum treats the request as stateful (Referer/Origin + domain match), which often fails in dev.
            Route::middleware(['web'])
                ->prefix('api')
                ->group(base_path('routes/api.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prepend([\App\Http\Middleware\SeparateSession::class]);

        $middleware->statefulApi();

        // CSRF is skipped for the API (cookie-auth + role middleware already protect it).
        $middleware->validateCsrfTokens(except: ['api/*']);

        $middleware->web(append: [
            \App\Http\Middleware\SetLocale::class,
        ]);
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();