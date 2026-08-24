@extends('layouts.public')

@section('seo')
    @if(filled($query))
        <title>Search Results for "{{ $query }}" - Souk AI</title>
        <meta name="description" content="Search results for {{ $query }} on Souk AI premium marketplace.">
    @else
        <title>{{ __('website.allProducts') }} - Souk AI</title>
        <meta name="description" content="{{ __('website.allProductsDesc') }}">
    @endif
@endsection

@section('content')
    @php
        $searchCategoryUrl = function ($id) use ($query, $sortBy, $promoOnly, $searchMode, $categoryId) {
            $params = [
                'q' => $query,
                'search_mode' => $searchMode,
                'category_id' => $categoryId == $id ? null : $id,
                'promo' => $promoOnly ? 1 : null,
                'sort' => $sortBy,
                'min_price' => request('min_price'),
                'max_price' => request('max_price'),
            ];

            return route('public.search', array_filter($params, fn ($v) => filled($v)));
        };
    @endphp

    <div class="mb-6 lg:hidden flex items-center gap-3">
        <button
            type="button"
            data-sidebar-open="search-page"
            class="inline-flex items-center gap-2 rounded-2xl border border-border/40 bg-card px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-foreground"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            {{ __('website.search.filterBy') }}
        </button>
        <span class="inline-flex items-center gap-2 rounded-2xl border border-border/40 bg-card px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
            {{ $products->total() }} {{ __('website.items') }}
        </span>
    </div>

    <div data-sidebar-overlay="search-page" class="pointer-events-none fixed inset-0 z-[90] bg-black/50 opacity-0 transition-opacity duration-300 lg:hidden">
        <div data-sidebar-panel="search-page" class="ml-auto h-full w-[88vw] max-w-sm overflow-y-auto bg-background p-4 transition-transform duration-300 translate-x-full">
            <div class="mb-4 flex items-center justify-between">
                <h2 class="text-sm font-black uppercase tracking-[0.2em] text-foreground">{{ __('website.search.filterBy') }}</h2>
                <button type="button" data-sidebar-close="search-page" class="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/30 text-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 6-12 12"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>

            @if($products->count() > 0)
            <!-- Filter & Sort Card (Mobile / Tablet) -->
            <x-search-filters :query="$query" :search-mode="$searchMode" :category-id="$categoryId" :promo-only="$promoOnly" :sort-by="$sortBy" />
            <div class="h-px bg-border/40 my-5"></div>
            @endif

            <div class="glass border border-border/40 rounded-[28px] p-5 premium-shadow mb-4">
                    <h3 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">{{ __('website.categories') }}</h3>
                    <nav class="space-y-2">
                        @foreach($categories as $cat)
                        <div class="space-y-1">
                            <a href="{{ $searchCategoryUrl($cat->id) }}" class="flex items-center justify-between rounded-2xl px-3 py-3 transition-all {{ $categoryId == $cat->id ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground' }}">
                                <span class="text-xs font-bold uppercase tracking-wider">{{ $cat->{'name_'.app()->getLocale()} }}</span>
                                @if($categoryId == $cat->id)
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                @elseif($cat->children->count() > 0)
                                    <span class="text-[10px] font-black">{{ $cat->children->count() }}</span>
                                @endif
                            </a>
                            @if($cat->children->count() > 0)
                            <div class="ms-4 border-s border-border/40 ps-3 space-y-1">
                                @foreach($cat->children as $child)
                                <a href="{{ $searchCategoryUrl($child->id) }}" class="flex items-center justify-between rounded-xl px-3 py-2 text-[11px] font-bold transition-all {{ $categoryId == $child->id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground' }}">
                                    {{ $child->{'name_'.app()->getLocale()} }}
                                </a>
                                @endforeach
                            </div>
                            @endif
                        </div>
                        @endforeach
                    </nav>
                </div>

                <div class="bg-card glass border border-border/40 rounded-[28px] p-5 premium-shadow">
                    <h4 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">{{ __('website.search.tips') }}</h4>
                    <ul class="space-y-2 ps-4 text-[11px] font-bold text-muted-foreground list-disc">
                        <li>{{ __('website.search.tip1') }}</li>
                        <li>{{ __('website.search.tip2') }}</li>
                        <li>{{ __('website.search.tip3') }}</li>
                    </ul>
                </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-12">
        <!-- Sidebar -->
        <aside class="hidden space-y-10 lg:block">
            <div class="glass border border-border/40 rounded-[40px] p-8 premium-shadow sticky top-32">
                <h3 class="text-xs font-black uppercase tracking-[0.2em] text-foreground mb-8 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-primary"></span>
                    {{ __('website.categories') }}
                </h3>
                
                <nav class="space-y-2">
                    @foreach($categories as $cat)
                    <div class="space-y-1">
                        <a href="{{ $searchCategoryUrl($cat->id) }}"
                           class="flex items-center justify-between group p-3 rounded-2xl border transition-all {{ $categoryId == $cat->id ? 'bg-primary/10 text-primary border-primary/20' : 'border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground' }}">
                            <span class="text-xs font-bold uppercase tracking-wider">{{ $cat->{'name_'.app()->getLocale()} }}</span>
                            @if($categoryId == $cat->id)
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            @elseif($cat->children->count() > 0)
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:rotate-90"><path d="m9 18 6-6-6-6"/></svg>
                            @endif
                        </a>
                        @if($cat->children->count() > 0)
                        <div class="ms-4 border-s border-border/40 ps-3 space-y-1">
                            @foreach($cat->children as $child)
                            <a href="{{ $searchCategoryUrl($child->id) }}" class="flex items-center justify-between rounded-xl px-3 py-2 text-[11px] font-bold transition-all {{ $categoryId == $child->id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground' }}">
                                {{ $child->{'name_'.app()->getLocale()} }}
                            </a>
                            @endforeach
                        </div>
                        @endif
                    </div>
                    @endforeach
                </nav>
            </div>
            
         
        </aside>

        <!-- Main Content -->
        <div class="lg:col-span-3">
            <div class="mb-16">
                <div class="mb-5 rounded-[28px] border border-border/40 bg-card/60 p-4 text-sm font-medium text-muted-foreground">
                    {{ __('website.aiSearchInstruction') }}
                </div>
                <nav class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">
                    <a href="/" class="hover:text-primary transition-colors">{{ __('website.nav.home') }}</a>
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    <span class="text-foreground">{{ filled($query) ? __('website.search.resultsFor') : __('website.allProducts') }}</span>
                </nav>

                <h1 class="text-3xl md:text-5xl font-black text-foreground tracking-tight mb-4">
                    @if(filled($query))
                        {{ __('website.search.resultsFor') }} <span class="text-primary italic">"{{ $query }}"</span>
                    @else
                        <span class="text-primary italic">{{ __('website.allProducts') }}</span>
                    @endif
                </h1>
                <p class="text-muted-foreground font-medium">
                    {{ __('website.search.found') }} {{ $products->total() }} {{ __('website.search.matching') }}
                </p>

                @php
                    $activeCategory = $categories->firstWhere('id', $categoryId)
                        ?? $categories->flatMap->children->firstWhere('id', $categoryId);
                @endphp
                @if($activeCategory)
                <div class="mt-5">
                    <a href="{{ route('public.search', array_filter(['q' => $query, 'search_mode' => $searchMode, 'promo' => $promoOnly ? 1 : null, 'sort' => $sortBy], fn ($v) => filled($v))) }}"
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-black uppercase tracking-wider text-primary hover:bg-primary/20 transition-all">
                        {{ $activeCategory->{'name_'.app()->getLocale()} }}
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </a>
                </div>
                @endif
            </div>

            @if($products->count() > 0)

            <!-- Filter & Sort Card (Desktop) -->
            <div class="hidden lg:block mb-10">
                <x-search-filters :query="$query" :search-mode="$searchMode" :category-id="$categoryId" :promo-only="$promoOnly" :sort-by="$sortBy" />
            </div>

            <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                 @foreach($products as $product)
                    <x-product-card :product="$product" :show-store="true" />
                @endforeach
            </div>

            <div class="mt-16 flex justify-center">
                {{ $products->appends(request()->only(['q', 'search_mode', 'category_id', 'promo', 'sort', 'min_price', 'max_price']))->links() }}
            </div>
            @else
            <div class="py-20 text-center space-y-6 glass rounded-[40px] border border-border/40">
                <div class="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto text-muted-foreground/40">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M8 11h6"/></svg>
                </div>
                <div class="space-y-2">
                    <h3 class="text-2xl font-black text-foreground">{{ __('website.search.noMatches') }}</h3>
                    <p class="text-muted-foreground font-medium">
                        @if(filled($query))
                            {{ __('website.search.noMatchesDesc') }} "{{ $query }}".
                        @endif
                    </p>
                </div>
                <a href="/" class="inline-block px-8 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primaryemphasis transition-all">{{ __('website.search.explore') }}</a>
            </div>
            @endif
        </div>
    </div>
@endsection
