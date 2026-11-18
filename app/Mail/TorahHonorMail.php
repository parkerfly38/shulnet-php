<?php

namespace App\Mail;

use App\Models\GabbaiAssignment;
use App\Services\HonorLetterService;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Tells a member about their Torah honor, either when it is assigned or as a reminder before the service.
 */
class TorahHonorMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public GabbaiAssignment $assignment,
        public bool $reminder = false,
    ) {}

    public function envelope(): Envelope
    {
        $what = HonorLetterService::honorName($this->assignment->honor).' on '.$this->assignment->date->format('F j');

        return new Envelope(
            subject: ($this->reminder ? 'Reminder: Your Torah Honor, ' : 'Your Torah Honor: ').$what,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.torah-honor',
            with: [
                // Same template as the printed letters, editable under PDF Templates.
                'body' => app(HonorLetterService::class)->render($this->assignment, $this->reminder),
            ],
        );
    }
}
