<?php

namespace App\Services;

use App\Mail\OrderNotification;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OrderNotificationService
{
    public function orderPlaced(Order $order, string $locale): void
    {
        $this->send($order, 'placed', null, $locale);
    }

    public function statusChanged(Order $order, string $previousStatus, string $locale): void
    {
        if ($previousStatus !== $order->status) {
            $this->send($order, 'status_changed', $previousStatus, $locale);
        }
    }

    private function send(Order $order, string $event, ?string $previousStatus, string $locale): void
    {
        $order->loadMissing(['client.user', 'items.product.store.user']);

        $recipients = collect();

        if ($client = $order->client?->user) {
            $recipients->push(['user' => $client, 'role' => 'client']);
        }

        $order->items
            ->map(fn ($item) => $item->product?->store?->user)
            ->filter()
            ->unique('id')
            ->each(fn (User $user) => $recipients->push(['user' => $user, 'role' => 'store']));

        User::query()
            ->whereRaw('UPPER(role) = ?', ['ADMIN'])
            ->whereNotNull('email')
            ->get()
            ->each(fn (User $user) => $recipients->push(['user' => $user, 'role' => 'admin']));

        $recipients
            ->filter(fn (array $recipient) => filled($recipient['user']->email))
            ->unique(fn (array $recipient) => strtolower($recipient['user']->email))
            ->each(function (array $recipient) use ($order, $event, $previousStatus, $locale) {
                $user = $recipient['user'];

                try {
                    Mail::to($user->email)->send(
                        new OrderNotification(
                            $order,
                            trim($user->name . ' ' . $user->family_name),
                            $recipient['role'],
                            $event,
                            $previousStatus,
                            $locale,
                        )
                    );
                } catch (\Throwable $exception) {
                    Log::warning('Order notification could not be sent.', [
                        'order_id' => $order->id,
                        'recipient_role' => $recipient['role'],
                        'recipient' => $user->email,
                        'exception' => $exception->getMessage(),
                    ]);
                }
            });
    }
}
