@extends('layouts.public')

@section('seo')
    <meta name="description" content="Browse all products on Souk AI marketplace.">
    <meta name="keywords" content="products, marketplace, shopping">
    <meta property="og:title" content="All Products - Souk AI">
    <meta property="og:url" content="{{ url()->current() }}">
@endsection

@section('content')
    @php
        $allProductsQuery = array_merge(request()->query(), ['category_id' => null]);
    @endphp

    <div class="mb-8">
        <h1 class="text-3xl md:text-5xl font-black text-foreground tracking-tight mb-2">{{ __('website.allProducts') ?? 'All Products' }}</h1>
        <p class="text-muted-foreground font-medium">{{ __('website.allProductsDesc') }}</p>
    </div>

    <div class="mb-6 lg:hidden">
        <button
            type="button"
            data-sidebar-open="all-products"
            class="inline-flex items-center gap-2 rounded-2xl border border-border/40 bg-card px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-foreground"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="6" y2="6"/><line x1="7" x2="17" y1="12" y2="12"/><line x1="10" x2="14" y1="18" y2="18"/></svg>
            {{ __('website.categories') }}
        </button>
    </div>

    <div
        data-sidebar-overlay="all-products"
        class="pointer-events-none fixed inset-0 z-[90] bg-black/50 opacity-0 transition-opacity duration-300 lg:hidden"
    >
        <div
            data-sidebar-panel="all-products"
            class="ml-auto h-full w-[88vw] max-w-sm overflow-y-auto bg-background p-4 transition-transform duration-300 translate-x-full"
        >
            <div class="mb-4 flex items-center justify-between">
                <h2 class="text-sm font-black uppercase tracking-[0.2em] text-foreground">{{ __('website.categories') }}</h2>
                <button type="button" data-sidebar-close="all-products" class="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/30 text-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 6-12 12"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>

            <div class="space-y-4">
                <div class="glass border border-border/40 rounded-[28px] p-5 premium-shadow">
                    <h3 class="text-xs font-black uppercase tracking-[0.2em] text-foreground mb-4">{{ __('website.priceRange') ?? 'Price Range' }}</h3>
                    <form method="GET" class="space-y-4">
                        @foreach(request()->query() as $key => $value)
                            @if(!in_array($key, ['min_price', 'max_price']))
                                <input type="hidden" name="{{ $key }}" value="{{ $value }}">
                            @endif
                        @endforeach

                        <div class="space-y-2">
                            <label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{{ __('website.min') ?? 'Min' }}</label>
                            <input type="number" name="min_price" value="{{ $minPrice }}" placeholder="0" class="w-full rounded-xl border border-border/40 bg-muted/30 px-4 py-3 text-sm font-bold text-foreground outline-none transition-colors focus:border-primary">
                        </div>

                        <div class="space-y-2">
                            <label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{{ __('website.max') ?? 'Max' }}</label>
                            <input type="number" name="max_price" value="{{ $maxPrice }}" placeholder="999999" class="w-full rounded-xl border border-border/40 bg-muted/30 px-4 py-3 text-sm font-bold text-foreground outline-none transition-colors focus:border-primary">
                        </div>

                        <button type="submit" class="w-full rounded-xl bg-primary py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-primaryemphasis">
                            {{ __('website.apply') ?? 'Apply' }}
                        </button>
                    </form>
                </div>

                <div class="glass border border-border/40 rounded-[28px] p-5 premium-shadow">
                    <h3 class="text-xs font-black uppercase tracking-[0.2em] text-foreground mb-4">{{ __('website.categories') }}</h3>
                    <nav class="space-y-2">
                        <a href="{{ route('public.all-products', $allProductsQuery) }}" class="flex items-center rounded-2xl px-3 py-3 transition-all {{ !$categoryId ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground' }}">
                            <span class="text-xs font-bold uppercase tracking-wider">{{ __('website.allCategories') ?? 'All Categories' }}</span>
                        </a>
                        @foreach($categories as $cat)
                            <div class="space-y-1">
                                <a href="{{ route('public.all-products', array_merge(request()->query(), ['category_id' => $cat->id])) }}" class="flex items-center justify-between rounded-2xl px-3 py-3 transition-all {{ $categoryId == $cat->id ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground' }}">
                                    <span class="text-xs font-bold uppercase tracking-wider">{{ $cat->{'name_'.app()->getLocale()} }}</span>
                                    @if($cat->children->count() > 0)
                                        <span class="text-[10px] font-black">{{ $cat->children->count() }}</span>
                                    @endif
                                </a>
                                @if($cat->children->count() > 0)
                                    <div class="ms-4 border-s border-border/40 ps-3 space-y-1">
                                        @foreach($cat->children as $child)
                                            <a href="{{ route('public.all-products', array_merge(request()->query(), ['category_id' => $child->id])) }}" class="flex items-center rounded-xl px-3 py-2 text-[11px] font-bold transition-all {{ $categoryId == $child->id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground' }}">
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
                    <h4 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">{{ __('website.sortBy') ?? 'Sort By' }}</h4>
                    <div class="space-y-2">
                        <a href="{{ route('public.all-products', array_merge(request()->query(), ['sort' => 'orders'])) }}" class="flex items-center justify-between rounded-xl px-3 py-2 text-[11px] font-bold transition-all {{ $sort === 'orders' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground' }}">{{ __('website.mostOrdered') ?? 'Most Ordered' }}</a>
                        <a href="{{ route('public.all-products', array_merge(request()->query(), ['sort' => 'latest'])) }}" class="flex items-center justify-between rounded-xl px-3 py-2 text-[11px] font-bold transition-all {{ $sort === 'latest' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground' }}">{{ __('website.newest') ?? 'Newest' }}</a>
                        <a href="{{ route('public.all-products', array_merge(request()->query(), ['sort' => 'alphabetic'])) }}" class="flex items-center justify-between rounded-xl px-3 py-2 text-[11px] font-bold transition-all {{ $sort === 'alphabetic' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground' }}">A - Z</a>
                        <a href="{{ route('public.all-products', array_merge(request()->query(), ['sort' => 'price_asc'])) }}" class="flex items-center justify-between rounded-xl px-3 py-2 text-[11px] font-bold transition-all {{ $sort === 'price_asc' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground' }}">{{ __('website.priceLow') ?? 'Price: Low to High' }}</a>
                        <a href="{{ route('public.all-products', array_merge(request()->query(), ['sort' => 'price_desc'])) }}" class="flex items-center justify-between rounded-xl px-3 py-2 text-[11px] font-bold transition-all {{ $sort === 'price_desc' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground' }}">{{ __('website.priceHigh') ?? 'Price: High to Low' }}</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-12 mb-8">
        <!-- Sidebar Filters -->
        <aside class="hidden space-y-8 lg:block">
            <!-- Price Filter -->
            <div class="glass border border-border/40 rounded-[40px] p-8 premium-shadow sticky top-32">
                <h3 class="text-xs font-black uppercase tracking-[0.2em] text-foreground mb-6 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-primary"></span>
                    {{ __('website.priceRange') ?? 'Price Range' }}
                </h3>
                
                <form method="GET" class="space-y-4">
                    @foreach(request()->query() as $key => $value)
                        @if(!in_array($key, ['min_price', 'max_price']))
                            <input type="hidden" name="{{ $key }}" value="{{ $value }}">
                        @endif
                    @endforeach
                    
                    <div class="space-y-2">
                        <label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{{ __('website.min') ?? 'Min' }}</label>
                        <input type="number" name="min_price" value="{{ $minPrice }}" placeholder="0" class="w-full px-4 py-2 bg-muted/30 border border-border/40 rounded-xl text-foreground font-bold text-sm focus:border-primary outline-none transition-colors">
                    </div>

                    <div class="space-y-2">
                        <label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{{ __('website.max') ?? 'Max' }}</label>
                        <input type="number" name="max_price" value="{{ $maxPrice }}" placeholder="999999" class="w-full px-4 py-2 bg-muted/30 border border-border/40 rounded-xl text-foreground font-bold text-sm focus:border-primary outline-none transition-colors">
                    </div>

                    <button type="submit" class="w-full py-2 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primaryemphasis transition-all">
                        {{ __('website.apply') ?? 'Apply' }}
                    </button>
                </form>
            </div>

            <!-- Category Filter -->
            <div class="glass border border-border/40 rounded-[40px] p-8 premium-shadow">
                <h3 class="text-xs font-black uppercase tracking-[0.2em] text-foreground mb-6 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-primary"></span>
                    {{ __('website.categories') }}
                </h3>
                
                <nav class="space-y-2">
                    <a href="{{ route('public.all-products', $allProductsQuery) }}" 
                       class="flex items-center p-3 rounded-2xl transition-all {{ !$categoryId ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground' }}">
                        <span class="text-xs font-bold uppercase tracking-wider">{{ __('website.allCategories') ?? 'All Categories' }}</span>
                    </a>
                    @foreach($categories as $cat)
                    <div class="space-y-1">
                        <a href="{{ route('public.all-products', array_merge(request()->query(), ['category_id' => $cat->id])) }}" 
                           class="flex items-center justify-between p-3 rounded-2xl transition-all {{ $categoryId == $cat->id ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground' }}">
                            <span class="text-xs font-bold uppercase tracking-wider">{{ $cat->{'name_'.app()->getLocale()} }}</span>
                            @if($cat->children->count() > 0)
                                <span class="text-[10px] font-black">{{ $cat->children->count() }}</span>
                            @endif
                        </a>
                        @if($cat->children->count() > 0)
                        <div class="ms-4 border-s border-border/40 ps-3 space-y-1">
                            @foreach($cat->children as $child)
                            <a href="{{ route('public.all-products', array_merge(request()->query(), ['category_id' => $child->id])) }}" class="flex items-center rounded-xl px-3 py-2 text-[11px] font-bold transition-all {{ $categoryId == $child->id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground' }}">
                                {{ $child->{'name_'.app()->getLocale()} }}
                            </a>
                            @endforeach
                        </div>
                        @endif
                    </div>
                    @endforeach
                </nav>
            </div>

            <!-- Sort Options -->
            <div class="bg-card glass border border-border/40 rounded-[40px] p-8 premium-shadow">
                <h4 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">{{ __('website.sortBy') ?? 'Sort By' }}</h4>
                <div class="space-y-2">
                    <a href="{{ route('public.all-products', array_merge(request()->query(), ['sort' => 'orders'])) }}" 
                       class="flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold transition-all {{ $sort === 'orders' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground' }}">
                        {{ __('website.mostOrdered') ?? 'Most Ordered' }}
                        @if($sort === 'orders')
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        @endif
                    </a>
                    <a href="{{ route('public.all-products', array_merge(request()->query(), ['sort' => 'latest'])) }}" 
                       class="flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold transition-all {{ $sort === 'latest' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground' }}">
                        {{ __('website.newest') ?? 'Newest' }}
                        @if($sort === 'latest')
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        @endif
                    </a>
                    <a href="{{ route('public.all-products', array_merge(request()->query(), ['sort' => 'alphabetic'])) }}" 
                       class="flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold transition-all {{ $sort === 'alphabetic' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground' }}">
                        A - Z
                        @if($sort === 'alphabetic')
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        @endif
                    </a>
                    <a href="{{ route('public.all-products', array_merge(request()->query(), ['sort' => 'price_asc'])) }}" 
                       class="flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold transition-all {{ $sort === 'price_asc' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground' }}">
                        {{ __('website.priceLow') ?? 'Price: Low to High' }}
                        @if($sort === 'price_asc')
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        @endif
                    </a>
                    <a href="{{ route('public.all-products', array_merge(request()->query(), ['sort' => 'price_desc'])) }}" 
                       class="flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold transition-all {{ $sort === 'price_desc' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground' }}">
                        {{ __('website.priceHigh') ?? 'Price: High to Low' }}
                        @if($sort === 'price_desc')
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        @endif
                    </a>
                </div>
            </div>
        </aside>

        <!-- Products Grid -->
        <div class="lg:col-span-3">
            @if($products->count() > 0)
            <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-8">
                  @foreach($products as $product)
                    <x-product-card :product="$product" :show-store="true" />
                @endforeach
            </div>

            <!-- Pagination -->
            <div class="mt-16 flex justify-center">
                {{ $products->appends(request()->query())->links() }}
            </div>
            @else
            <div class="py-20 text-center space-y-4 glass rounded-[40px] border border-border/40">
                <div class="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto text-muted-foreground/40">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M8 11h6"/></svg>
                </div>
                <p class="text-muted-foreground font-bold uppercase tracking-widest text-xs">{{ __('website.noProductsFound') ?? 'No products found' }}</p>
                <a href="{{ route('home') }}" class="inline-block px-8 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">{{ __('website.backHome') }}</a>
            </div>
            @endif
        </div>
    </div>
@endsection
