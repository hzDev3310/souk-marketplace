@extends('layouts.public')

@section('seo')
    <meta name="description" content="Explore products in {{ $category->{'name_'.app()->getLocale()} }} on Souk AI.">
    <meta name="keywords" content="{{ $category->{'name_'.app()->getLocale()} }}, marketplace, souk">
    <meta property="og:title" content="{{ $category->{'name_'.app()->getLocale()} }} - Souk AI">
    <meta property="og:description" content="Explore products in {{ $category->{'name_'.app()->getLocale()} }} on Souk AI.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url()->current() }}">
@endsection

@section('content')
    <!-- Category Information Section (Full Width Hero) -->
    <section class="relative rounded-[40px] overflow-hidden mb-12 glass border border-border/40">
        {{-- Cover Image or Gradient Background --}}
        <div class="relative h-40 md:h-56">
            @if($category->cover)
                <img src="{{ image_url($category->cover) }}" class="w-full h-full object-cover"
                    onerror="this.onerror=null; this.src='/images/default-placeholder.png';">
            @else
                <div class="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/10 to-muted"></div>
            @endif
            <div class="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent"></div>
        </div>
        
        {{-- Category Info --}}
        <div class="relative -mt-12 md:-mt-16 px-6 md:px-10 pb-8">
            <div class="flex items-center gap-4">
                {{-- Icon or Logo --}}
                <div class="w-20 h-20 md:w-24 md:h-24 rounded-[28px] overflow-hidden border-4 border-background bg-card shadow-xl flex-shrink-0 flex items-center justify-center">
                    @if($category->icon)
                        @if(str_starts_with($category->icon, 'http') || file_exists(public_path($category->icon)))
                            <img src="{{ image_url($category->icon) }}" alt="{{ $category->{'name_'.app()->getLocale()} }}" class="w-full h-full object-cover"
                                onerror="this.onerror=null; this.src='/images/default-placeholder.png';">
                            <span style="display:none" class="w-full h-full items-center justify-center bg-primary/10 text-primary text-3xl font-black">{!! lucide_icon($category->icon, 'w-10 h-10') !!}</span>
                        @else
                            <div class="w-full h-full bg-primary/10 flex items-center justify-center">
                                <span class="text-primary">{!! lucide_icon($category->icon, 'w-10 h-10') !!}</span>
                            </div>
                        @endif
                    @else
                        <div class="w-full h-full bg-primary/10 flex items-center justify-center">
                            <span class="text-3xl font-black text-primary">{{ substr($category->{'name_'.app()->getLocale()}, 0, 1) }}</span>
                        </div>
                    @endif
                </div>
                
                {{-- Category Details --}}
                <div class="flex-1 pt-4">
                    {{-- Breadcrumb --}}
                    <nav class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                        <a href="/" class="hover:text-primary transition-colors">{{ __('website.nav.home') }}</a>
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        <a href="{{ route('public.all-categories') }}" class="hover:text-primary transition-colors">{{ __('website.categories') }}</a>
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        <span class="text-primary">{{ $category->{'name_'.app()->getLocale()} }}</span>
                    </nav>
                    
                    <h1 class="text-2xl md:text-4xl font-black text-foreground tracking-tight">{{ $category->{'name_'.app()->getLocale()} }}</h1>
                    <p class="text-sm text-muted-foreground font-medium mt-1">{{ $products->total() }} {{ __('website.products') }}</p>
                </div>
            </div>
        </div>
    </section>

    <div class="mb-6 lg:hidden">
        <button
            type="button"
            data-sidebar-open="category-page"
            class="inline-flex items-center gap-2 rounded-2xl border border-border/40 bg-card px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-foreground"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="6" y2="6"/><line x1="7" x2="17" y1="12" y2="12"/><line x1="10" x2="14" y1="18" y2="18"/></svg>
            {{ __('website.exploreCategories') }}
        </button>
    </div>

    <div data-sidebar-overlay="category-page" class="pointer-events-none fixed inset-0 z-[90] bg-black/50 opacity-0 transition-opacity duration-300 lg:hidden">
        <div data-sidebar-panel="category-page" class="ml-auto h-full w-[88vw] max-w-sm overflow-y-auto bg-background p-4 transition-transform duration-300 translate-x-full">
            <div class="mb-4 flex items-center justify-between">
                <h2 class="text-sm font-black uppercase tracking-[0.2em] text-foreground">{{ __('website.exploreCategories') }}</h2>
                <button type="button" data-sidebar-close="category-page" class="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/30 text-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 6-12 12"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>

            <div class="space-y-4">
                <div class="glass border border-border/40 rounded-[28px] p-5 premium-shadow">
                    <nav class="space-y-2">
                        @foreach($categories as $cat)
                        <div class="space-y-1">
                            <a href="{{ route('public.category', $cat->slug) }}" class="flex items-center justify-between rounded-2xl px-3 py-3 transition-all {{ $category->id == $cat->id ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground' }}">
                                <span class="text-xs font-bold uppercase tracking-wider">{{ $cat->{'name_'.app()->getLocale()} }}</span>
                                @if($cat->children->count() > 0)
                                    <span class="text-[10px] font-black">{{ $cat->children->count() }}</span>
                                @endif
                            </a>

                            @if($cat->children->count() > 0)
                            <div class="ms-4 border-s border-border/40 ps-3 space-y-1">
                                @foreach($cat->children as $child)
                                <a href="{{ route('public.category', $child->slug) }}" class="flex items-center rounded-xl px-3 py-2 text-[11px] font-bold transition-all {{ $category->id == $child->id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground' }}">
                                    {{ $child->{'name_'.app()->getLocale()} }}
                                </a>
                                @endforeach
                            </div>
                            @endif
                        </div>
                        @endforeach
                    </nav>
                </div>

                <div class="bg-primary/90 rounded-[28px] p-6 text-white space-y-4 premium-shadow">
                    <h4 class="text-lg font-black leading-tight">{{ __('website.vipTitle') }}</h4>
                    <p class="text-[10px] font-bold text-white/80 uppercase tracking-widest leading-relaxed">{{ __('website.vipDesc') }}</p>
                    <button class="w-full py-3 bg-white text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-secondary hover:text-white transition-all">{{ __('website.subscribe') }}</button>
                </div>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-12">
        <!-- Sidebar -->
        <aside class="hidden space-y-10 lg:block">
            <div class="glass border border-border/40 rounded-[40px] p-8 premium-shadow sticky top-32">
                <h3 class="text-xs font-black uppercase tracking-[0.2em] text-foreground mb-8 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-primary"></span>
                    {{ __('website.exploreCategories') }}
                </h3>
                
                <nav class="space-y-2">
                    @foreach($categories as $cat)
                    <div class="space-y-1">
                        <a href="{{ route('public.category', $cat->slug) }}" 
                           class="flex items-center justify-between group p-3 rounded-2xl transition-all {{ $category->id == $cat->id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground' }}">
                            <span class="text-xs font-bold uppercase tracking-wider">{{ $cat->{'name_'.app()->getLocale()} }}</span>
                            @if($cat->children->count() > 0)
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:rotate-90 {{ $category->id == $cat->id || $category->parent_id == $cat->id ? 'rotate-90' : '' }}"><path d="m9 18 6-6-6-6"/></svg>
                            @endif
                        </a>
                        
                        @if($cat->children->count() > 0)
                        <div class="ms-4 mt-1 space-y-1 border-s border-border/40 ps-3">
                            @foreach($cat->children as $child)
                            <a href="{{ route('public.category', $child->slug) }}" 
                               class="flex items-center gap-2 p-2.5 rounded-xl text-[11px] font-bold transition-all {{ $category->id == $child->id ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/5' }}">
                                <span class="w-1.5 h-1.5 rounded-full {{ $category->id == $child->id ? 'bg-primary' : 'bg-border' }}"></span>
                                {{ $child->{'name_'.app()->getLocale()} }}
                            </a>
                            @endforeach
                        </div>
                        @endif
                    </div>
                    @endforeach
                </nav>
            </div>

            <!-- Promotion or Newsletter Widget -->
            <div class="bg-primary/90 rounded-[40px] p-8 text-white space-y-4 premium-shadow relative overflow-hidden group">
                <div class="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <h4 class="text-xl font-black leading-tight">{{ __('website.vipTitle') }}</h4>
                <p class="text-[10px] font-bold text-white/80 uppercase tracking-widest leading-relaxed">{{ __('website.vipDesc') }}</p>
                <button class="w-full py-3 bg-white text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-secondary hover:text-white transition-all shadow-xl shadow-black/10">{{ __('website.subscribe') }}</button>
            </div>
        </aside>

        <!-- Main Content -->
        <div class="lg:col-span-3">
            @if($products->count() > 0)
            <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                @foreach($products as $product)
                    <x-product-card :product="$product" :show-store="true" />
                @endforeach
            </div>

            <div class="mt-16 flex justify-center">
                {{ $products->links() }}
            </div>
            @else
            <div class="py-20 text-center space-y-4 glass rounded-[40px] border border-border/40">
                <div class="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto text-muted-foreground/40">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M8 11h6"/></svg>
                </div>
                <p class="text-muted-foreground font-bold uppercase tracking-widest text-xs">{{ __('website.noProductsCategory') }}</p>
                <a href="/" class="inline-block px-8 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all">{{ __('website.backHome') }}</a>
            </div>
            @endif
        </div>
    </div>
@endsection
