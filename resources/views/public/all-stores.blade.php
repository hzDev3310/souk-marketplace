@extends('layouts.public')

@section('seo')
    <meta name="description" content="Browse all stores on Souk AI marketplace.">
    <meta name="keywords" content="stores, marketplace, shopping">
    <meta property="og:title" content="All Stores - Souk AI">
    <meta property="og:url" content="{{ url()->current() }}">
@endsection

@section('content')
    <div class="mb-12">
        <h1 class="text-5xl font-black text-foreground tracking-tight mb-4">{{ __('website.allStores') ?? 'All Stores' }}</h1>
        <p class="text-muted-foreground font-medium text-lg">{{ __('website.bestStores') ?? 'Discover our top sellers and stores' }}</p>
    </div>

    <!-- Stores Grid -->
    <div id="stores-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
        @forelse($stores as $store)
            <x-boutique-card :store="$store" />
        @empty
        <div class="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 py-20 text-center space-y-4 glass rounded-[40px] border border-border/40">
            <div class="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto text-muted-foreground/40">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
            </div>
            <p class="text-muted-foreground font-bold uppercase tracking-widest text-xs">{{ __('website.noStoresFound') }}</p>
        </div>
        @endforelse
    </div>

    <!-- Pagination (server-side) -->
    <div class="mt-16 flex justify-center">
        {{ $stores->appends(request()->query())->links() }}
    </div>
@endsection
