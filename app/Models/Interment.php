<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Interment extends Model
{
    /** @use HasFactory<\Database\Factories\IntermentFactory> */
    use HasFactory;

    protected $fillable = [
        'deed_id',
        'gravesite_id',
        'member_id',
        'first_name',
        'last_name',
        'middle_name',
        'hebrew_name',
        'date_of_birth',
        'date_of_death',
        'interment_date',
        'cause_of_death',
        'funeral_home',
        'rabbi_officiating',
        'notes',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'date_of_death' => 'date',
        'interment_date' => 'date',
    ];

    /**
     * Get the deed this interment belongs to.
     */
    public function deed(): BelongsTo
    {
        return $this->belongsTo(Deed::class);
    }

    /**
     * Get the gravesite this interment belongs to.
     */
    public function gravesite(): BelongsTo
    {
        return $this->belongsTo(Gravesite::class);
    }

    /**
     * Get the member associated with this interment.
     */
    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    /**
     * Get the full name of the deceased.
     */
    public function getFullNameAttribute(): string
    {
        $parts = array_filter([
            $this->first_name,
            $this->middle_name,
            $this->last_name,
        ]);

        return implode(' ', $parts);
    }
}
