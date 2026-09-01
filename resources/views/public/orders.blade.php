@extends('layouts.public')

@section('seo')
    <title>{{ __('website.orders.title') }} - Souk AI</title>
    <style>
        .stepper-horizontal { display: flex; justify-content: space-between; align-items: center; position: relative; }
        .stepper-horizontal::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 2px; background: #E2E8F0; z-index: 0; transform: translateY(-50%); }
        .stepper-progress { position: absolute; top: 50%; left: 0; height: 2px; background: var(--primary); z-index: 1; transform: translateY(-50%); transition: width 0.5s ease; }
        .stepper-step { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; }
        .step-circle { width: 32px; height: 32px; border-radius: 50%; background: white; border: 2px solid #E2E8F0; display: flex; items-center: center; justify-content: center; font-size: 14px; transition: all 0.3s ease; }
        .step-active .step-circle { border-color: var(--primary); background: var(--primary); color: white; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2); }
        .step-completed .step-circle { border-color: var(--primary); background: var(--primary); color: white; }
        .step-label { margin-top: 8px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #64748B; }
        .step-active .step-label { color: var(--primary); }
        
        /* Mobile Stepper (Vertical) */
        .stepper-vertical { display: flex; flex-direction: column; gap: 24px; position: relative; padding-left: 24px; }
        .stepper-vertical::before { content: ''; position: absolute; left: 7px; top: 0; bottom: 0; width: 2px; background: #E2E8F0; }
        .v-step-circle { position: absolute; left: -24px; width: 16px; height: 16px; border-radius: 50%; background: white; border: 2px solid #E2E8F0; z-index: 2; }
        .v-step-active .v-step-circle { border-color: var(--primary); background: var(--primary); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2); }
        .v-step-completed .v-step-circle { border-color: var(--primary); background: var(--primary); }
    </style>
@endsection

@section('content')
<div class="max-w-4xl mx-auto px-4 md:px-0">
    <div class="mb-12">
        <h1 class="text-4xl font-black text-foreground tracking-tight uppercase">{{ __('website.orders.title') }}</h1>
        <p class="text-muted-foreground font-medium">{{ __('website.orders.subtitle') }}</p>
    </div>

    <div class="space-y-8">
        @forelse($orders as $order)
            @php
                $status = $order->status;
                $steps = [
                    'en_attente' => ['index' => 0, 'label' => __('website.status.pending'), 'color' => '#6366F1'],
                    'confirme' => ['index' => 1, 'label' => __('website.status.confirmed'), 'color' => '#10B981'],
                    'imported_to_depot' => ['index' => 2, 'label' => __('website.status.warehouse'), 'color' => '#6366F1'],
                    'en_livraison' => ['index' => 3, 'label' => __('website.status.delivery'), 'color' => '#4F46E5'],
                    'livree' => ['index' => 4, 'label' => __('website.status.delivered'), 'color' => '#10B981'],
                ];
                
                $isCancelled = ($status === 'annule' || $status === 'retournee');
                $currentIndex = $steps[$status]['index'] ?? 0;
                $progressWidth = ($currentIndex / 4) * 100;
                
                $statusConfig = [
                    'en_attente' => ['bg' => 'bg-indigo-500/10', 'text' => 'text-indigo-600', 'label' => __('website.status.pending')],
                    'confirme' => ['bg' => 'bg-emerald-500/10', 'text' => 'text-emerald-600', 'label' => __('website.status.confirmed')],
                    'imported_to_depot' => ['bg' => 'bg-slate-500/10', 'text' => 'text-slate-600', 'label' => __('website.status.warehouse')],
                    'en_livraison' => ['bg' => 'bg-blue-500/10', 'text' => 'text-blue-600', 'label' => __('website.status.delivery')],
                    'livree' => ['bg' => 'bg-emerald-500/10', 'text' => 'text-emerald-600', 'label' => __('website.status.delivered')],
                    'annule' => ['bg' => 'bg-red-500/10', 'text' => 'text-red-600', 'label' => __('website.status.cancelled')],
                    'retournee' => ['bg' => 'bg-orange-500/10', 'text' => 'text-orange-600', 'label' => __('website.status.returned')],
                ];
                $currentCfg = $statusConfig[$status] ?? ['bg' => 'bg-muted/10', 'text' => 'text-muted-foreground', 'label' => strtoupper($status)];
            @endphp

            <div class="bg-card border border-border/40 rounded-[40px] p-6 md:p-10 premium-shadow">
                <!-- Header -->
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h3 class="text-lg font-black text-foreground">#{{ $order->order_number }}</h3>
                        <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest">{{ $order->created_at->format('M d, Y') }}</p>
                    </div>
                    <div class="px-5 py-2 rounded-full {{ $currentCfg['bg'] }} {{ $currentCfg['text'] }} text-[10px] font-black uppercase tracking-[0.15em]">
                        {{ $currentCfg['label'] }}
                    </div>
                </div>

                @if(!$isCancelled)
                    <!-- Desktop Stepper -->
                    <div class="hidden md:block mb-12 px-4">
                        <div class="stepper-horizontal">
                            <div class="stepper-progress" style="width: {{ $progressWidth }}%"></div>
                            @foreach($steps as $key => $step)
                                <div class="stepper-step {{ $currentIndex >= $step['index'] ? ($currentIndex == $step['index'] ? 'step-active' : 'step-completed') : '' }}">
                                    <div class="step-circle">
                                        @if($currentIndex > $step['index'])
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                        @else
                                            {{ $step['index'] + 1 }}
                                        @endif
                                    </div>
                                    <span class="step-label">{{ $step['label'] }}</span>
                                </div>
                            @endforeach
                        </div>
                    </div>

                    <!-- Mobile Stepper -->
                    <div class="md:hidden mb-10">
                        <div class="stepper-vertical">
                            @foreach($steps as $key => $step)
                                <div class="relative {{ $currentIndex >= $step['index'] ? ($currentIndex == $step['index'] ? 'v-step-active' : 'v-step-completed') : '' }}">
                                    <div class="v-step-circle"></div>
                                    <div class="pl-4">
                                        <h4 class="text-xs font-black uppercase tracking-widest {{ $currentIndex >= $step['index'] ? 'text-foreground' : 'text-muted-foreground' }}">
                                            {{ $step['label'] }}
                                        </h4>
                                        @if($currentIndex == $step['index'])
                                            <p class="text-[10px] font-medium text-muted-foreground mt-1">{{ __('website.orders.currentStep') }}</p>
                                        @endif
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    </div>
                @else
                    <div class="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl mb-10">
                        <p class="text-xs font-bold text-red-600 text-center uppercase tracking-widest">
                            {{ $status === 'annule' ? __('website.orders.cancelledMessage') : __('website.orders.returnedMessage') }}
                        </p>
                    </div>
                @endif

                <!-- Items -->
                <div class="space-y-4 mb-10">
                    @foreach($order->items as $item)
                        <div class="flex items-center gap-4 p-4 bg-muted/20 rounded-3xl">
                            <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white border border-border/20">
                                @if($item->product->albums->first())
                                    <img src="{{ $item->product->albums->first()->file }}" class="w-full h-full object-cover">
                                @endif
                            </div>
                            <div class="flex-1">
                                <h4 class="text-sm font-black text-foreground">{{ $item->product->{'name_'.app()->getLocale()} }}</h4>
                                <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Qty: {{ $item->quantity }} • {{ number_format($item->price, 2) }} {{ __('website.currency') }}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-black text-foreground">{{ number_format($item->price * $item->quantity, 2) }}</p>
                            </div>
                        </div>
                    @endforeach
                </div>

                <!-- Footer Actions -->
                <div class="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-border/20 gap-4">
                    <div class="text-center sm:text-left">
                        <p class="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{{ __('website.cart.total') }}</p>
                        <p class="text-2xl font-black text-primary">{{ number_format($order->totalAmount, 2) }} <span class="text-xs">{{ __('website.currency') }}</span></p>
                    </div>
                    <div class="flex gap-3 w-full sm:w-auto">
                        @if($status === 'en_attente')
                            <form action="{{ route('public.orders.cancel', $order) }}" method="POST" class="w-full sm:w-auto">
                                @csrf
                                <button type="submit" onclick="return confirm('Are you sure?')" class="w-full sm:px-8 py-4 bg-red-500/10 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500/20 transition-all">
                                    {{ __('website.orders.cancelBtn') }}
                                </button>
                            </form>
                        @endif
                        <a href="{{ route('public.contact') }}" class="flex-1 sm:flex-none sm:px-8 py-4 bg-muted text-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-muted/80 transition-all text-center">
                            {{ __('website.orders.helpBtn') }}
                        </a>
                    </div>
                </div>
            </div>
        @empty
            <div class="py-32 text-center bg-card rounded-[40px] border border-border/40 premium-shadow">
                <div class="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-8 text-muted-foreground/40">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                </div>
                <h3 class="text-xl font-black text-foreground mb-2">{{ __('website.orders.empty') }}</h3>
                <p class="text-muted-foreground font-medium mb-8">{{ __('website.orders.emptyDesc') }}</p>
                <a href="{{ route('public.all-products') }}" class="inline-block px-12 py-5 bg-primary text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
                    {{ __('website.orders.startShopping') }}
                </a>
            </div>
        @endforelse
    </div>
</div>
@endsection
