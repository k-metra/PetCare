<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pet extends Model
{
    protected $fillable = [
        'appointment_id',
        'type',
        'breed',
        'name',
        'grooming_details',
        'dental_care_details'
    ];

    protected $casts = [
        'grooming_details' => 'array',
        'dental_care_details' => 'array'
    ];

    /**
     * Get the appointment that owns the pet.
     */
    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }
}
