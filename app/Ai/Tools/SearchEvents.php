<?php

namespace App\Ai\Tools;

use App\Actions\Events\ListEvents;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Tools\Request;
use Stringable;

class SearchEvents extends AdminTool
{
    public function __construct(protected ListEvents $listEvents) {}

    public function description(): Stringable|string
    {
        return 'Search calendar events by name or description, newest first.';
    }

    protected function execute(Request $request): array
    {
        $results = $this->listEvents->handle(
            $request['search'] ?? null,
            $request['calendar_id'] ?? null,
            $this->limit($request),
        );

        return [
            'total' => $results->total(),
            'events' => $results->getCollection()->map(fn ($e) => [
                'id' => $e->id,
                'name' => $e->name,
                'description' => $e->description,
                'start' => $e->event_start,
                'end' => $e->event_end,
                'all_day' => $e->all_day,
                'location' => $e->location,
                'members_only' => $e->members_only,
                'calendar' => $e->calendar?->name,
            ])->values(),
        ];
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'search' => $schema->string()->description('Text to look for in event name or description.'),
            'calendar_id' => $schema->integer()->description('Restrict to one calendar.'),
            'limit' => $schema->integer()->description('Max results (default 10, max 25).'),
        ];
    }
}
