<?php

namespace App\Ai\Tools;

use App\Models\Student;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Tools\Request;
use Stringable;

class StudentDetail extends AdminTool
{
    public function description(): Stringable|string
    {
        return 'Get one religious school student by id: profile, allergies and accommodations, parents, '
            .'class grades and an attendance summary with recent absences. Use search_students first if you only have a name.';
    }

    protected function execute(Request $request): array
    {
        $student = Student::with([
            'parents',
            'classGrades.classDefinition:id,name',
        ])->find($request['student_id'] ?? null);

        if (! $student) {
            return ['error' => 'Student not found.'];
        }

        $counts = $student->attendances()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $absences = $student->attendances()
            ->whereIn('status', ['absent', 'tardy'])
            ->orderByDesc('attendance_date')
            ->limit(5)
            ->with('classDefinition:id,name')
            ->get();

        return [
            'id' => $student->id,
            'name' => trim("{$student->first_name} {$student->last_name}"),
            'preferred_name' => $student->preferred_name,
            'hebrew_name' => $student->hebrew_name,
            'pronouns' => $student->pronouns,
            'dob' => $student->dob ?? $student->date_of_birth,
            'email' => $student->email,
            'address' => $student->address,
            'allergies' => $student->allergies,
            'special_accommodations' => $student->special_accomodations,
            'parents' => $student->parents->map(fn ($p) => [
                'id' => $p->id,
                'name' => trim("{$p->first_name} {$p->last_name}"),
                'email' => $p->email,
                'phone' => $p->phone,
            ])->values(),
            'class_grades' => $student->classGrades->map(fn ($g) => [
                'class' => $g->classDefinition?->name,
                'letter_grade' => $g->letter_grade,
                'grade' => $g->grade,
                'remarks' => $g->remarks,
            ])->values(),
            'attendance' => [
                'present' => (int) ($counts['present'] ?? 0),
                'absent' => (int) ($counts['absent'] ?? 0),
                'tardy' => (int) ($counts['tardy'] ?? 0),
                'excused' => (int) ($counts['excused'] ?? 0),
            ],
            'recent_absences_and_tardies' => $absences->map(fn ($a) => [
                'date' => $a->attendance_date?->toDateString(),
                'status' => $a->status,
                'class' => $a->classDefinition?->name,
            ])->values(),
        ];
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'student_id' => $schema->integer()->required()->description('The student id.'),
        ];
    }
}
