<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeatAssignment extends Model
{
    public const STATUS_RENEWAL = 'renewal';

    public const STATUS_RESERVED = 'reserved';

    public const PRICING_MEMBER = 'member';

    public const PRICING_NONMEMBER = 'nonmember';

    protected $fillable = [
        'seating_season_id',
        'seat_id',
        'member_id',
        'status',
        'pricing',
        'price',
        'occupant_name',
        'invoice_id',
        'invoice_item_id',
        'source',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function season(): BelongsTo
    {
        return $this->belongsTo(SeatingSeason::class, 'seating_season_id');
    }

    public function seat(): BelongsTo
    {
        return $this->belongsTo(Seat::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function invoiceItem(): BelongsTo
    {
        return $this->belongsTo(InvoiceItem::class);
    }

    /**
     * Members get member pricing; contacts and prospects pay the non-member price.
     */
    public static function pricingFor(Member $member): string
    {
        return $member->member_type === 'member' ? self::PRICING_MEMBER : self::PRICING_NONMEMBER;
    }
}
