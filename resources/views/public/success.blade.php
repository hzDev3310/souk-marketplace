@extends('layouts.public')

@section('seo')
    <title>{{ __('website.success.title') }} - Souk AI</title>
@endsection

@section('content')
    <div class="max-w-2xl mx-auto py-20 text-center">
        <div class="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-10 text-green-500 scale-125">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        
        <div class="space-y-6 mb-12">
            <h1 class="text-6xl font-black text-foreground tracking-tighter">{{ __('website.success.title') }}</h1>
            <p class="text-xl text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
                {{ __('website.success.message') }}
                @foreach($orders as $order)<span class="text-primary font-black">#{{ $order->order_number }}</span>@if(!$loop->last), @endif
                @endforeach
                {{ __('website.success.status') }}
            </p>
            @if(count($orders) > 1)
            <p class="text-sm font-bold text-primary">
                {{ __('website.success.multiOrder') }}
            </p>
            @endif
            <p class="text-sm text-muted-foreground">{{ __('website.success.emailsent') }}</p>
        </div>

@if(session('guest_mail_error'))
            <div class="p-4 mb-8 rounded-2xl border border-red-200 bg-red-50 text-left">
                <p class="text-xs font-black uppercase tracking-[0.2em] text-red-600 mb-2">Email delivery warning</p>
                <p class="text-sm text-red-700">{{ session('guest_mail_error') }}</p>
            </div>
        @endif

        @if(session('order_mail_error'))
            <div class="p-4 mb-8 rounded-2xl border border-red-200 bg-red-50 text-left">
                <p class="text-xs font-black uppercase tracking-[0.2em] text-red-600 mb-2">Email delivery warning</p>
                <p class="text-sm text-red-700">{{ session('order_mail_error') }}</p>
            </div>
        @endif

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/" class="px-12 py-5 bg-primary text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
                {{ __('website.success.continue') }}
            </a>
            <a href="/profile" class="px-12 py-5 bg-card glass border border-border/40 text-foreground rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-muted/50 transition-all">
                {{ __('website.success.viewStatus') }}
            </a>
        </div>
    </div>
@endsection
