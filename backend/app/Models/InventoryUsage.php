<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryUsage extends Model
{
    use HasFactory;

    protected $table = 'inventory_usage';

    protected $fillable = [
        'appointment_id',
        'product_id',
        'quantity_used',
        'unit_price',
        'total_price',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    /**
     * Get the appointment that this inventory usage belongs to.
     */
    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    /**
     * Get the product that was used.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}