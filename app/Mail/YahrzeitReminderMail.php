<?php

namespace App\Mail;

use App\Models\Member;
use App\Models\Yahrzeit;
use App\Services\YahrzeitLetterService;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class YahrzeitReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Yahrzeit $yahrzeit,
        public string $gregorianDate,
        public string $recipientName,
        public ?Member $member = null,
    ) {
        //
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Yahrzeit Reminder: '.$this->yahrzeit->name,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.yahrzeit-reminder',
            with: [
                // Same template as the printed letters, editable under PDF Templates.
                'body' => app(YahrzeitLetterService::class)->render($this->yahrzeit, $this->gregorianDate, $this->recipientName, $this->member),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
