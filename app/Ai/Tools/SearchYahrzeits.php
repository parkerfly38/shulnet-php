<?php

namespace App\Ai\Tools;

use App\Actions\Yahrzeits\ListYahrzeits;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Tools\Request;
use Stringable;

class SearchYahrzeits extends AdminTool
{
    public function __construct(protected ListYahrzeits $listYahrzeits) {}

    public function description(): Stringable|string
    {
        return 'Search yahrzeits (memorial anniversaries) by name or related member, optionally limited to those '
            .'observed between two Gregorian dates. Returns name, Hebrew date of death and next observance date.';
    }

    protected function execute(Request $request): array
    {
        $results = $this->listYahrzeits->handle(
            $request['search'] ?? null,
            $request['start_date'] ?? null,
            $request['end_date'] ?? null,
            $this->limit($request),
        );

        return [
            'total' => $results->total(),
            'yahrzeits' => $results->getCollection()->map(fn ($y) => [
                'id' => $y->id,
                'name' => $y->name,
                'hebrew_name' => $y->hebrew_name,
                'date_of_death' => $y->date_of_death,
                'hebrew_day_of_death' => $y->hebrew_day_of_death,
                'hebrew_month_of_death' => $y->hebrew_month_of_death,
                'next_observance_date' => $y->next_observance_date,
                'members' => $y->members->map(fn ($m) => [
                    'name' => trim("{$m->first_name} {$m->last_name}"),
                    'relationship' => $m->pivot->relationship ?? null,
                ])->values(),
            ])->values(),
        ];
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'search' => $schema->string()->description('Name, Hebrew name, or related member to search for.'),
            'start_date' => $schema->string()->description('Start of date range (YYYY-MM-DD). Requires end_date.'),
            'end_date' => $schema->string()->description('End of date range (YYYY-MM-DD). Requires start_date.'),
            'limit' => $schema->integer()->description('Max results (default 10, max 25).'),
        ];
    }
}
