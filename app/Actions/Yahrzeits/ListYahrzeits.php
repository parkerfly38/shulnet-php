<?php

namespace App\Actions\Yahrzeits;

use App\Models\Yahrzeit;
use App\Services\HebrewCalendarService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ListYahrzeits
{
    public function __construct(protected HebrewCalendarService $hebrewCalendar) {}

    public function handle(
        ?string $search = null,
        ?string $startDate = null,
        ?string $endDate = null,
        int $perPage = 15,
    ): LengthAwarePaginator {
        $query = Yahrzeit::query()
            ->with(['members' => function ($query) {
                $query->select(['members.id', 'first_name', 'last_name', 'hebrew_name'])
                    ->withPivot('relationship');
            }])
            ->select([
                'id', 'name', 'hebrew_name', 'date_of_death',
                'hebrew_day_of_death', 'hebrew_month_of_death', 'hebrew_year_of_death',
                'observance_type', 'notes', 'created_at', 'updated_at',
            ])
            ->orderByRaw($this->surnameOrderExpression())
            ->orderBy('hebrew_month_of_death')
            ->orderBy('hebrew_day_of_death');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('hebrew_name', 'like', "%{$search}%")
                    ->orWhereHas('members', function ($memberQuery) use ($search) {
                        $memberQuery->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('hebrew_name', 'like', "%{$search}%")
                            ->orWhere('member_yahrzeit.relationship', 'like', "%{$search}%");
                    });
            });
        }

        if ($startDate && $endDate) {
            $searchDates = $this->hebrewCalendar->getHebrewDatesBetween($startDate, $endDate);

            $query->where(function ($q) use ($searchDates) {
                foreach ($searchDates as $date) {
                    $q->orWhere(function ($q2) use ($date) {
                        $q2->where('hebrew_day_of_death', $date['day'])
                            ->where('hebrew_month_of_death', $date['month']);
                    });
                }
            });
        }

        $yahrzeits = $query->paginate($perPage);

        $yahrzeits->getCollection()->transform(function ($yahrzeit) {
            $yahrzeit->next_observance_date = $this->nextObservanceDate($yahrzeit);

            return $yahrzeit;
        });

        return $yahrzeits;
    }

    private function nextObservanceDate(Yahrzeit $yahrzeit): mixed
    {
        try {
            if (! $yahrzeit->hebrew_day_of_death || ! $yahrzeit->hebrew_month_of_death) {
                return null;
            }

            $hebMonth = is_string($yahrzeit->hebrew_month_of_death)
                ? $this->hebrewCalendar->getMonthNumberFromName($yahrzeit->hebrew_month_of_death)
                : null;

            return $this->hebrewCalendar->getNextYahrzeitDate(
                $yahrzeit->hebrew_day_of_death,
                $hebMonth ?? $yahrzeit->hebrew_month_of_death
            );
        } catch (\Exception $e) {
            return null;
        }
    }

    private function surnameOrderExpression(): string
    {
        return match (DB::connection()->getDriverName()) {
            'sqlite' => "substr(name, instr(name, ' ') + 1)",
            'pgsql' => "split_part(name, ' ', -1)",
            'mysql', 'mariadb' => "SUBSTRING_INDEX(name, ' ', -1)",
            'sqlsrv' => "RIGHT(name, CHARINDEX(' ', REVERSE(name) + ' ') - 1)",
            default => throw new \RuntimeException(
                'Surname ordering is not configured for database driver ['.DB::connection()->getDriverName().'].'
            ),
        };
    }
}
