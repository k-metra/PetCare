<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactFormMail extends Mailable
{
    use Queueable, SerializesModels;

    public $contactFormData;

    /**
     * Create a new message instance.
     */
    public function __construct($contactFormData)
    {
        $this->contactFormData = $contactFormData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Contact Form Mail - PetMedics Veterinary Clinic',
        );
    }

    public function build() {
        return $this->subject('Contact Form Mail - PetMedics Veterinary Clinic')
                    ->view('emails.contact-form')
                    ->with(['contactFormData' => $this->contactFormData]);
    }

    /**
     * Get the message content definition.
     */

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
