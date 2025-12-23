<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MembershipPeriod extends Model
{
    /** @use HasFactory<\Database\Factories\MembershipPeriodFactory> */
    use HasFactory;

    protected $fillable = [
        'member_id',
        'invoice_id',
        'begin_date',
        'end_date',
        'membership_type',
        'notes',
    ];

    protected $casts = [
        'begin_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Get the member that owns this membership period.
     */
    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    /**
     * Get the invoice associated with this membership period.
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Scope to get active memberships (no end date or end date in the future).
     */
    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('end_date')
              ->orWhere('end_date', '>=', now());
        });
    }

    /**
     * Scope to get expired memberships.
     */
    public function scopeExpired($query)
    {
        return $query->whereNotNull('end_date')
                    ->where('end_date', '<', now());
    }
}
