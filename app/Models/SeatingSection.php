<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SeatingSection extends Model
{
    protected $fillable = [
        'seating_chart_id',
        'name',
        'color',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    public function chart(): BelongsTo
    {
        return $this->belongsTo(SeatingChart::class, 'seating_chart_id');
    }

    public function seats(): HasMany
    {
        return $this->hasMany(Seat::class);
    }
}
