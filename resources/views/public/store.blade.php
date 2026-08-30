@extends('layouts.public')

@section('seo')
    <title>{{ $store->{'name_'.app()->getLocale()} }} - Souk AI</title>
    <meta name="description" content="{{ $store->{'description_'.app()->getLocale()} }}">
    <meta property="og:title" content="{{ $store->{'name_'.app()->getLocale()} }} - Souk AI">
    <meta property="og:description" content="{{ $store->{'description_'.app()->getLocale()} }}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url()->current() }}">
    @if($store->logo)
    <meta property="og:image" content="{{ asset('storage/'.$store->logo) }}">
    @endif
@endsection

@section('content')
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">
        <a href="/" class="hover:text-primary transition-colors">{{ __('website.nav.home') }}</a>
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        <a href="{{ route('public.all-stores') }}" class="hover:text-primary transition-colors">{{ __('website.stores') }}</a>
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        <span class="text-primary">{{ $store->{'name_'.app()->getLocale()} }}</span>
    </nav>

    <!-- Store Information Section -->
    <section class="relative rounded-[40px] overflow-hidden mb-12 glass border border-border/40">
        {{-- Cover Image --}}
        <div class="relative h-48 md:h-64">
            @if($store->cover)
                <img src="{{ image_url($store->cover) }}" class="w-full h-full object-cover"
                    onerror="this.onerror=null; this.src='/images/default-placeholder.png';">
            @else
                <div class="w-full h-full bg-gradient-to-br from-primary/30 via-secondary/20 to-muted"></div>
            @endif
            <div class="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
        </div>
        
        {{-- Store Info --}}
        <div class="relative -mt-16 md:-mt-20 px-6 md:px-10 pb-8">
            <div class="flex flex-col md:flex-row items-start md:items-end gap-6">
                {{-- Logo --}}
                <div class="w-24 h-24 md:w-32 md:h-32 rounded-[32px] overflow-hidden border-4 border-background bg-card shadow-xl flex-shrink-0">
                    @if($store->logo)
                        <img src="{{ image_url($store->logo) }}" alt="{{ $store->{'name_'.app()->getLocale()} }}" class="w-full h-full object-cover"
                            onerror="this.onerror=null; this.src='/images/default-placeholder.png';">
                    @else
                        <div class="w-full h-full bg-primary/10 flex items-center justify-center">
                            <span class="text-3xl font-black text-primary">{{ substr($store->{'name_'.app()->getLocale()}, 0, 1) }}</span>
                        </div>
                    @endif
                </div>
                
                {{-- Store Details --}}
                <div class="flex-1 space-y-2">
                    <h1 class="text-2xl md:text-4xl font-black text-foreground tracking-tight">{{ $store->{'name_'.app()->getLocale()} }}</h1>
                    @if($store->{'description_'.app()->getLocale()})
                    <p class="text-sm md:text-base text-muted-foreground font-medium max-w-2xl line-clamp-3">{{ $store->{'description_'.app()->getLocale()} }}</p>
                    @endif
                    
                    {{-- Meta Info --}}
                    <div class="flex flex-wrap items-center gap-4 pt-2">
                        <span class="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                            {{ $products->total() }} {{ __('website.products') }}
                        </span>
                        @if($store->storePhone)
                        <span class="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                            {{ $store->storePhone }}
                        </span>
                        @endif
                        @if($store->address)
                        <span class="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                            {{ $store->address }}
                        </span>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Products Section -->
    <section class="mb-16">
        <div class="flex items-center justify-between mb-8">
            <div>
                <h2 class="text-2xl font-black text-foreground tracking-tight">{{ __('website.products') }}</h2>
                <p class="text-sm font-bold text-muted-foreground mt-1 uppercase tracking-widest">{{ __('website.fromStore') }} {{ $store->{'name_'.app()->getLocale()} }}</p>
            </div>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            @forelse($products as $product)
                <x-product-card :product="$product" />
            @empty
            <div class="col-span-2 lg:col-span-4 py-20 text-center">
                <div class="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto text-muted-foreground/40 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M8 11h6"/></svg>
                </div>
                <p class="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-4">{{ __('website.noProductsCategory') }}</p>
                <a href="/" class="inline-block px-8 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all">{{ __('website.backHome') }}</a>
            </div>
            @endforelse
        </div>

        {{-- Pagination --}}
        @if($products->hasPages())
        <div class="mt-12 flex justify-center">
            {{ $products->links() }}
        </div>
        @endif
    </section>
@endsection
