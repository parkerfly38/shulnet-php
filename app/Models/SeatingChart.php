<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class SeatingChart extends Model
{
    protected $fillable = [
        'name',
        'description',
        'image_path',
        'image_width',
        'image_height',
    ];

    protected $casts = [
        'image_width' => 'integer',
        'image_height' => 'integer',
    ];

    protected $appends = ['image_url'];

    public function sections(): HasMany
    {
        return $this->hasMany(SeatingSection::class)->orderBy('sort_order');
    }

    public function seats(): HasMany
    {
        return $this->hasMany(Seat::class);
    }

    public function seasons(): HasMany
    {
        return $this->hasMany(SeatingSeason::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path ? Storage::disk('public')->url($this->image_path) : null;
    }
}
