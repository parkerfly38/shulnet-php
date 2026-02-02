<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'reportable_type',
        'reportable_id',
        'title',
        'report_date',
        'content',
    ];

    protected $casts = [
        'report_date' => 'date',
    ];

    /**
     * Get the parent reportable model (committee or board).
     */
    public function reportable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope a query to only include recent reports.
     */
    public function scopeRecent($query, int $months = 12)
    {
        return $query->where('report_date', '>=', now()->subMonths($months))
            ->orderBy('report_date', 'desc');
    }

    /**
     * Scope a query to order reports by date descending.
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('report_date', 'desc');
    }
}
