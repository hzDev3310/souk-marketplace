@extends('layouts.public')

@section('seo')
    <meta name="description" content="Browse all categories on Souk AI marketplace.">
    <meta name="keywords" content="categories, marketplace, shopping">
    <meta property="og:title" content="All Categories - Souk AI">
    <meta property="og:url" content="{{ url()->current() }}">
@endsection

@section('content')
    <div class="mb-12">
        <h1 class="text-5xl font-black text-foreground tracking-tight mb-4">{{ __('website.allCategories') ?? 'All Categories' }}</h1>
        <p class="text-muted-foreground font-medium text-lg">{{ __('website.browseByCategory') ?? 'Browse our products by category' }}</p>
    </div>

    <!-- Categories Grid -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-16">
        @forelse($categories as $category)
        <a href="{{ route('public.category', $category->slug) }}" class="group block relative rounded-[40px] overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 premium-shadow transition-all duration-300 min-h-[220px]">
            @if($category->cover)
                <img src="{{ image_url($category->cover) }}" alt="{{ $category->{'name_'.app()->getLocale()} }}"
                    class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onerror="this.onerror=null; this.src='/images/default-placeholder.png';">
            @endif

            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover:from-primary/80 group-hover:via-primary/40 transition-all duration-500"></div>

            <div class="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center min-h-[220px]">
                <div class="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-white/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner border border-white/10">
                    @if($category->icon)
                        @if(str_starts_with($category->icon, 'http') || file_exists(public_path($category->icon)))
                            <img src="{{ image_url($category->icon) }}" alt="" class="w-10 h-10 object-contain"
                                onerror="this.onerror=null; this.src='/images/default-placeholder.png';">
                            <span style="display:none" class="text-white">{!! lucide_icon($category->icon, 'w-10 h-10') !!}</span>
                        @else
                            <span class="text-white">{!! lucide_icon($category->icon, 'w-10 h-10') !!}</span>
                        @endif
                    @else
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                    @endif
                </div>

                <h4 class="font-black text-sm uppercase tracking-widest text-white drop-shadow-lg transition-colors duration-300">
                    {{ $category->{'name_'.app()->getLocale()} }}
                </h4>

                @if($category->children->count() > 0)
                    <p class="text-[10px] font-bold tracking-wider text-white/70 mt-3">
                        {{ $category->children->count() }} {{ __('website.subcategories') ?? 'Subcategories' }}
                    </p>
                @endif
            </div>
        </a>
        @empty
        <div class="col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5 py-20 text-center space-y-4 glass rounded-[40px] border border-border/40">
            <div class="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto text-muted-foreground/40">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M8 11h6"/></svg>
            </div>
            <p class="text-muted-foreground font-bold uppercase tracking-widest text-xs">{{ __('website.noCategoriesFound') }}</p>
        </div>
        @endforelse
    </div>

    <!-- Pagination -->
    <div class="mt-16 flex justify-center">
        {{ $categories->links() }}
    </div>
@endsection
