<nav id="main-header" class="fixed top-0 left-0 right-0 z-50 w-full">
    <div id="navbar-shell"
        class="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/30"
        style="max-width:100%; margin-top:0; margin-left:0; margin-right:0; border-radius:0;">
        <div class="max-w-7xl mx-auto px-4 py-3 md:px-6 lg:px-8">
            <div class="flex items-center justify-between gap-4">

                <!-- Logo -->
                <a href="/" class="flex items-center gap-3 group shrink-0">
                    <div
                        class="relative w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform duration-300 bg-white dark:bg-slate-800">
                        <img src="/images/logo.png" alt="Souk AI"
                            class="w-full h-full object-cover">
                      
                    </div>
                    <span
                        class="text-xl font-black tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Souk AI</span>
                </a>

                <!-- Search Bar - Desktop (Segmented Pill) -->
                <form action="{{ route('public.search') }}" method="GET"
                    class="hidden lg:flex items-stretch flex-1 max-w-2xl h-11">
                    <div
                        class="search-pill flex items-stretch w-full rounded-full  bg-white dark:bg-slate-800 shadow-sm overflow-hidden">

                        <!-- Left Segment — Search Input -->
                        <div
                            class="search-pill-left relative flex-1 min-w-0 flex items-center    rounded-l-full">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="2.5"
                                    viewBox="0 0 24 24">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.3-4.3" />
                                </svg>
                            </div>
                            <input type="text" name="q" value="{{ request('q') }}"
                                placeholder="Search for wallpapers, art, designs..."
                                class="w-full pl-11 pr-4 py-2 bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none rounded-l-full">
                        </div>

                        <!-- Middle Segment — Keyword Search Button -->
                        <button type="submit" name="search_mode" value="keyword"
                            class="px-5 flex items-center justify-center font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-950 !z-100 !rounded-none !rounded-l-full transition-colors border-l border-r border-slate-300/50 dark:border-slate-800">
                            Search
                        </button>

                        <!-- Right Segment — AI Button -->
                        <button type="submit" name="search_mode" value="semantic"
                            class="relative shrink-0 flex items-center gap-1.5 px-5 !rounded-r-full !rounded-l-none bg-gradient-to-r from-indigo-500 to-purple-500 text-[11px] font-extrabold uppercase tracking-wider text-white hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all duration-300 overflow-hidden group/ai">
                            <span class="relative z-10 flex items-center gap-1.5">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5"
                                    viewBox="0 0 24 24">
                                    <path
                                        d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                                    <path d="M5 3v4" />
                                    <path d="M19 17v4" />
                                    <path d="M3 5h4" />
                                    <path d="M17 19h4" />
                                </svg>
                                AI
                            </span>
                            <span
                                class="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover/ai:opacity-100 transition-opacity duration-300"></span>
                        </button>

                    </div>
                </form>
                <!-- Right Actions -->
                <div class="flex items-center gap-3 md:gap-4">

                    <!-- Mobile Search Toggle -->
                    <button id="open-mobile-search"
                        class="lg:hidden w-10 h-10 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-all border border-slate-200/50 dark:border-slate-700/30">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                    </button>

                    <!-- Desktop Actions (Favorites & Cart) -->
                    <div class="hidden lg:flex items-center gap-2">
                        <a href="/favorites"
                            class="relative w-10 h-10 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-500 transition-all border border-slate-200/50 dark:border-slate-700/30 group">
                            <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none"
                                stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                                <path
                                    d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                            </svg>
                            <span id="fav-count-desktop"
                                class="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-lg shadow-rose-500/30 hidden">0</span>
                        </a>
                        <a href="/cart"
                            class="relative w-10 h-10 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 transition-all border border-slate-200/50 dark:border-slate-700/30 group">
                            <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none"
                                stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                                <path d="M3 6h18" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                            <span id="cart-count-desktop"
                                class="absolute -top-1 -right-1 bg-indigo-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-lg shadow-indigo-500/30 hidden">0</span>
                        </a>
                    </div>

                    <!-- Controls Group (Theme & Lang) -->
                    <div
                        class="flex items-center ! !rounded-full gap-1.5 px-2 py-1.5 bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/30 rounded-2xl backdrop-blur-sm">
                        <!-- Theme Toggle -->
                        <button id="theme-toggle"
                            class="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                            <svg id="sun-icon" class="hidden dark:block w-4 h-4" fill="none" stroke="currentColor"
                                stroke-width="2.5" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="4" />
                                <path d="M12 2v2" />
                                <path d="M12 20v2" />
                                <path d="m4.93 4.93 1.41 1.41" />
                                <path d="m17.66 17.66 1.41 1.41" />
                                <path d="M2 12h2" />
                                <path d="M20 12h2" />
                                <path d="m6.34 17.66-1.41 1.41" />
                                <path d="m19.07 4.93-1.41 1.41" />
                            </svg>
                            <svg id="moon-icon" class="block dark:hidden w-4 h-4" fill="none" stroke="currentColor"
                                stroke-width="2.5" viewBox="0 0 24 24">
                                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                            </svg>
                        </button>

                        <div class="w-px h-5 bg-slate-300/40 dark:bg-slate-600/40"></div>

                        <!-- Language Switcher -->
                        <div class="relative group">
                            <button
                                class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                {{ app()->getLocale() }}
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3"
                                    viewBox="0 0 24 24">
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </button>
                            <div
                                class="absolute top-full right-0 mt-2 w-36 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0 shadow-xl shadow-black/5 z-50">
                                @foreach(['en' => 'English', 'fr' => 'Français', 'ar' => 'العربية'] as $code => $name)
                                    <a href="{{ route('lang.switch', $code) }}"
                                        class="flex items-center justify-between px-3 py-2.5 rounded-xl text-[11px] font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors {{ app()->getLocale() == $code ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20' : 'text-slate-600 dark:text-slate-300' }}">
                                        {{ $name }}
                                        @if(app()->getLocale() == $code)
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="3"
                                                viewBox="0 0 24 24">
                                                <path d="M20 6 9 17l-5-5" />
                                            </svg>
                                        @endif
                                    </a>
                                @endforeach
                            </div>
                        </div>
                    </div>

                    <!-- Auth / Profile -->
                    @auth
                        <div class="relative group">
                            <button
                                class="flex items-center gap-2.5 px-3.5 py-2.5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border border-indigo-200/40 dark:border-indigo-400/20 rounded-2xl hover:shadow-md hover:shadow-indigo-500/10 transition-all">
                                <div
                                    class="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-500/30">
                                    {{ substr(Auth::user()->name, 0, 1) }}
                                </div>
                                <span
                                    class="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">{{ Auth::user()->name }}</span>
                                <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" stroke-width="3"
                                    viewBox="0 0 24 24">
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </button>
                            <div
                                class="absolute top-full right-0 mt-2 w-56 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0 shadow-xl shadow-black/5 z-50">
                                <a href="{{ route('public.profile') }}"
                                    class="flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5"
                                        viewBox="0 0 24 24">
                                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    Edit Profile
                                </a>
                                <a href="{{ route('public.orders') }}"
                                    class="flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5"
                                        viewBox="0 0 24 24">
                                        <rect width="18" height="18" x="3" y="3" rx="2" />
                                        <path d="M12 8v8" />
                                        <path d="M8 12h8" />
                                    </svg>
                                    My Orders
                                </a>
                                <div class="h-px bg-slate-200/50 dark:bg-slate-700/50 my-1.5 mx-3"></div>
                                <form action="{{ route('logout') }}" method="POST">
                                    @csrf
                                    <button type="submit"
                                        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5"
                                            viewBox="0 0 24 24">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x1="21" x2="9" y1="12" y2="12" />
                                        </svg>
                                        Logout
                                    </button>
                                </form>
                            </div>
                        </div>
                    @else
                        <a href="/login"
                            class="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300 active:scale-95 whitespace-nowrap">
                            Login
                        </a>
                    @endauth

                </div>
            </div>
        </div>
    </div>
</nav>