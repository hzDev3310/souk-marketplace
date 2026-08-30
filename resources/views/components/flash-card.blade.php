@props(['product'])

<div class="min-w-[200px] snap-start bg-card rounded-xl p-3 shadow-sm group border border-border/30">
    <div class="relative h-40 rounded-lg overflow-hidden mb-3">
        @if($product->albums->first())
            <img src="{{ $product->albums->first()->file }}" alt="{{ $product->{'name_'.app()->getLocale()} }}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onerror="this.onerror=null; this.src='/images/default-placeholder.png';">
        @else
            <img src="/storage/empty/empty.webp" alt="{{ $product->{'name_'.app()->getLocale()} }}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onerror="this.onerror=null; this.src='/images/default-placeholder.png';">
        @endif
        <span class="absolute top-2 left-2 bg-secondary text-white text-[10px] font-bold px-2 py-1 rounded">-{{ $product->promo }}%</span>
    </div>
    <h4 class="font-bold text-foreground text-sm mb-1 line-clamp-1" style="font-family: 'Playfair Display', serif;">
        {{ $product->{'name_'.app()->getLocale()} }}
    </h4>
    <div class="flex items-center gap-2 mb-2">
        <span class="text-secondary font-bold text-sm">{{ number_format($product->customerPrice(), 2) }} {{ __('website.currency') }}</span>
        <span class="text-muted-foreground line-through text-xs">{{ number_format($product->display_price, 2) }} {{ __('website.currency') }}</span>
    </div>
    <div class="w-full bg-muted h-1 rounded-full overflow-hidden">
        <div class="bg-secondary h-full" style="width: {{ rand(15, 85) }}%"></div>
    </div>
    <p class="text-[10px] text-muted-foreground mt-1">{{ $product->stock }} {{ __('website.remaining') }}</p>
</div>
