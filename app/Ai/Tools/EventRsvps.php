<?php

namespace App\Ai\Tools;

use App\Actions\Events\ListEventRsvps;
use App\Models\Event;
use App\Models\EventRSVP;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Tools\Request;
use Stringable;

class EventRsvps extends AdminTool
{
    public function __construct(protected ListEventRsvps $listRsvps) {}

    public function description(): Stringable|string
    {
        return 'Get RSVPs for an event: headcount totals by status plus the most recent RSVPs. '
            .'Provide event_id, or event_name to look it up by name (most recent match). '
            .'Status values: pending, confirmed, cancelled.';
    }

    protected function execute(Request $request): array
    {
        $event = isset($request['event_id'])
            ? Event::find($request['event_id'])
            : (isset($request['event_name'])
                ? Event::where('name', 'like', '%'.$request['event_name'].'%')->orderByDesc('event_start')->first()
                : null);

        if (! $event) {
            return ['error' => 'Event not found. Provide a valid event_id or event_name.'];
        }

        $totals = EventRSVP::where('event_id', $event->id)
            ->selectRaw('status, COUNT(*) as rsvps, COALESCE(SUM(quantity), 0) as tickets, COALESCE(SUM(guests), 0) as guests, COALESCE(SUM(total_amount), 0) as revenue')
            ->groupBy('status')
            ->get()
            ->mapWithKeys(fn ($r) => [$r->status => [
                'rsvps' => (int) $r->rsvps,
                'tickets' => (int) $r->tickets,
                'guests' => (int) $r->guests,
                'revenue' => round((float) $r->revenue, 2),
            ]]);

        $list = $this->listRsvps->handle($event->id, $request['status'] ?? null, $this->limit($request));

        return [
            'event' => ['id' => $event->id, 'name' => $event->name, 'start' => $event->event_start, 'max_rsvp' => $event->maxrsvp],
            'totals_by_status' => $totals,
            'total_rsvps' => $list->total(),
            'rsvps' => $list->getCollection()->map(fn ($r) => [
                'name' => $r->member ? trim("{$r->member->first_name} {$r->member->last_name}") : $r->name,
                'email' => $r->email ?? $r->member?->email,
                'status' => $r->status,
                'guests' => $r->guests,
                'quantity' => $r->quantity,
                'ticket_type' => $r->ticketType?->name,
                'total_amount' => $r->total_amount,
                'notes' => $r->notes,
            ])->values(),
        ];
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'event_id' => $schema->integer()->description('The event id.'),
            'event_name' => $schema->string()->description('Part of the event name, if the id is unknown.'),
            'status' => $schema->string()->enum(['pending', 'confirmed', 'cancelled'])->description('Only list RSVPs with this status.'),
            'limit' => $schema->integer()->description('Max RSVPs to list (default 10, max 25).'),
        ];
    }
}
