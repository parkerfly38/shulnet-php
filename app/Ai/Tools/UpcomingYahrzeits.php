<?php

namespace App\Ai\Tools;

use App\Actions\Yahrzeits\ListYahrzeits;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Tools\Request;
use Stringable;

class UpcomingYahrzeits extends AdminTool
{
    public function __construct(protected ListYahrzeits $listYahrzeits) {}

    public function description(): Stringable|string
    {
        return 'List yahrzeits being observed in the coming days (default 7, max 60), soonest first, '
            .'with the Gregorian observance date. Use this for "who has a yahrzeit this week/month?".';
    }

    protected function execute(Request $request): array
    {
        $days = min(max((int) ($request['days'] ?? 7), 1), 60);
        $start = now()->toDateString();
        $end = now()->addDays($days)->toDateString();

        $results = $this->listYahrzeits->handle(null, $start, $end, 100);

        $upcoming = $results->getCollection()
            ->filter(fn ($y) => $y->next_observance_date && $y->next_observance_date <= $end)
            ->sortBy('next_observance_date')
            ->take(25)
            ->map(fn ($y) => [
                'id' => $y->id,
                'name' => $y->name,
                'hebrew_name' => $y->hebrew_name,
                'observance_date' => $y->next_observance_date,
                'hebrew_date' => trim("{$y->hebrew_day_of_death} {$y->hebrew_month_of_death}"),
                'members' => $y->members->map(fn ($m) => [
                    'name' => trim("{$m->first_name} {$m->last_name}"),
                    'relationship' => $m->pivot->relationship ?? null,
                ])->values(),
            ])
            ->values();

        return ['from' => $start, 'to' => $end, 'count' => $upcoming->count(), 'yahrzeits' => $upcoming];
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'days' => $schema->integer()->description('How many days ahead to look (default 7, max 60).'),
        ];
    }
}
