<?php

namespace App\Exports;

use App\Models\Student;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StudentsExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Student::with(['parent']);

        if (! empty($this->filters['class_id'])) {
            $query->where('class_id', $this->filters['class_id']);
        }

        if (! empty($this->filters['grade_level'])) {
            $query->where('grade_level', $this->filters['grade_level']);
        }

        return $query->orderBy('last_name')->orderBy('first_name')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'First Name',
            'Last Name',
            'Hebrew Name',
            'Date of Birth',
            'Gender',
            'Grade Level',
            'Email',
            'Phone',
            'Parent Name',
            'Parent Email',
            'Address',
            'City',
            'State',
            'Zip',
            'Emergency Contact',
            'Emergency Phone',
            'Medical Notes',
            'Status',
            'Created At',
        ];
    }

    public function map($student): array
    {
        return [
            $student->id,
            $student->first_name,
            $student->last_name,
            $student->hebrew_name,
            $student->date_of_birth ?? '',
            $student->gender,
            $student->grade_level,
            $student->email,
            $student->phone,
            $student->parent ? $student->parent->first_name.' '.$student->parent->last_name : '',
            $student->parent ? $student->parent->email : '',
            $student->address,
            $student->city,
            $student->state,
            $student->zip,
            $student->emergency_contact,
            $student->emergency_phone,
            $student->medical_notes,
            $student->status,
            $student->created_at ? $student->created_at->format('Y-m-d H:i:s') : '',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
