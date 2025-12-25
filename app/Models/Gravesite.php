<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Gravesite extends Model
{
    /** @use HasFactory<\Database\Factories\GravesiteFactory> */
    use HasFactory;

    protected $fillable = [
        'cemetery_name',
        'section',
        'row',
        'plot_number',
        'block',
        'status',
        'gravesite_type',
        'size_length',
        'size_width',
        'member_id',
        'purchase_date',
        'purchase_price',
        'reserved_date',
        'reserved_by',
        'deceased_name',
        'deceased_hebrew_name',
        'date_of_birth',
        'date_of_death',
        'burial_date',
        'notes',
        'gps_coordinates',
        'perpetual_care',
        'monument_inscription',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'reserved_date' => 'date',
        'date_of_birth' => 'date',
        'date_of_death' => 'date',
        'burial_date' => 'date',
        'perpetual_care' => 'boolean',
        'purchase_price' => 'decimal:2',
        'size_length' => 'decimal:2',
        'size_width' => 'decimal:2',
    ];

    /**
     * Get the member that owns this gravesite.
     */
    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    /**
     * Get the deeds associated with this gravesite.
     */
    public function deeds()
    {
        return $this->belongsToMany(Deed::class, 'deed_gravesite')
            ->withTimestamps();
    }

    /**
     * Scope a query to only include available gravesites.
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    /**
     * Scope a query to only include reserved gravesites.
     */
    public function scopeReserved($query)
    {
        return $query->where('status', 'reserved');
    }

    /**
     * Scope a query to only include occupied gravesites.
     */
    public function scopeOccupied($query)
    {
        return $query->where('status', 'occupied');
    }

    /**
     * Get the full location string.
     */
    public function getFullLocationAttribute(): string
    {
        $parts = array_filter([
            $this->cemetery_name,
            $this->section ? "Section {$this->section}" : null,
            $this->row ? "Row {$this->row}" : null,
            $this->block ? "Block {$this->block}" : null,
            "Plot {$this->plot_number}",
        ]);

        return implode(', ', $parts);
    }
}
