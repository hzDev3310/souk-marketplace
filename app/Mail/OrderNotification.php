<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class OrderNotification extends Mailable
{
    use Queueable;

    public function __construct(
        public Order $order,
        public string $recipientName,
        public string $recipientRole,
        public string $event,
        public ?string $previousStatus,
        string $locale,
    ) {
        $this->locale(in_array($locale, ['en', 'fr', 'ar'], true) ? $locale : config('app.locale', 'en'));
    }

    public function envelope(): Envelope
    {
        $subject = $this->event === 'placed'
            ? __('email.order.subjectPlaced', ['number' => $this->order->order_number])
            : __('email.order.subjectStatus', ['number' => $this->order->order_number]);

        return new Envelope(
            subject: $subject,
            from: new Address(config('mail.from.address'), config('mail.from.name', 'Souk AI')),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-notification',
            with: [
                'order' => $this->order,
                'recipientName' => $this->recipientName,
                'recipientRole' => $this->recipientRole,
                'event' => $this->event,
                'previousStatus' => $this->previousStatus,
                'locale' => $this->locale,
            ],
        );
    }
}
