<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RideRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'requester_id',
        'driver_id',
        'service_at',
        'pickup_location',
        'passenger_count',
        'notes',
        'claimed_at',
    ];

    protected $casts = [
        'service_at' => 'datetime',
        'claimed_at' => 'datetime',
    ];

    public function requester(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'requester_id');
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'driver_id');
    }
}
