@extends('layouts.public')

@section('seo')
    <title>My Orders - Souk AI</title>
@endsection

@section('content')
<div class="max-w-xl mx-auto px-4 md:px-0">
    <!-- Header Stats -->
    <div class="grid grid-cols-3 gap-4 mb-10">
        @php
            $newCount = $orders->whereIn('status', ['en_attente', 'confirme'])->count();
            $progressCount = $orders->whereIn('status', ['imported_to_depot', 'en_livraison'])->count();
            $completedCount = $orders->whereIn('status', ['livree', 'retournee'])->count();
        @endphp
        
        <div class="bg-card rounded-[32px] p-6 text-center border border-border/40 premium-shadow">
            <h3 class="text-3xl font-black text-foreground mb-1">{{ $newCount }}</h3>
            <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">New</p>
        </div>
        
        <div class="bg-[#065F46] rounded-[32px] p-6 text-center shadow-xl shadow-emerald-900/20">
            <h3 class="text-3xl font-black text-white mb-1">{{ sprintf('%02d', $progressCount) }}</h3>
            <p class="text-[10px] font-black uppercase tracking-widest text-white/70 leading-tight">In<br>Progress</p>
        </div>
        
        <div class="bg-card rounded-[32px] p-6 text-center border border-border/40 premium-shadow">
            <h3 class="text-3xl font-black text-foreground mb-1">{{ $completedCount }}</h3>
            <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Completed</p>
        </div>
    </div>

    <div class="mb-8">
        <h2 class="text-2xl font-black text-foreground tracking-tight">Active Deliveries</h2>
    </div>

    <div class="space-y-6">
        @forelse($orders as $order)
        @php
            $status = strtolower((string) $order->status);
            $statusMap = [
                'en_attente' => ['label' => 'En attente', 'tone' => 'bg-amber-500/10 border-amber-500/20 text-amber-600', 'progress' => 25],
                'confirme' => ['label' => 'Confirmé', 'tone' => 'bg-blue-500/10 border-blue-500/20 text-blue-600', 'progress' => 50],
                'imported_to_depot' => ['label' => 'Importé au dépôt', 'tone' => 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600', 'progress' => 66],
                'en_livraison' => ['label' => 'En livraison', 'tone' => 'bg-purple-500/10 border-purple-500/20 text-purple-600', 'progress' => 80],
                'livree' => ['label' => 'Livrée', 'tone' => 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600', 'progress' => 100],
                'retournee' => ['label' => 'Retournée', 'tone' => 'bg-rose-500/10 border-rose-500/20 text-rose-600', 'progress' => 100],
            ];
            $currentStatus = $statusMap[$status] ?? ['label' => strtoupper($order->status), 'tone' => 'bg-muted/20 border-border/20 text-foreground', 'progress' => 0];
        @endphp
        <div class="bg-card border border-border/40 rounded-[40px] p-8 premium-shadow relative overflow-hidden group">
            <!-- Card Header -->
            <div class="flex justify-between items-start mb-8">
                <div>
                    <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Order #{{ strtoupper(substr($order->id, 0, 7)) }}</p>
                    <h3 class="text-2xl font-black text-[#065F46] tracking-tight">
                        @if($order->items->count() > 0)
                            {{ $order->items->first()->product->{'name_'.app()->getLocale()} }}
                        @else
                            Order Summary
                        @endif
                    </h3>
                </div>
                <div class="px-4 py-2 border rounded-full {{ $currentStatus['tone'] }}">
                    <span class="text-[10px] font-black uppercase tracking-widest">
                        {{ $currentStatus['label'] }}
                    </span>
                </div>
            </div>

            <!-- Tracking Timeline -->
            <div class="relative pl-14 space-y-10 mb-10 {{ in_array($status, ['retournee']) ? 'opacity-40 grayscale' : '' }}">
                <!-- Vertical Line -->
                <div class="absolute left-6 top-2 bottom-2 w-1.5 bg-muted rounded-full overflow-hidden">
                    <div class="w-full bg-[#065F46] rounded-full transition-all duration-1000" style="height: {{ $currentStatus['progress'] }}%"></div>
                </div>

                <!-- Step 1 -->
                <div class="relative">
                    <div class="absolute -left-12 w-8 h-8 rounded-xl flex items-center justify-center {{ in_array($status, ['en_attente', 'confirme', 'imported_to_depot', 'en_livraison', 'livree']) ? 'bg-[#065F46] text-white' : 'bg-muted text-muted-foreground' }} z-10 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                    </div>
                    <div>
                        <h4 class="font-black text-sm {{ in_array($status, ['en_attente', 'confirme', 'imported_to_depot', 'en_livraison', 'livree']) ? 'text-foreground' : 'text-muted-foreground' }}">En attente</h4>
                        <p class="text-[10px] font-bold text-muted-foreground">Commande enregistrée • {{ $order->updated_at->format('H:i A') }}</p>
                    </div>
                </div>

                <!-- Step 2 -->
                <div class="relative">
                    <div class="absolute -left-12 w-8 h-8 rounded-xl flex items-center justify-center {{ in_array($status, ['confirme', 'imported_to_depot', 'en_livraison', 'livree']) ? 'bg-[#065F46] text-white' : 'bg-muted text-muted-foreground' }} z-10 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V2H10z"/><path d="M10 7V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"/><path d="M8 7h8"/><rect width="16" height="12" x="4" y="7" rx="2"/><path d="M12 12v3"/><path d="M16 11l-1 2"/><path d="M8 11l1 2"/></svg>
                    </div>
                    <div>
                        <h4 class="font-black text-sm {{ in_array($status, ['confirme', 'imported_to_depot', 'en_livraison', 'livree']) ? 'text-foreground' : 'text-muted-foreground' }}">Dépôt / préparation</h4>
                        <p class="text-[10px] font-bold text-muted-foreground">{{ in_array($status, ['imported_to_depot', 'en_livraison', 'livree']) ? 'Produit reçu au dépôt' : 'En attente de préparation' }}</p>
                    </div>
                </div>

                <!-- Step 3 -->
                <div class="relative">
                    <div class="absolute -left-12 w-8 h-8 rounded-xl flex items-center justify-center {{ in_array($status, ['en_livraison', 'livree']) ? 'bg-[#065F46] text-white' : 'bg-muted text-muted-foreground' }} z-10 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                    </div>
                    <div>
                        <h4 class="font-black text-sm {{ in_array($status, ['en_livraison', 'livree']) ? 'text-foreground' : 'text-muted-foreground' }}">Livraison</h4>
                        <p class="text-[10px] font-bold text-muted-foreground">{{ $status === 'livree' ? 'Commande livrée' : ($status === 'en_livraison' ? 'En cours de livraison' : 'En attente d’expédition') }}</p>
                    </div>
                </div>
            </div>

            <!-- Items & Footer -->
            <div class="grid grid-cols-2 gap-4 mb-8">
                <div class="bg-muted/30 rounded-2xl p-4">
                    <p class="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">ITEMS</p>
                    <p class="text-[10px] font-black text-foreground">{{ $order->items->count() }}x {{ $order->items->first()->product->{'name_'.app()->getLocale()} }}</p>
                </div>
                <div class="bg-muted/30 rounded-2xl p-4">
                    <p class="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">TOTAL</p>
                    <p class="text-[10px] font-black text-foreground">{{ number_format($order->totalAmount, 2) }} {{ __('website.currency') }}</p>
                </div>
            </div>

            <div class="flex items-center justify-between pt-6 border-t border-border/20">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div>
                        <p class="text-[10px] font-bold text-foreground">Courier: Marcus V.</p>
                    </div>
                </div>
                <button class="px-6 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all">Track Live</button>
            </div>
        </div>
        @empty
        <div class="py-20 text-center space-y-4 glass rounded-[40px] border border-border/40">
            <div class="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto text-muted-foreground/40">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <p class="text-muted-foreground font-bold uppercase tracking-widest text-xs">You haven't placed any orders yet</p>
            <a href="{{ route('public.all-products') }}" class="inline-block px-8 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Start Shopping</a>
        </div>
        @endforelse
    </div>
</div>

<!-- Floating Action Button for Contact Support -->
<div class="fixed bottom-32 right-8 z-50">
    <button class="w-14 h-14 bg-[#065F46] text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-900/40 hover:scale-110 active:scale-95 transition-all">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
    </button>
</div>
@endsection
