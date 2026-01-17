<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventTicketType extends Model
{
    protected $fillable = [
        'event_id',
        'name',
        'description',
        'category',
        'price',
        'quantity_available',
        'quantity_sold',
        'sale_starts',
        'sale_ends',
        'active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'quantity_available' => 'integer',
        'quantity_sold' => 'integer',
        'sale_starts' => 'datetime',
        'sale_ends' => 'datetime',
        'active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function isAvailable(): bool
    {
        if (! $this->active) {
            return false;
        }

        $now = now();

        if ($this->sale_starts && $now->lt($this->sale_starts)) {
            return false;
        }

        if ($this->sale_ends && $now->gt($this->sale_ends)) {
            return false;
        }

        if ($this->quantity_available !== null && $this->quantity_sold >= $this->quantity_available) {
            return false;
        }

        return true;
    }

    public function remainingQuantity(): ?int
    {
        if ($this->quantity_available === null) {
            return null;
        }

        return max(0, $this->quantity_available - $this->quantity_sold);
    }
}
