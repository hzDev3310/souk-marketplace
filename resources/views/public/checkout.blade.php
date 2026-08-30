@extends('layouts.public')

@section('seo')
    <title>Checkout - Souk AI</title>
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
    <style>
        #map { height: 400px; border-radius: 24px; }
        .glass { backdrop-filter: blur(16px); }
    </style>
@endsection

@section('content')
    <div class="mb-16">
        <h1 class="text-5xl font-black text-foreground tracking-tight mb-4 uppercase">{{ __('website.checkout.title') }}</h1>
        <p class="text-muted-foreground font-medium">{{ __('website.checkout.subtitle') }}</p>
    </div>

    <form action="{{ route('public.checkout.process') }}" method="POST" id="checkout-form">
        @csrf
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <!-- Details Form -->
            <div class="lg:col-span-2 space-y-8">
                <div class="bg-card glass border border-border/40 rounded-[40px] p-8 md:p-12 premium-shadow space-y-12">
                    <!-- Personal Info -->
                    <div class="space-y-8">
                        <h3 class="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                            <span class="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">1</span>
                            {{ __('website.checkout.personalInfo') }}
                        </h3>
                        
                        @guest
                        <div class="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                            <p class="text-[11px] font-bold text-primary leading-relaxed">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="inline-block mr-1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                {{ __('website.checkout.guestAccountNote') }}
                            </p>
                        </div>
                        @endguest
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-2">
                                <label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{{ __('website.checkout.firstName') }}</label>
                                <input type="text" name="first_name" value="{{ old('first_name', auth()->user()->first_name ?? '') }}" required class="w-full px-6 py-4 bg-muted/30 border border-border/40 rounded-2xl focus:border-primary/50 outline-none transition-all font-bold text-sm">
                            </div>
                            <div class="space-y-2">
                                <label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{{ __('website.checkout.lastName') }}</label>
                                <input type="text" name="last_name" value="{{ old('last_name', auth()->user()->last_name ?? '') }}" required class="w-full px-6 py-4 bg-muted/30 border border-border/40 rounded-2xl focus:border-primary/50 outline-none transition-all font-bold text-sm">
                            </div>
                        </div>
                        
                        <div class="space-y-2">
                            <label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{{ __('website.checkout.email') }}</label>
                            <input type="email" name="email" value="{{ old('email', auth()->user()->email ?? '') }}" required class="w-full px-6 py-4 bg-muted/30 border border-border/40 rounded-2xl focus:border-primary/50 outline-none transition-all font-bold text-sm">
                        </div>
                    </div>

                    <div class="space-y-8">
                        <h3 class="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                            <span class="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">2</span>
                            {{ __('website.checkout.shippingLocation') }}
                        </h3>

                        <div class="space-y-6">
                            <div class="space-y-2">
                                <label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{{ __('website.checkout.streetAddress') }}</label>
                                <input type="text" name="address" id="address" value="{{ old('address') }}" required class="w-full px-6 py-4 bg-muted/30 border border-border/40 rounded-2xl focus:border-primary/50 outline-none transition-all font-bold text-sm">
                            </div>
                            
                            <div class="grid grid-cols-2 gap-6">
                                <div class="space-y-2">
                                    <label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{{ __('website.checkout.city') }}</label>
                                    <input type="text" name="city" id="city" value="{{ old('city') }}" required class="w-full px-6 py-4 bg-muted/30 border border-border/40 rounded-2xl focus:border-primary/50 outline-none transition-all font-bold text-sm">
                                </div>
                                <div class="space-y-2">
                                    <label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{{ __('website.checkout.postalCode') }}</label>
                                    <input type="text" name="postal_code" id="postal_code" value="{{ old('postal_code') }}" required class="w-full px-6 py-4 bg-muted/30 border border-border/40 rounded-2xl focus:border-primary/50 outline-none transition-all font-bold text-sm">
                                </div>
                            </div>
                            
                            <!-- Hidden inputs for Lat/Lon -->
                            <input type="hidden" name="lat" id="lat-input" value="36.8065">
                            <input type="hidden" name="lon" id="lon-input" value="10.1815">

                            <!-- Map Search -->
                            <div class="space-y-4">
                                <div class="flex items-center justify-between">
                                    <label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{{ __('website.checkout.selectOnMap') }}</label>
                                    <button type="button" id="use-current-location" class="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primaryemphasis transition-colors flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                        {{ __('website.checkout.useCurrent') }}
                                    </button>
                                </div>
                                
                                <div class="relative">
                                    <input type="text" id="map-search" placeholder="{{ __('website.checkout.searchPlace') }}" class="absolute top-4 left-4 right-4 z-[400] px-4 py-3 bg-white/90 dark:bg-black/80 backdrop-blur-md border border-border/40 rounded-xl shadow-2xl outline-none text-xs font-bold">
                                    <div id="search-results" class="hidden absolute top-16 left-4 right-4 z-[400] bg-white dark:bg-black/90 border border-border/40 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md max-h-48 overflow-y-auto"></div>
                                    <div id="map" class="h-[400px] w-full rounded-[32px] border border-border/40 z-10 sticky"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Summary Column -->
            <div class="space-y-8">
                <div class="bg-card glass border border-border/40 rounded-[40px] p-8 premium-shadow space-y-8 sticky top-32">
                    <h3 class="text-xs font-black uppercase tracking-[0.2em] text-foreground">{{ __('website.checkout.orderSummary') }}</h3>
                    
                    <div class="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        @foreach($zoneGroups as $group)
                            <div class="pt-2 pb-1">
                                <p class="text-[10px] font-black uppercase tracking-widest text-primary">{{ $group['label'] }}</p>
                            </div>
                            @foreach($group['items'] as $item)
                                @php $product = $item['product']; @endphp
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-xl overflow-hidden bg-muted/10">
                                        @if($product->albums->first())
                                            <img src="{{ $product->albums->first()->file }}" alt="" class="w-full h-full object-cover"
                                                onerror="this.onerror=null; this.src='/images/default-placeholder.png';">
                                        @endif
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-xs font-bold text-foreground truncate">{{ $product->{'name_'.app()->getLocale()} }}</p>
                                        <p class="text-[10px] text-muted-foreground">{{ __('website.checkout.qty') }}: {{ $item['quantity'] }}</p>
                                    </div>
                                    <p class="text-xs font-black text-foreground">
                                        {{ number_format($item['price'] * $item['quantity'], 2) }}
                                    </p>
                                </div>
                            @endforeach
                        @endforeach
                    </div>

                    <div class="pt-8 border-t border-border/40 space-y-6">
                        @if(count($zoneGroups) > 1)
                        <div class="space-y-2 pb-2">
                            @foreach($zoneGroups as $group)
                                <div class="flex justify-between text-muted-foreground font-medium">
                                    <span class="text-[10px] uppercase tracking-widest">{{ $group['label'] }}</span>
                                    <span class="text-sm font-black text-foreground">{{ number_format($group['total'], 2) }} {{ __('website.currency') }}</span>
                                </div>
                            @endforeach
                        </div>
                        @endif
                        <div class="flex justify-between items-end">
                            <span class="text-xs font-black uppercase tracking-widest text-foreground">{{ __('website.cart.total') }}</span>
                            <div class="text-right">
                                 <p class="text-3xl font-black text-primary">{{ number_format($total, 2) }}</p>
                                 <p class="text-[10px] font-black text-muted-foreground uppercase">{{ __('website.currency') }}</p>
                            </div>
                        </div>

                        @php $totalCommission = collect($cart)->sum(fn ($i) => $i['commission'] * $i['quantity']); @endphp
                        <div class="pt-4 border-t border-border/40 space-y-2">
                            <div class="flex justify-between text-muted-foreground font-medium">
                                <span class="text-[10px] uppercase tracking-widest">{{ __('website.checkout.commission') }}</span>
                                <span class="text-sm font-black text-foreground">{{ number_format($totalCommission, 2) }} {{ __('website.currency') }}</span>
                            </div>
                            <div class="flex justify-between text-muted-foreground font-medium">
                                <span class="text-[10px] uppercase tracking-widest">{{ __('website.checkout.storeAmount') }}</span>
                                <span class="text-sm font-black text-foreground">{{ number_format($total - $totalCommission, 2) }} {{ __('website.currency') }}</span>
                            </div>
                        </div>
                        
                        <button type="submit" class="w-full py-6 bg-primary text-white rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                            {{ __('website.checkout.placeOrder') }}
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </form>
@endsection

