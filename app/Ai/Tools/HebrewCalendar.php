<?php

namespace App\Ai\Tools;

use App\Services\HebrewCalendarService;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Carbon;
use Laravel\Ai\Tools\Request;
use Stringable;

class HebrewCalendar extends AdminTool
{
    public function __construct(protected HebrewCalendarService $calendar) {}

    public function description(): Stringable|string
    {
        return 'Hebrew calendar lookups. Without a date it returns today\'s Hebrew date. '
            .'With a Gregorian date (YYYY-MM-DD) it converts that date to the Hebrew date.';
    }

    protected function execute(Request $request): array
    {
        $date = $request['date'] ?? null;

        if ($date !== null) {
            try {
                $valid = preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)
                    && Carbon::createFromFormat('Y-m-d', $date)->format('Y-m-d') === $date;
            } catch (\Throwable) {
                $valid = false;
            }

            if (! $valid) {
                return ['error' => 'date must be a valid YYYY-MM-DD date.'];
            }
        }

        $date ??= now()->toDateString();
        $hebrew = $this->calendar->gregorianToHebrew($date);

        return [
            'gregorian_date' => $date,
            'hebrew_date' => $hebrew['formatted'],
            'day' => $hebrew['day'],
            'month' => $hebrew['month'],
            'year' => $hebrew['year'],
            'is_leap_year' => $hebrew['isLeapYear'],
        ];
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'date' => $schema->string()->description('Gregorian date YYYY-MM-DD. Omit for today.'),
        ];
    }
}
