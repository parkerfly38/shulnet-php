<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Deed extends Model
{
    /** @use HasFactory<\Database\Factories\DeedFactory> */
    use HasFactory;

    protected $fillable = [
        'member_id',
        'deed_number',
        'purchase_date',
        'purchase_price',
        'occupied',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'purchase_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get the member that owns the deed.
     */
    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    /**
     * Get the interments for this deed.
     */
    public function interments()
    {
        return $this->hasMany(Interment::class);
    }

    /**
     * Get the gravesites associated with this deed.
     */
    public function gravesites()
    {
        return $this->belongsToMany(Gravesite::class, 'deed_gravesite')
            ->withTimestamps();
    }

    /**
     * Get all invoices for this deed.
     */
    public function invoices(): MorphMany
    {
        return $this->morphMany(Invoice::class, 'invoiceable');
    }

    /**
     * Get the total capacity from all gravesites.
     */
    public function getTotalCapacityAttribute(): int
    {
        return $this->gravesites->sum(function ($gravesite) {
            return match($gravesite->gravesite_type) {
                'single', 'cremation' => 1,
                'double' => 2,
                'family' => 4,
                default => 1,
            };
        }) ?? 0;
    }

    /**
     * Check if the deed has available space.
     */
    public function hasAvailableSpace(): bool
    {
        return $this->occupied < $this->total_capacity;
    }

    /**
     * Get the available space.
     */
    public function getAvailableSpaceAttribute(): int
    {
        return max(0, $this->total_capacity - $this->occupied);
    }
}
