<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Committee extends Model
{
    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Get the members that belong to this committee.
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Member::class, 'committee_member')
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
                $query->whereNull('committee_member.term_end_date')
                    ->orWhere('committee_member.term_end_date', '>=', now()->toDateString());
            });
    }
    /**
     * Get all meetings for this committee.
     */
    public function meetings(): MorphMany
    {
        return $this->morphMany(Meeting::class, 'meetable')
            ->orderBy('meeting_date', 'desc');
    }

    /**
     * Get all reports for this committee.
     */
    public function reports(): MorphMany
    {
        return $this->morphMany(Report::class, 'reportable')
            ->orderBy('report_date', 'desc');
    }
}
