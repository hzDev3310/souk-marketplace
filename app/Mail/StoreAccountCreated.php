<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class StoreAccountCreated extends Mailable
{
    public function __construct(public User $user, public string $password)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Souk AI store account is ready',
            from: new Address(config('mail.from.address'), config('mail.from.name', 'Souk AI')),
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.store-account-created');
    }
}
