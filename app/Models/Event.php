<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    use HasFactory;

    protected $table = 'event';

    protected $fillable = [
        'name',
        'tagline',
        'event_start',
        'event_end',
        'registration_required',
        'registration_starts',
        'registration_ends',
        'earlybird',
        'earlybird_starts',
        'earlybird_ends',
        'registration_closed',
        'maxrsvp',
        'members_only',
        'allow_guests',
        'max_guests',
        'description',
        'rsvp_message',
        'online',
        'online_url',
        'all_day',
        'public',
        'location',
        'calendar_id'
    ];

    public function calendar(): BelongsTo
    {
        return $this->belongsTo(Calendar::class);
    }

    public function ticketTypes(): HasMany
    {
        return $this->hasMany(EventTicketType::class)->orderBy('sort_order');
    }

    public function rsvps(): HasMany
    {
        return $this->hasMany(EventRSVP::class);
    }
}