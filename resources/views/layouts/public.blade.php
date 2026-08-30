<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ app()->getLocale() == 'ar' ? 'rtl' : 'ltr' }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    @yield('seo')

    <title>{{ $title ?? 'Souk AI - Premium Marketplace' }}</title>
    <link rel="icon" type="image/png" href="/images/logo.png">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet">

    <!-- Scripts and Styles -->
    @vite(['resources/css/app.css'])

    @php
        $designSettings = settings_group('design', [
            'primary_color' => '#6366f1',
            'secondary_color' => '#f43f5e',
            'radius' => '28px'
        ]);

        // Static/public-facing site values (avoid dynamic settings)
        $websiteName = 'Souk AI';
        $websiteLogo = null;
        $footerAbout = __('website.footer.aboutText');
        $contactAddress = 'Tunis, Tunisia';
    @endphp

    <style>
        :root {
            --primary:
                {{ $designSettings['primary_color'] }}
            ;
            --secondary:
                {{ $designSettings['secondary_color'] }}
            ;
            --radius:
                {{ $designSettings['radius'] }}
            ;
        }

        @keyframes shimmer {
            0% {
                transform: translateX(-100%);
            }

            100% {
                transform: translateX(100%);
            }
        }

        .ai-shimmer {
            position: relative;
            overflow: hidden;
        }

        .ai-shimmer::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg,
                    transparent,
                    rgba(255, 255, 255, 0.4),
                    transparent);
            transform: translateX(-100%);
            animation: shimmer 3s infinite;
        }

        .btn-ai-search {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            box-shadow: 0 4px 15px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
        }

        .btn-ai-search:hover {
            box-shadow: 0 10px 25px -5px rgba(var(--primary-rgb), 0.4);
            filter: brightness(1.1);
        }
    </style>

    <!-- Head Scripts (Theme) -->
    <script>
        if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    </script>
</head>

