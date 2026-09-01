<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class GuestAccountCreated extends Mailable implements ShouldQueue
{
    use Queueable;

    public User $user;
    public string $password;

    public function __construct(User $user, string $password)
    {
        $this->user = $user;
        $this->password = $password;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Souk AI account is ready',
            from: new Address(env('MAIL_FROM_ADDRESS', 'hello@example.com'), 'Souk AI'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.guest-account-created',
            with: [
                'user' => $this->user,
                'password' => $this->password,
            ],
        );
    }
}
