<?php $placeholder = "https://media.wallmantra.com/product/original/product_placeholder.webp" ?>
@props(['product', 'showStore' => false])

@php
    $isFavorited = in_array($product->id, session()->get('favorites', []));
@endphp

<div
    class="product-card group relative bg-card glass border border-border/40 rounded-[40px] overflow-hidden premium-shadow transition-all duration-300 hover:shadow-2xl hover:border-primary/20 hover:-translate-y-1">
    
    {{-- Promo Badge --}}
    @if($product->promo > 0)
        <div
            class="absolute top-5 left-5 z-20 px-4 py-1.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-rose-500/40 flex items-center gap-1.5 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            -{{ $product->promo }}%
        </div>
    @endif

{{-- Wishlist / Favorite Button --}}
<button
    onclick="window.toggleCardFavorite(this, '{{ $product->id }}')"
    data-product-id="{{ $product->id }}"
    class="absolute top-5 right-5 z-20 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md transition-all duration-300 hover:scale-110 hover:bg-rose-50 group/wishlist border border-gray-200">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
        fill="{{ $isFavorited ? 'currentColor' : 'none' }}"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="favorite-icon transition-colors {{ $isFavorited ? 'text-rose-500 fill-current' : 'text-gray-700 group-hover/wishlist:text-rose-500' }}">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
