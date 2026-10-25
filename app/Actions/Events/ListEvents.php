<?php

namespace App\Actions\Events;

use App\Models\Event;
use Illuminate\Pagination\LengthAwarePaginator;

class ListEvents
{
    public function handle(
        ?string $search = null,
        int|string|null $calendar = null,
        int $perPage = 15,
    ): LengthAwarePaginator {
        $query = Event::query()
            ->with(['calendar'])
            ->select([
                'id', 'calendar_id', 'name', 'description', 'event_start', 'event_end',
                'all_day', 'location', 'members_only', 'created_at', 'updated_at',
            ])
            ->orderBy('event_start', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($calendar) {
            $query->where('calendar_id', $calendar);
        }

        return $query->paginate($perPage);
    }
}
