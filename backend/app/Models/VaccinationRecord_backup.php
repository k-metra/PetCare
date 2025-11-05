<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VaccinationRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'given_date',
        'vaccine_name',
        'veterinarian',
        'diagnosis',
        'pet_id',
        'appointment_id',
        'user_id',
    ];

    protected $casts = [
        'given_date' => 'date',
    ];

    /**
     * Get the user (pet owner) that owns the vaccination record.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the appointment associated with the vaccination record.
     */
    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    /**
     * Scope to get vaccination records for a specific user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get vaccination records for a specific pet
     */
    public function scopeForPet($query, $petId)
    {
        return $query->where('pet_id', $petId);
    }

    /**
     * Scope to order by given date (most recent first)
     */
    public function scopeLatestFirst($query)
    {
        return $query->orderBy('given_date', 'desc');
    }
}
