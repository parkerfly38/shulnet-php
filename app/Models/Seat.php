<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Seat extends Model
{
    protected $fillable = [
        'seating_chart_id',
        'seating_section_id',
        'label',
        'x',
        'y',
        'member_price',
        'nonmember_price',
        'is_accessible',
        'is_active',
    ];

    protected $casts = [
        'x' => 'float',
        'y' => 'float',
        'member_price' => 'decimal:2',
        'nonmember_price' => 'decimal:2',
        'is_accessible' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function chart(): BelongsTo
    {
        return $this->belongsTo(SeatingChart::class, 'seating_chart_id');
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(SeatingSection::class, 'seating_section_id');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(SeatAssignment::class);
    }

    public function priceFor(string $pricing): float
    {
        return (float) ($pricing === SeatAssignment::PRICING_NONMEMBER ? $this->nonmember_price : $this->member_price);
    }
}
