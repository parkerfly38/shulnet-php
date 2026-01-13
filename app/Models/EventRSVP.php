<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventRSVP extends Model
{
    /** @use HasFactory<\Database\Factories\EventRSVPFactory> */
    use HasFactory;

    protected $table = 'event_r_s_v_p_s';

    protected $fillable = [
        'member_id',
        'event_id',
        'event_ticket_type_id',
        'invoice_id',
        'name',
        'email',
        'phone',
        'guests',
        'quantity',
        'ticket_price',
        'total_amount',
        'status',
        'notes',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function ticketType(): BelongsTo
    {
        return $this->belongsTo(EventTicketType::class, 'event_ticket_type_id');
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
