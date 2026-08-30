@props(['category', 'featured' => false])

<a href="{{ route('public.category', $category->slug) }}" class="group relative rounded-2xl overflow-hidden cursor-pointer {{ $featured ? 'col-span-2 h-40' : 'h-48' }}">
    @if($category->image)
        <img src="{{ image_url($category->image) }}" alt="" class="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-1000" onerror="this.onerror=null; this.src='/images/default-placeholder.png';">
    @elseif($category->icon && (str_starts_with($category->icon, 'http') || file_exists(public_path($category->icon))))
        <img src="{{ image_url($category->icon) }}" alt="" class="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-1000" onerror="this.onerror=null; this.src='/images/default-placeholder.png';">
    @elseif($category->icon)
        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 brightness-75 group-hover:scale-105 transition-transform duration-1000">
            <span class="text-primary/40 group-hover:text-primary/60 transition-colors">{!! lucide_icon($category->icon, 'w-16 h-16') !!}</span>
        </div>
    @else
        <div class="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 brightness-75 group-hover:scale-105 transition-transform duration-1000"></div>
    @endif
    <div class="absolute inset-0 flex items-center justify-center">
        <span class="text-white font-bold text-sm uppercase tracking-widest drop-shadow-lg" style="font-family: 'Playfair Display', serif;">
            {{ $category->{'name_'.app()->getLocale()} }}
        </span>
    </div>
</a>
