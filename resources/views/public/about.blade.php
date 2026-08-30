@extends('layouts.public', ['title' => $page?->getTitle() ?? __('website.pages.aboutTitle')])

@section('content')
@php
    $locale = app()->getLocale();
    $title = $page?->getTitle($locale) ?? __('website.pages.aboutTitle');
    $subtitle = $page?->getSubtitle($locale);
    $content = $page?->getContent($locale) ?? __('website.pages.aboutFallback');
@endphp

<section class="max-w-5xl mx-auto space-y-10">
    <div class="rounded-[40px] border border-border/40 bg-card glass p-8 md:p-12 premium-shadow">
        <p class="text-[11px] font-black uppercase tracking-[0.3em] text-primary mb-4">{{ __('website.pages.company') }}</p>
        <h1 class="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6">{{ $title }}</h1>
        @if($subtitle)
            <p class="text-lg font-bold text-muted-foreground mb-6">{{ $subtitle }}</p>
        @endif
        <div class="max-w-3xl text-base leading-8 text-muted-foreground whitespace-pre-line">{{ $content }}</div>
    </div>

    @if($page && $page->images->count())
        <div class="rounded-[40px] border border-border/40 bg-card glass p-8 md:p-12 premium-shadow">
            <p class="text-[11px] font-black uppercase tracking-[0.3em] text-primary mb-6">{{ __('website.pages.gallery') ?? 'Gallery' }}</p>
            <div class="grid gap-4 md:grid-cols-3">
                @foreach($page->images->sortBy('sort_order') as $image)
                    <img
                        src="{{ image_url($image->image_path) }}"
                        alt="{{ $title }}"
                        class="w-full h-48 object-cover rounded-2xl"
                        onerror="this.onerror=null; this.src='/images/default-placeholder.png';"
                    >
                @endforeach
            </div>
        </div>
    @endif

    <div class="grid gap-6 md:grid-cols-3">
        <div class="rounded-[32px] border border-border/40 bg-card p-6">
            <h2 class="text-lg font-black text-foreground mb-3">{{ __('website.pages.trustTitle') }}</h2>
            <p class="text-sm leading-7 text-muted-foreground">{{ __('website.pages.trustText') }}</p>
        </div>
        <div class="rounded-[32px] border border-border/40 bg-card p-6">
            <h2 class="text-lg font-black text-foreground mb-3">{{ __('website.pages.selectionTitle') }}</h2>
            <p class="text-sm leading-7 text-muted-foreground">{{ __('website.pages.selectionText') }}</p>
        </div>
        <div class="rounded-[32px] border border-border/40 bg-card p-6">
            <h2 class="text-lg font-black text-foreground mb-3">{{ __('website.pages.supportTitle') }}</h2>
            <p class="text-sm leading-7 text-muted-foreground">{{ __('website.pages.supportText') }}</p>
        </div>
    </div>
</section>
@endsection
