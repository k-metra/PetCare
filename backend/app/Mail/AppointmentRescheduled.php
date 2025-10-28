<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Appointment;

class AppointmentRescheduled extends Mailable
{
    use Queueable, SerializesModels;

    public $appointment;
    public $oldDate;
    public $oldTime;
    public $reason;

    /**
     * Create a new message instance.
     */
    public function __construct(Appointment $appointment, $oldDate = null, $oldTime = null, $reason = null)
    {
        $this->appointment = $appointment;
        $this->oldDate = $oldDate;
        $this->oldTime = $oldTime;
        $this->reason = $reason;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🔄 Appointment Rescheduled - PetMedics Veterinary Clinic',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.appointment-rescheduled',
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
