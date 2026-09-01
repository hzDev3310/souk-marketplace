@extends('layouts.public')

@section('seo')
    <title>Verify Email - Souk AI</title>
@endsection

@section('content')
    <div class="max-w-2xl mx-auto">
        <div class="text-center mb-12">
            <div class="w-20 h-20 mx-auto rounded-[28px] bg-primary/10 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>
            <h1 class="text-4xl font-black text-foreground tracking-tight mb-4 uppercase">{{ __('website.otp.title') }}</h1>
            <p class="text-muted-foreground font-medium">
                {{ __('website.otp.subtitle') }} <strong class="text-primary">{{ $email }}</strong>
            </p>
        </div>

        @if(session('otp_mail_error'))
            <div class="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl text-sm text-red-700 dark:text-red-300 font-bold">
                {{ session('otp_mail_error') }}
            </div>
        @endif

        <div class="bg-card glass border border-border/40 rounded-[40px] p-8 md:p-12 premium-shadow">
            <form action="{{ route('public.checkout.verify.submit') }}" method="POST" class="space-y-8">
                @csrf
                <input type="hidden" name="otp_id" value="{{ $pending['otp_id'] }}">

                <div class="space-y-2">
                    <label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{{ __('website.otp.codeLabel') }}</label>
                    <input
                        type="text"
                        name="otp"
                        inputmode="numeric"
                        maxlength="6"
                        autocomplete="one-time-code"
                        placeholder="000000"
                        value="{{ old('otp') }}"
                        required
                        class="w-full px-6 py-5 bg-muted/30 border border-border/40 rounded-2xl focus:border-primary/50 outline-none transition-all font-black text-center text-2xl tracking-[0.5em]"
                    >
                    @error('otp')
                        <p class="text-xs font-bold text-red-500 mt-2 ml-2">{{ $message }}</p>
                    @enderror
                </div>

                <button type="submit" class="w-full py-6 bg-primary text-white rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all">
                    {{ __('website.otp.verify') }}
                </button>
            </form>

            <div class="mt-6 text-center">
                <form action="{{ route('public.checkout.send-otp') }}" method="POST" class="inline">
                    @csrf
                    <input type="hidden" name="email" value="{{ $pending['email'] }}">
                    <input type="hidden" name="first_name" value="{{ $pending['first_name'] }}">
                    <input type="hidden" name="last_name" value="{{ $pending['last_name'] }}">
                    <input type="hidden" name="address" value="{{ $pending['address'] }}">
                    <input type="hidden" name="city" value="{{ $pending['city'] }}">
                    <input type="hidden" name="postal_code" value="{{ $pending['postal_code'] }}">
                    <input type="hidden" name="lat" value="{{ $pending['lat'] }}">
                    <input type="hidden" name="lon" value="{{ $pending['lon'] }}">
                    <button type="submit" class="text-xs font-black uppercase tracking-widest text-primary hover:text-primaryemphasis transition-colors">
                        {{ __('website.otp.resend') }}
                    </button>
                </form>
            </div>

            <div class="mt-8 pt-6 border-t border-border/40 text-center">
                <a href="{{ route('public.checkout') }}" class="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                    ← {{ __('website.otp.backToCheckout') }}
                </a>
            </div>
        </div>
    </div>
@endsection
