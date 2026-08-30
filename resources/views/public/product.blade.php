@extends('layouts.public')

@section('seo')
    <meta name="description" content="{{ $product->{'description_'.app()->getLocale()} }}">
    <meta name="keywords" content="{{ $product->{'name_'.app()->getLocale()} }}, {{ $product->store->{'name_'.app()->getLocale()} }}, buy">
    <meta property="og:title" content="{{ $product->{'name_'.app()->getLocale()} }} - Souk AI">
    <meta property="og:description" content="{{ $product->{'description_'.app()->getLocale()} }}">
    <meta property="og:type" content="product">
    <meta property="og:url" content="{{ url()->current() }}">
    @if($product->albums->first())
    <meta property="og:image" content="{{ $product->albums->first()->file }}">
    @endif
@endsection

@section('content')
    @php
        $productAlbumsJson = json_encode($product->albums->map(fn ($a) => ['id' => $a->id, 'file' => $a->file]));
    @endphp
    <div class="grid grid-cols-1 md:grid-cols-2 gap-16">
        <!-- Image Gallery -->
        <div class="space-y-6">
            <div class="relative aspect-square bg-card glass border border-border/40 rounded-[60px] overflow-hidden premium-shadow">
                @if($product->albums->first())
                    <img id="main-product-image" src="{{ $product->albums->first()->file }}" alt="{{ $product->{'name_'.app()->getLocale()} }}" class="w-full h-full object-cover"
                        onerror="this.onerror=null; this.src='/images/default-placeholder.png';">
                @else
                    <img id="main-product-image" src="/storage/empty/empty.webp" alt="{{ $product->{'name_'.app()->getLocale()} }}" class="w-full h-full object-cover"
                        onerror="this.onerror=null; this.src='/images/default-placeholder.png';">
                @endif
            </div>
            
            <div id="product-thumbnails" class="flex gap-4">
                @if($product->albums->count() > 0)
                    @foreach($product->albums as $album)
                        <div class="w-24 h-24 bg-card glass border border-border/40 rounded-3xl overflow-hidden cursor-pointer hover:border-primary transition-colors"
                            onclick="window.productGallery && window.productGallery.setImage('{{ $album->file }}', this)">
                            <img src="{{ $album->file }}" class="w-full h-full object-cover"
                                onerror="this.onerror=null; this.src='/images/default-placeholder.png';">
                        </div>
                    @endforeach
                @else
                    <div class="w-24 h-24 bg-card glass border border-border/40 rounded-3xl overflow-hidden">
                        <img src="/storage/empty/empty.webp" class="w-full h-full object-cover"
                            onerror="this.onerror=null; this.src='/images/default-placeholder.png';">
                    </div>
                @endif
            </div>
        </div>

        <!-- Product Info -->
        <div class="space-y-8 py-4">
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <span class="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                            {{ $product->store->{'name_'.app()->getLocale()} }}
                        </span>
                        <span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            ID: {{ substr($product->id, 0, 8) }}
                        </span>
                    </div>
                    <a href="{{ route('public.store', $product->store->slug) }}" class="text-xs font-bold text-primary hover:text-primaryemphasis transition-colors flex items-center gap-1">
                        {{ __('website.visit') }}
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </a>
                </div>
                
                <h1 class="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
                    {{ $product->{'name_'.app()->getLocale()} }}
                </h1>
                
                <div class="flex items-center gap-6">
                    <p id="variant-price" class="text-4xl font-black text-primary">
                        @if($product->promo > 0)
                            {{ number_format($product->customerPrice(), 2) }}
                        @else
                            {{ number_format($product->display_price, 2) }}
                        @endif
                        <span class="text-xs font-black text-muted-foreground uppercase ml-1">{{ __('website.currency') }}</span>
                    </p>
                    @if($product->promo > 0)
                        <p id="variant-old-price" class="text-xl font-bold text-muted-foreground line-through opacity-50 pt-2">
                             {{ number_format($product->display_price, 2) }} {{ __('website.currency') }}
                        </p>
                        <span class="px-2 py-1 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                            -{{ $product->promo }}% {{ __('website.productInfo.off') }}
                        </span>
                    @endif
                </div>
            </div>

            <div class="space-y-4">
                <h4 class="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{{ __('website.productInfo.description') }}</h4>
                <p class="text-muted-foreground font-medium leading-relaxed">
                    {{ $product->{'description_'.app()->getLocale()} }}
                </p>
            </div>

            <div class="pt-8 flex flex-col sm:flex-row gap-4">
                <button id="add-to-cart-btn" data-product-id="{{ $product->id }}" class="flex-1 py-5 bg-primary text-white rounded-[32px] font-black text-sm uppercase tracking-widest hover:bg-primaryemphasis transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    {{ __('website.addToCart') }}
                </button>
                <button id="toggle-fav-btn" data-product-id="{{ $product->id }}" class="w-16 h-16 glass border-border/40 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95 group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="{{ in_array($product->id, session()->get('favorites', [])) ? 'currentColor' : 'none' }}" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="favorite-icon {{ in_array($product->id, session()->get('favorites', [])) ? 'fill-current' : '' }}"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </button>
            </div>

            <!-- Additional Info -->
            <div class="grid grid-cols-2 gap-4 pt-8">
                <div class="p-4 bg-muted/20 border border-border/20 rounded-3xl">
                    <p class="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{{ __('website.productInfo.authenticity') }}</p>
                    <p class="text-xs font-bold">{{ __('website.productInfo.genuine') }}</p>
                </div>
                <div class="p-4 bg-muted/20 border border-border/20 rounded-3xl">
                    <p class="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{{ __('website.productInfo.storeVerified') }}</p>
                    <p class="text-xs font-bold">{{ __('website.productInfo.trustedSeller') }}</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Related Products -->
    @if($relatedProducts->count() > 0)
    <section class="mt-32">
        <h2 class="text-3xl font-black text-foreground tracking-tight mb-12">{{ __('website.productInfo.moreFromStore') }}</h2>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
               @foreach($relatedProducts as $product)
                    <x-product-card :product="$product" :show-store="true" />
                @endforeach
        </div>
    </section>
    @endif
