<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class SendOtpCode extends Mailable implements ShouldQueue
{
    use Queueable;

    public string $email;
    public string $code;

    public function __construct(string $email, string $code)
    {
        $this->email = $email;
        $this->code = $code;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Souk AI verification code',
            from: new Address(env('MAIL_FROM_ADDRESS', 'hello@example.com'), 'Souk AI'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.otp-code',
            with: [
                'email' => $this->email,
                'code' => $this->code,
            ],
        );
    }
}
