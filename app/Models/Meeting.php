<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Meeting extends Model
{
    use HasFactory;

    protected $fillable = [
        'meetable_type',
        'meetable_id',
        'title',
        'agenda',
        'meeting_date',
        'meeting_link',
        'minutes',
    ];

    protected $casts = [
        'meeting_date' => 'datetime',
    ];

    /**
     * Get the parent meetable model (Committee or Board).
     */
    public function meetable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope to get upcoming meetings.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('meeting_date', '>=', now())
            ->orderBy('meeting_date', 'asc');
    }

    /**
     * Scope to get past meetings.
     */
    public function scopePast($query)
    {
        return $query->where('meeting_date', '<', now())
            ->orderBy('meeting_date', 'desc');
    }

    /**
     * Check if the meeting is in the past.
     */
    public function isPast(): bool
    {
        return $this->meeting_date < now();
    }

    /**
     * Check if the meeting has minutes.
     */
    public function hasMinutes(): bool
    {
        return !empty($this->minutes);
    }
}