</button>

    {{-- Product Image --}}
    <div class="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
        @if($product->albums->first())
        <img src="{{ $product->albums->first()->file }}"
             alt="{{ $product->{'name_' . app()->getLocale()} }}"
             onerror="this.onerror=null; this.src='{{ $placeholder }}'"
             loading="lazy"
             class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out">
        @else
        <img src="/storage/empty/empty.webp"
             alt="{{ $product->{'name_' . app()->getLocale()} }}"
             onerror="this.onerror=null; this.src='{{ $placeholder }}'"
             loading="lazy"
             class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out">
        @endif

        {{-- Image Overlay Gradient --}}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {{-- Quick View Button --}}
        <div
            class="absolute bottom-0 left-0 right-0 px-4 translate-y-full group-hover:-translate-y-4 transition-transform duration-500 ease-out">
            <a href="{{ route('public.product', $product->slug) }}"
                class="w-full py-3.5 bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary flex items-center justify-center gap-2 rounded-3xl shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 hover:scale-[1.02] group/btn">
                <span class="text-white text-xs font-bold uppercase tracking-wider">{{ __('website.quickView') }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover/btn:translate-x-1 transition-transform">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                </svg>
            </a>
        </div>

        {{-- Stock Status --}}
        @if($product->stock <= 5)
            <div class="absolute bottom-4 left-4 z-10 px-3 py-1 bg-amber-500/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-wider rounded-full shadow-lg">
                {{ $product->stock <= 0 ? 'Out of Stock' : 'Low Stock' }}
            </div>
        @endif
    </div>

    {{-- Product Info --}}
    <div class="p-4 md:p-6 space-y-2 md:space-y-3 bg-gradient-to-b from-transparent to-muted/5">
        {{-- Store Name + Logo --}}
        @if($showStore && $product->store)
            <a href="{{ route('public.store', $product->store->slug) }}" class="flex items-center gap-2 group/store">
                @if($product->store->logo)
                    <img src="{{ image_url($product->store->logo) }}"
                         alt="{{ $product->store->{'name_' . app()->getLocale()} }}"
                         class="w-5 h-5 rounded-full object-cover border border-border/40"
                         onerror="this.onerror=null; this.src='https://media.wallmantra.com/product/original/product_placeholder.webp';">
                    <div class="w-5 h-5 rounded-full bg-primary/10 items-center justify-center hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                    </div>
                @else
                    <div class="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <span class="text-[8px] font-black text-primary uppercase">
                            {{ substr($product->store->{'name_' . app()->getLocale()}, 0, 1) }}
                        </span>
                    </div>
                @endif
                <p class="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-primary/70 truncate group-hover/store:text-primary transition-colors">
                    {{ $product->store->{'name_' . app()->getLocale()} }}
                </p>
            </a>
        @endif

        {{-- Product Name --}}
        <h3
            class="font-bold text-foreground text-[10px] md:text-sm line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {{ $product->{'name_' . app()->getLocale()} }}
        </h3>

        {{-- Price Section --}}
        <div class="flex items-end justify-between pt-2 border-t border-border/40">
            <div class="space-y-0.5">
                @if($product->promo > 0)
                    <p class="text-[10px] text-muted-foreground font-bold line-through">
                        {{ number_format($product->display_price, 2) }} {{ __('website.currency') }}
                    </p>
                @endif
                <div class="flex items-baseline gap-1.5">
                    <p class="text-lg font-black text-foreground">
                        {{ number_format($product->customerPrice(), 2) }}
                    </p>
                    <span
                        class="text-[9px] font-black text-muted-foreground uppercase">{{ __('website.currency') }}</span>
                </div>
            </div>
            
            {{-- Add to Cart Button --}}
            <button
                onclick="window.addCardToCart(this, '{{ $product->id }}')"
                data-product-id="{{ $product->id }}"
                class="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all duration-300 flex items-center justify-center group/cart hover:shadow-lg hover:shadow-primary/30"
                @if($product->stock <= 0) disabled @endif>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover/cart:scale-110 transition-transform">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
            </button>
        </div>

        {{-- Progress Bar for Stock --}}
        @if($product->stock > 0 && $product->stock <= 20)
            <div class="mt-2">
                <div class="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000"
                         style="width: {{ min(($product->stock / 20) * 100, 100) }}%">
                    </div>
                </div>
                <p class="text-[7px] text-muted-foreground mt-0.5 font-medium">
                    {{ $product->stock }} items left
                </p>
            </div>
        @endif
    </div>
</div>

@push('scripts')
@once
<script>
    (function() {
        if(window._cardFns) return;
        window._cardFns = true;

        window.addCardToCart = function(btn, productId) {
            if(btn.disabled) return;
            const svg = btn.querySelector('svg');
            btn.disabled = true;

            fetch('{{ route("public.cart.add") }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ product_id: productId, quantity: 1 })
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    document.querySelectorAll('#cart-count, #cart-count-desktop').forEach(badge => {
                        if(badge) {
                            badge.innerText = data.count;
                            badge.classList.remove('hidden');
                            badge.classList.remove('cart-pop');
                            void badge.offsetWidth;
                            badge.classList.add('cart-pop');
                        }
                    });
                    btn.classList.remove('bg-primary/10', 'text-primary');
                    btn.classList.add('bg-emerald-500', 'text-white');
                    svg.innerHTML = '<polyline points="20 6 9 17 4 12"/>';
                    if(window.showToast) showToast("{{ __('website.productInfo.addedToCart') }}", 'cart');
                    setTimeout(() => {
                        btn.classList.remove('bg-emerald-500', 'text-white');
                        btn.classList.add('bg-primary/10', 'text-primary');
                        svg.innerHTML = '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>';
                        btn.disabled = false;
                    }, 1500);
                } else {
                    btn.disabled = false;
                }
            })
            .catch(() => { btn.disabled = false; });
        };

        window.toggleCardFavorite = function(btn, productId) {
            const icon = btn.querySelector('.favorite-icon');
            fetch('{{ route("public.favorites.toggle") }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ product_id: productId })
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    if(data.status === 'added') {
                        icon.setAttribute('fill', 'currentColor');
                        icon.classList.add('text-rose-500', 'fill-current');
                        icon.classList.remove('text-foreground/60');
                        if(window.showToast) showToast("{{ __('website.productInfo.addedToFavorites') }}", 'favorite');
                    } else {
                        icon.setAttribute('fill', 'none');
                        icon.classList.remove('text-rose-500', 'fill-current');
                        icon.classList.add('text-foreground/60');
                        if(window.showToast) showToast("{{ __('website.productInfo.removedFromFavorites') }}", 'removed');
                    }
                    document.querySelectorAll('#fav-count-desktop').forEach(badge => {
                        if(badge) {
                            badge.innerText = data.count;
                            data.count > 0 ? badge.classList.remove('hidden') : badge.classList.add('hidden');
                            badge.classList.remove('cart-pop');
                            void badge.offsetWidth;
                            badge.classList.add('cart-pop');
                        }
                    });
                }
            });
        };
    })();
</script>
@endonce
@endpush