<body
    class="relative antialiased bg-background text-foreground font-sans selection:bg-primary selection:text-white transition-colors duration-500 overflow-x-hidden">

    <!-- Navigation -->
     @include('components.navbar')

    <!-- Main Content -->
    <main class="min-h-screen pt-24 pb-32 lg:pb-20 container mx-auto px-4 md:px-12">
        @yield('content')
    </main>

    <!-- Footer -->
    <footer class="bg-card glass border-t mt-20 rounded-t-[60px] pt-16 pb-10">
        <div class="container mx-auto px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div class="space-y-6">
                <div class="flex items-center gap-2">
                    <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center overflow-hidden">
                        @if($websiteLogo)
                            <img src="{{ str_starts_with($websiteLogo, 'http') ? $websiteLogo : '/storage/' . $websiteLogo }}"
                                alt="{{ $websiteName }}" class="w-full h-full object-contain p-1.5 bg-white"
                                onerror="this.onerror=null; this.src='/images/default-placeholder.png';">
                        @else
                            <span class="text-white font-black text-xl">{{ strtoupper(substr($websiteName, 0, 1)) }}</span>
                        @endif
                    </div>
                    <span class="text-xl font-black tracking-tight text-foreground">{{ $websiteName }}</span>
                </div>
                <p class="text-sm text-muted-foreground font-medium leading-relaxed">
                    {{ $footerAbout }}
                </p>
            </div>

            <div>
                <h4 class="font-black text-xs uppercase tracking-[0.2em] mb-8 text-foreground">
                    {{ __('website.footer.explore') }}</h4>
                <ul class="space-y-4">
                    <li><a href="{{ route('public.all-products', ['sort' => 'latest']) }}"
                            class="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">{{ __('website.footer.latest') }}</a>
                    </li>
                    <li><a href="{{ route('public.all-stores') }}"
                            class="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">{{ __('website.footer.bestStores') }}</a>
                    </li>
                    <li><a href="{{ route('public.all-categories') }}"
                            class="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">{{ __('website.footer.categories') }}</a>
                    </li>
                </ul>
            </div>

            <div>
                <h4 class="font-black text-xs uppercase tracking-[0.2em] mb-8 text-foreground">
                    {{ __('website.footer.support') }}</h4>
                <ul class="space-y-4">
                    <li><a href="{{ route('public.about') }}"
                            class="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">{{ __('website.footer.aboutLink') }}</a>
                    </li>
                    <li><a href="{{ route('public.contact') }}"
                            class="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">{{ __('website.footer.contact') }}</a>
                    </li>
                    <li><a href="{{ route('public.terms') }}"
                            class="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">{{ __('website.footer.terms') }}</a>
                    </li>
                </ul>
            </div>

            <div>
                <h4 class="font-black text-xs uppercase tracking-[0.2em] mb-8 text-foreground">
                    {{ __('website.footer.contactInfo') }}</h4>
                <div class="space-y-4 text-sm font-bold text-muted-foreground">
                    <p>support@soukai.com</p>
                    <p>+216 00 000 000</p>
                    <p>{{ $contactAddress }}</p>
                </div>
            </div>
        </div>

        <div
            class="container mx-auto px-12 mt-16 pt-8 border-t border-border/20 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground">
            <p>{{ __('website.footer.rights') }}</p>
            <div class="flex gap-8">
                <a href="#">X (Twitter)</a>
                <a href="#">Instagram</a>
                <a href="#">Facebook</a>
            </div>
        </div>
    </footer>

    <!-- Mobile Search Overlay -->
    <div id="mobile-search-overlay"
        class="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl opacity-0 invisible transition-all duration-300">
        <div class="p-6 pt-12">
            <div class="flex items-center gap-4 mb-8">
                <button id="close-search"
                    class="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center text-muted-foreground active:scale-95 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </button>
                <div class="flex-1">
                    <h3 class="text-xl font-black text-foreground">Search</h3>
                </div>
            </div>

            <p class="mb-4 text-sm font-medium text-muted-foreground">{{ __('website.aiSearchInstruction') }}</p>

            <form action="{{ route('public.search') }}" method="GET" class="space-y-3">
                <div class="relative group">
                    <input type="text" name="q" id="mobile-search-input"
                        placeholder="{{ __('website.searchPlaceholder') }}"
                        class="w-full bg-card glass border border-border/40 rounded-[28px] px-8 py-5 text-lg font-bold text-foreground focus:border-primary outline-none transition-all shadow-2xl shadow-primary/5">
                    <button type="submit" name="search_mode" value="keyword"
                        class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                    </button>
                </div>
                <button type="submit" name="search_mode" value="semantic"
                    class="w-full rounded-2xl bg-primary px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-primaryemphasis">
                    {{ __('website.aiSearch') }}
                </button>
            </form>
        </div>
    </div>

    <!-- Mobile Bottom Navigation -->
    <!-- Mobile Bottom Navigation -->
    <!-- Mobile Bottom Navigation -->
     @include('components.bottomTab')

    <!-- Bottom safe area spacer -->
    <div class="lg:hidden h-20"></div>

    <x-toast />

    @stack('scripts')

    <script>
        // Capsule Navbar — smooth scroll-linked interpolation
        (function () {
            const shell = document.getElementById('navbar-shell');
            if (!shell) return;
            const DURATION = 120; // px over which the capsule transition completes
            let ticking = false;

            function updateNavbar() {
                const t = Math.min(window.scrollY / DURATION, 1);
                const ease = t < 0.5
                    ? 4 * t * t * t
                    : 1 - Math.pow(-2 * t + 2, 3) / 2; // easeInOutCubic

                // max-width: viewport width (in rem) → 64rem
                const fullRem = Math.ceil(window.innerWidth / 16) + 2;
                shell.style.marginTop         = (ease * 16) + 'px';
                shell.style.marginLeft        = 'auto';
                shell.style.marginRight       = 'auto';
                shell.style.borderRadius       = (ease * 9999) + 'px';
                shell.style.maxWidth           = (fullRem - ease * (fullRem - 64)) + 'rem';
                shell.style.boxShadow          = ease < 0.01
                    ? 'none'
                    : `0 ${10 * ease}px ${15 * ease}px -${3 * ease}px rgba(0,0,0,${0.08 * ease}), 0 ${4 * ease}px ${6 * ease}px -${4 * ease}px rgba(0,0,0,${0.05 * ease})`;
                shell.style.borderColor        = `rgba(100,116,139,${0.12 * ease})`;
                shell.style.backdropFilter     = `blur(${16 * ease}px)`;
                shell.style.WebkitBackdropFilter = `blur(${16 * ease}px)`;

                // Dark mode background
                const isDark = document.documentElement.classList.contains('dark');
                const lightBg = `rgba(255,255,255,${0.7 + 0.15 * ease})`;
                const darkBg  = `rgba(15,23,42,${0.7 + 0.15 * ease})`;
                shell.style.background = isDark ? darkBg : lightBg;

                ticking = false;
            }

            window.addEventListener('scroll', function () {
                if (!ticking) {
                    requestAnimationFrame(updateNavbar);
                    ticking = true;
                }
            }, { passive: true });

            updateNavbar();
        })();

        const themeToggleBtn = document.getElementById('theme-toggle');

        themeToggleBtn.addEventListener('click', function () {
            // Toggle theme
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
            // Re-sync navbar background for the new theme
            const shell = document.getElementById('navbar-shell');
            if (shell && shell.style.background) {
                const isDark = document.documentElement.classList.contains('dark');
                const t = Math.min(window.scrollY / 120, 1);
                shell.style.background = isDark
                    ? `rgba(15,23,42,${0.7 + 0.15 * t})`
                    : `rgba(255,255,255,${0.7 + 0.15 * t})`;
            }
        });

        // Mobile Search Logic
        const openSearchBtn = document.getElementById('open-mobile-search');
        const closeSearchBtn = document.getElementById('close-search');
        const searchOverlay = document.getElementById('mobile-search-overlay');
        const searchInput = document.getElementById('mobile-search-input');

        openSearchBtn.addEventListener('click', () => {
            searchOverlay.classList.remove('invisible', 'opacity-0');
            searchOverlay.classList.add('visible', 'opacity-100');
            // Small delay to ensure the overlay is transitioning before focusing
            setTimeout(() => searchInput.focus(), 300);
        });

        closeSearchBtn.addEventListener('click', () => {
            searchOverlay.classList.add('invisible', 'opacity-0');
            searchOverlay.classList.remove('visible', 'opacity-100');
            searchInput.blur();
        });

        const openSidebar = (name) => {
            const overlay = document.querySelector(`[data-sidebar-overlay="${name}"]`);
            const panel = document.querySelector(`[data-sidebar-panel="${name}"]`);
            if (!overlay || !panel) return;

            overlay.classList.remove('pointer-events-none', 'opacity-0');
            panel.classList.remove('translate-x-full');
            document.body.classList.add('overflow-hidden');
        };

        const closeSidebar = (name) => {
            const overlay = document.querySelector(`[data-sidebar-overlay="${name}"]`);
            const panel = document.querySelector(`[data-sidebar-panel="${name}"]`);
            if (!overlay || !panel) return;

            overlay.classList.add('pointer-events-none', 'opacity-0');
            panel.classList.add('translate-x-full');
            document.body.classList.remove('overflow-hidden');
        };

        document.querySelectorAll('[data-sidebar-open]').forEach((button) => {
            button.addEventListener('click', () => openSidebar(button.dataset.sidebarOpen));
        });

        document.querySelectorAll('[data-sidebar-close]').forEach((button) => {
            button.addEventListener('click', () => closeSidebar(button.dataset.sidebarClose));
        });

        document.querySelectorAll('[data-sidebar-overlay]').forEach((overlay) => {
            overlay.addEventListener('click', (event) => {
                if (event.target === overlay) {
                    closeSidebar(overlay.dataset.sidebarOverlay);
                }
            });
        });
    </script>
</body>

</html>
