@props([
    'query' => null,
    'searchMode' => 'keyword',
    'categoryId' => null,
    'promoOnly' => false,
    'sortBy' => null,
])

<form method="GET" action="{{ route('public.search') }}"
    class="glass border border-border/40 rounded-[28px] p-5 md:p-6 premium-shadow">
    @if(filled($query))
        <input type="hidden" name="q" value="{{ $query }}">
    @endif
    <input type="hidden" name="search_mode" value="{{ $searchMode }}">
    @if($categoryId)
        <input type="hidden" name="category_id" value="{{ $categoryId }}">
    @endif

    <div class="flex flex-col xl:flex-row xl:items-end gap-6 {{ $wrapClass ?? '' }}">
        <!-- Promotion Toggle -->
        <div class="shrink-0 w-full xl:w-auto">
            <span class="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">{{ __('website.search.filterBy') }}</span>
            <label class="cursor-pointer inline-flex w-full sm:w-auto">
                <input type="checkbox" name="promo" value="1" class="peer sr-only" @checked($promoOnly) onchange="this.form.submit()">
                <span class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border text-[11px] font-black uppercase tracking-wider transition-all border-border/40 bg-muted/20 text-muted-foreground hover:text-foreground peer-checked:border-primary/40 peer-checked:bg-primary/10 peer-checked:text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
                    {{ __('website.search.promotions') }}
                </span>
            </label>
        </div>

        <div class="hidden xl:block w-px self-stretch bg-border/40"></div>

        <!-- Price Range -->
        <div class="shrink-0 w-full sm:w-auto">
            <span class="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">{{ __('website.search.priceRange') }}</span>
            <div class="flex items-center gap-2">
                <input type="number" name="min_price" value="{{ request('min_price', '') }}" min="0" step="0.01" inputmode="decimal"
                    placeholder="{{ __('website.search.min') }}"
                    class="w-full sm:w-24 md:w-28 px-3 py-2.5 rounded-2xl border border-border/40 bg-muted/20 text-xs font-bold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:bg-card transition-all">
                <span class="text-muted-foreground/60 font-black">—</span>
                <input type="number" name="max_price" value="{{ request('max_price', '') }}" min="0" step="0.01" inputmode="decimal"
                    placeholder="{{ __('website.search.max') }}"
                    class="w-full sm:w-24 md:w-28 px-3 py-2.5 rounded-2xl border border-border/40 bg-muted/20 text-xs font-bold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:bg-card transition-all">
            </div>
        </div>

        <div class="hidden xl:block w-px self-stretch bg-border/40"></div>

        <!-- Sort Options -->
        <div class="shrink-0 w-full xl:w-auto">
            <span class="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">{{ __('website.search.sortBy') }}</span>
            <select name="sort"
                onchange="this.form.submit()"
                class="w-full xl:w-44 px-4 py-2.5 rounded-2xl border border-border/40 bg-muted/20 text-xs font-bold text-foreground focus:outline-none focus:border-primary/40 focus:bg-card transition-all cursor-pointer">
                <option value="">{{ __('website.search.relevance') }}</option>
                <option value="price_asc" @selected($sortBy === 'price_asc')>{{ __('website.search.priceLow') }}</option>
                <option value="price_desc" @selected($sortBy === 'price_desc')>{{ __('website.search.priceHigh') }}</option>
                <option value="newest" @selected($sortBy === 'newest')>{{ __('website.search.newest') }}</option>
                <option value="oldest" @selected($sortBy === 'oldest')>{{ __('website.search.oldest') }}</option>
                <option value="alpha" @selected($sortBy === 'alpha')>{{ __('website.search.alpha') }}</option>
            </select>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 shrink-0 w-full sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
            <button type="submit"
                class="px-5 py-2.5 rounded-2xl bg-primary text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/25 hover:bg-primaryemphasis active:scale-95 transition-all">
                {{ __('website.search.apply') }}
            </button>
            <a href="{{ route('public.search', array_filter(['q' => $query], fn ($v) => filled($v))) }}"
                class="text-center px-4 py-2.5 rounded-2xl border border-border/40 bg-muted/20 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all">
                {{ __('website.search.reset') }}
            </a>
        </div>
    </div>
</form>
