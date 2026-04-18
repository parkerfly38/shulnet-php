<?php

namespace App\Exports;

use App\Models\Yahrzeit;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class YahrzeitExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
{
    protected $startDate;

    protected $endDate;

    public function __construct($startDate = null, $endDate = null)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        $query = Yahrzeit::with('members');

        if ($this->startDate && $this->endDate) {
            // Convert dates to Hebrew month/day for filtering
            // For now, filter by Gregorian date_of_death if provided
            $query->whereBetween('date_of_death', [$this->startDate, $this->endDate]);
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

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
