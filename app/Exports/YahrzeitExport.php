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
    protected $month;

    public function __construct($month = null)
    {
        $this->month = $month;
    }

    public function collection()
    {
        $query = Yahrzeit::with('members');

        if ($this->month) {
            // Filter by Hebrew month of death if provided
            $query->where('hebrew_month_of_death', $this->month);
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
