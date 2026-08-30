<?php

namespace App\Exports;

use App\Models\Yahrzeit;
use App\Services\HebrewCalendarService;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class YahrzeitExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
{
    protected $month;
    protected $search;
    protected $startDate;
    protected $endDate;
    protected $hebrewCalendar;

    public function __construct($month = null, $search = null, $startDate = null, $endDate = null)
    {
        $this->month = $month;
        $this->search = $search;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->hebrewCalendar = app(HebrewCalendarService::class);
    }

    public function collection(): Collection
    {
        $query = Yahrzeit::with('members');

        // Month filter (used by Reports section)
        if ($this->month) {
            $query->where('hebrew_month_of_death', $this->month);
        }

        // Search filter (used by Yahrzeit index page)
        if ($this->search) {
            $query->where(function ($q) {
                $q->where('name', 'like', "%{$this->search}%")
                    ->orWhere('hebrew_name', 'like', "%{$this->search}%")
                    ->orWhereHas('members', function ($memberQuery) {
                        $memberQuery->where('first_name', 'like', "%{$this->search}%")
                            ->orWhere('last_name', 'like', "%{$this->search}%")
                            ->orWhere('hebrew_name', 'like', "%{$this->search}%")
                            ->orWhere('member_yahrzeit.relationship', 'like', "%{$this->search}%");
                    });
            });
        }

        // Date range filter (used by Yahrzeit index page)
        if ($this->startDate && $this->endDate) {
            $searchDates = $this->hebrewCalendar->getHebrewDatesBetween($this->startDate, $this->endDate);

            $query->where(function ($q) use ($searchDates) {
                foreach ($searchDates as $date) {
                    $q->orWhere(function ($q2) use ($date) {
                        $q2->where('hebrew_day_of_death', $date['day'])
                           ->where('hebrew_month_of_death', $date['month']);
                    });
                }
            });
        }

        return $query->orderBy('hebrew_month_of_death')
            ->orderBy('hebrew_day_of_death')
            ->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Name',
            'Hebrew Name',
            'Hebrew Day',
            'Hebrew Month',
            'Hebrew Year',
            'Gregorian Date',
            'Observance Type',
            'Associated Members',
            'Relationships',
            'Notes',
            'Created At',
        ];
    }

    public function map($yahrzeit): array
    {
        $memberNames = $yahrzeit->members->map(function ($member) {
            return $member->first_name.' '.$member->last_name;
        })->join(', ');

        $relationships = $yahrzeit->members->map(function ($member) {
            return $member->pivot->relationship ?? '';
        })->filter()->join(', ');

        return [
            $yahrzeit->id,
            $yahrzeit->name,
            $yahrzeit->hebrew_name,
            $yahrzeit->hebrew_day_of_death,
            $yahrzeit->hebrew_month_of_death,
            $yahrzeit->hebrew_year_of_death,
            $yahrzeit->date_of_death ? $yahrzeit->date_of_death->format('Y-m-d') : '',
            $yahrzeit->observance_type,
            $memberNames,
            $relationships,
            $yahrzeit->notes,
            $yahrzeit->created_at ? $yahrzeit->created_at->format('Y-m-d H:i:s') : '',
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
