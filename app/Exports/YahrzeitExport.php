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
            $query->whereBetween('hebrew_date', [$this->startDate, $this->endDate]);
        }

        return $query->orderBy('hebrew_date')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Name',
            'Hebrew Name',
            'Hebrew Date',
            'Gregorian Date',
            'Observance Type',
            'Relationship',
            'Associated Members',
            'Created At',
        ];
    }

    public function map($yahrzeit): array
    {
        $memberNames = $yahrzeit->members->map(function ($member) {
            return $member->first_name.' '.$member->last_name;
        })->join(', ');

        return [
            $yahrzeit->id,
            $yahrzeit->name,
            $yahrzeit->hebrew_name,
            $yahrzeit->hebrew_date,
            $yahrzeit->gregorian_date ? $yahrzeit->gregorian_date->format('Y-m-d') : '',
            $yahrzeit->observance_type,
            $yahrzeit->relationship,
            $memberNames,
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