@push('scripts')
    <!-- Leaflet JS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <script>
        // Init map (centered on Tunis, restricted to Tunisia)
        const tunisiaBounds = L.latLngBounds([30.0, 7.0], [38.0, 12.0]);
        const map = L.map('map', {
            maxBounds: tunisiaBounds,
            maxBoundsViscosity: 1.0
        }).setView([36.8065, 10.1815], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);

        let marker = L.marker([36.8065, 10.1815], { draggable: true }).addTo(map);

        function updateInputs(lat, lon) {
            document.getElementById('lat-input').value = lat;
            document.getElementById('lon-input').value = lon;
            
            // Reverse Geocoding to fill address (restricted to Tunisia)
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&countrycodes=tn`)
                .then(res => res.json())
                .then(data => {
                    if(data.address) {
                        if(data.address.road) document.getElementById('address-input').value = data.address.road;
                        if(data.address.city || data.address.town || data.address.village) {
                            document.getElementById('city-input').value = data.address.city || data.address.town || data.address.village;
                        }
                        if(data.address.postcode) document.getElementById('postcode-input').value = data.address.postcode;
                    }
                });
        }

        marker.on('dragend', function() {
            const pos = marker.getLatLng();
            updateInputs(pos.lat, pos.lng);
        });

        map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            updateInputs(e.latlng.lat, e.latlng.lng);
        });

        // Search Functionality
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('map-search');
        const resultsEl = document.getElementById('search-results');

        function performSearch() {
            const query = searchInput.value;
            if(query.length < 3) return;

            // Restricted to Tunisia via countrycodes=tn
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=tn`)
                .then(res => res.json())
                .then(data => {
                    resultsEl.innerHTML = '';
                    resultsEl.classList.remove('hidden');
                    data.forEach(item => {
                        const div = document.createElement('div');
                        div.className = 'px-4 py-2 hover:bg-muted/20 cursor-pointer text-xs transition-colors border-b border-border/20 last:border-0';
                        div.innerText = item.display_name;
                        div.onclick = () => {
                            const lat = parseFloat(item.lat);
                            const lon = parseFloat(item.lon);
                            map.setView([lat, lon], 16);
                            marker.setLatLng([lat, lon]);
                            updateInputs(lat, lon);
                            resultsEl.classList.add('hidden');
                            searchInput.value = item.display_name;
                        };
                        resultsEl.appendChild(div);
                    });
                });
        }

        searchBtn.onclick = performSearch;
        searchInput.onkeypress = (e) => { if(e.key === 'Enter') performSearch(); };

        // Use Current Location
        document.getElementById('use-current-location').onclick = () => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    map.setView([lat, lon], 16);
                    marker.setLatLng([lat, lon]);
                    updateInputs(lat, lon);
                });
            }
        };

        // Close search results on outside click
        document.addEventListener('click', (e) => {
            if(!resultsEl.contains(e.target) && e.target !== searchInput) {
                resultsEl.classList.add('hidden');
            }
        });
    </script>
@endpush