@endsection

@push('scripts')
<script>
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const toggleFavBtn = document.getElementById('toggle-fav-btn');

    if(addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const payload = { product_id: productId, quantity: 1 };
            fetch('{{ route("public.cart.add") }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    [document.getElementById('cart-count'), document.getElementById('cart-count-desktop')].forEach(badge => {
                        if(badge) {
                            badge.innerText = data.count;
                            badge.classList.remove('hidden');
                            badge.classList.remove('cart-pop');
                            void badge.offsetWidth; // Trigger reflow
                            badge.classList.add('cart-pop');
                        }
                    });
                    showToast("{{ __('website.productInfo.addedToCart') }}", 'cart');
                }
            });

        });
    }

    if(toggleFavBtn) {
        toggleFavBtn.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const icon = this.querySelector('.favorite-icon');
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
                        if(window.showToast) showToast("{{ __('website.productInfo.addedToFavorites') }}", 'favorite');
                    } else {
                        icon.setAttribute('fill', 'none');
                        if(window.showToast) showToast("{{ __('website.productInfo.removedFromFavorites') }}", 'removed');
                    }

                    const badge = document.getElementById('fav-count-desktop');
                    if(badge) {
                        badge.innerText = data.count;
                        data.count > 0 ? badge.classList.remove('hidden') : badge.classList.add('hidden');
                        badge.classList.remove('cart-pop');
                        void badge.offsetWidth;
                        badge.classList.add('cart-pop');
                    }
                }
            });
        });
    }
    // ---- Product Image Gallery ----
    window.productGallery = {
        setImage: function(src, thumbEl) {
            var mainImg = document.getElementById('main-product-image');
            if (mainImg) { mainImg.src = src; }
            document.querySelectorAll('#product-thumbnails > div').forEach(function(d) {
                d.classList.remove('border-primary');
                d.classList.add('border-border/40');
            });
            if (thumbEl) {
                thumbEl.classList.remove('border-border/40');
                thumbEl.classList.add('border-primary');
            }
        }
    };

    // Variant selection intentionally disabled for this storefront build.
</script>
@endpush
