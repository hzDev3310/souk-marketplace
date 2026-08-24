<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>Souk AI - Fresh Start</title>
        <link rel="icon" type="image/png" href="/images/logo.png">
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])

        @php
            $designSettings = settings_group('design', [
                'primary_color' => '#6366f1',
                'secondary_color' => '#f43f5e',
                'radius' => '28px'
            ]);
        @endphp

        <style>
            :root {
                --primary: {{ $designSettings['primary_color'] }};
                --secondary: {{ $designSettings['secondary_color'] }};
                --radius: {{ $designSettings['radius'] }};
            }
        </style>
    </head>
    <body class="antialiased bg-background text-foreground transition-colors duration-500 overflow-x-hidden">
        <div id="react-root"></div>
    </body>
</html>