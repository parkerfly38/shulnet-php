<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Board extends Model
{
    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Get the members that belong to this board.
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Member::class, 'board_member')
            ->withPivot('title', 'term_start_date', 'term_end_date')
            ->withTimestamps()
            ->orderByPivot('term_start_date', 'desc');
    }

    /**
     * Get only active members (end date in future or null).
     */
    public function activeMembers(): BelongsToMany
    {
        return $this->members()
            ->where(function ($query) {
                $query->whereNull('board_member.term_end_date')
                    ->orWhere('board_member.term_end_date', '>=', now()->toDateString());
            });
    }

    /**
     * Get all meetings for this board.
     */
    public function meetings(): MorphMany
    {
        return $this->morphMany(Meeting::class, 'meetable')
            ->orderBy('meeting_date', 'desc');
    }
}
