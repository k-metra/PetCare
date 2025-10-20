<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Service extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price'
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    /**
     * Get the appointments for the service.
     */
    public function appointments(): BelongsToMany
    {
        return $this->belongsToMany(Appointment::class);
    }
}
