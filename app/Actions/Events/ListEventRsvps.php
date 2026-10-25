<?php

namespace App\Actions\Events;

use App\Models\EventRSVP;
use Illuminate\Pagination\LengthAwarePaginator;

class ListEventRsvps
{
    public function handle(int|string|null $eventId = null, ?string $status = null, int $perPage = 50): LengthAwarePaginator
    {
        $query = EventRSVP::with(['event', 'member', 'ticketType'])
            ->orderBy('created_at', 'desc');

        if ($eventId) {
            $query->where('event_id', $eventId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        return $query->paginate($perPage);
    }
}
