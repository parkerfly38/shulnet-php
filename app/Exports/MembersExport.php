<?php

namespace App\Exports;

use App\Models\Member;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class MembersExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Member::query();

        if (! empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (! empty($this->filters['member_type'])) {
            $query->where('member_type', $this->filters['member_type']);
        }

        return $query->orderBy('last_name')->orderBy('first_name')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Title',
            'First Name',
            'Last Name',
            'Email',
            'Phone 1',
            'Phone 2',
            'Member Type',
            'Address Line 1',
            'Address Line 2',
            'City',
            'State',
            'Zip',
            'Country',
            'Date of Birth',
            'Gender',
            'Created At',
        ];
    }

    public function map($member): array
    {
        return [
            $member->id,
            $member->title,
            $member->first_name,
            $member->last_name,
            $member->email,
            $member->phone1,
            $member->phone2,
            $member->member_type,
            $member->address_line_1,
            $member->address_line_2,
            $member->city,
            $member->state,
            $member->zip,
            $member->country,
            $member->dob ?? '',
            $member->gender,
            $member->created_at ? $member->created_at->format('Y-m-d H:i:s') : '',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
