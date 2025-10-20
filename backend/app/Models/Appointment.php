<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Appointment extends Model
{
    protected $fillable = [
        'user_id',
        'appointment_date',
        'appointment_time',
        'status',
        'notes'
    ];

    protected $casts = [
        'appointment_date' => 'date',
    ];

    /**
     * Get the user that owns the appointment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the pets for the appointment.
     */
    public function pets(): HasMany
    {
        return $this->hasMany(Pet::class);
    }

    /**
     * Get the services for the appointment.
     */
    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class);
    }
}
