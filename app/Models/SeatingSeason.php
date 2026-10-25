<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class SeatingSeason extends Model
{
    protected $fillable = [
        'seating_chart_id',
        'name',
        'first_service_date',
        'member_sales_enabled',
        'sale_starts_at',
        'sale_ends_at',
        'renewal_ends_at',
        'max_seats_per_member',
        'gl_account_id',
        'notes',
    ];

    protected $casts = [
        'first_service_date' => 'date',
        'member_sales_enabled' => 'boolean',
        'sale_starts_at' => 'datetime',
        'sale_ends_at' => 'datetime',
        'renewal_ends_at' => 'datetime',
        'max_seats_per_member' => 'integer',
    ];

    public function chart(): BelongsTo
    {
        return $this->belongsTo(SeatingChart::class, 'seating_chart_id');
    }

    public function glAccount(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'gl_account_id');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(SeatAssignment::class);
    }

    public function invoices(): MorphMany
    {
        return $this->morphMany(Invoice::class, 'invoiceable');
    }

    /**
     * Assignments that currently block a seat: reservations, plus renewal
     * offers while the priority window is still open.
     */
    public function activeAssignments(): HasMany
    {
        return $this->assignments()->where(function (Builder $query) {
            $query->where('status', SeatAssignment::STATUS_RESERVED);

            if ($this->isRenewalWindowOpen()) {
                $query->orWhere('status', SeatAssignment::STATUS_RENEWAL);
            }
        });
    }

    public function isRenewalWindowOpen(): bool
    {
        return $this->renewal_ends_at !== null && now()->lte($this->renewal_ends_at);
    }

    /**
     * Whether members can pick new seats in the member portal right now.
     */
    public function isOpenForMembers(): bool
    {
        if (! $this->member_sales_enabled) {
            return false;
        }

        $now = now();

        if ($this->sale_starts_at && $now->lt($this->sale_starts_at)) {
            return false;
        }

        if ($this->sale_ends_at && $now->gt($this->sale_ends_at)) {
            return false;
        }

        return true;
    }

    /**
     * Whether members can see the season, either to buy or to confirm renewals.
     */
    public function isVisibleToMembers(): bool
    {
        if (! $this->member_sales_enabled) {
            return false;
        }

        return $this->isOpenForMembers() || $this->isRenewalWindowOpen();
    }

    public function scopeVisibleToMembers(Builder $query): Builder
    {
        $now = now();

        return $query->where('member_sales_enabled', true)
            ->where(function (Builder $q) use ($now) {
                $q->where(function (Builder $open) use ($now) {
                    $open->where(fn ($s) => $s->whereNull('sale_starts_at')->orWhere('sale_starts_at', '<=', $now))
                        ->where(fn ($e) => $e->whereNull('sale_ends_at')->orWhere('sale_ends_at', '>=', $now));
                })->orWhere('renewal_ends_at', '>=', $now);
            });
    }
}
