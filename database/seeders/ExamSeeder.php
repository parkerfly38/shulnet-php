<?php

namespace Database\Seeders;

use App\Models\Exam;
use Illuminate\Database\Seeder;

class ExamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $exams = [
            [
                'name' => 'Torah Midterm - Fall Semester',
                'subject_id' => 1, // Torah
                'start_date' => '2024-11-15',
                'end_date' => '2024-11-15',
            ],
            [
                'name' => 'Torah Final - Spring Semester',
                'subject_id' => 1, // Torah
                'start_date' => '2025-05-20',
                'end_date' => '2025-05-20',
            ],
            [
                'name' => 'Talmud Midterm Exam',
                'subject_id' => 2, // Talmud
                'start_date' => '2024-12-01',
                'end_date' => '2024-12-01',
            ],
            [
                'name' => 'Talmud Final Exam',
                'subject_id' => 2, // Talmud
                'start_date' => '2025-06-05',
                'end_date' => '2025-06-05',
            ],
            [
                'name' => 'Hebrew Reading Assessment',
                'subject_id' => 3, // Hebrew Language
                'start_date' => '2024-10-30',
                'end_date' => '2024-10-30',
            ],
            [
                'name' => 'Hebrew Final Exam',
                'subject_id' => 3, // Hebrew Language
                'start_date' => '2025-05-15',
                'end_date' => '2025-05-15',
            ],
            [
                'name' => 'Jewish History Midterm',
                'subject_id' => 4, // Jewish History
                'start_date' => '2024-11-20',
                'end_date' => '2024-11-20',
            ],
            [
                'name' => 'Jewish History Final',
                'subject_id' => 4, // Jewish History
                'start_date' => '2025-05-25',
                'end_date' => '2025-05-25',
            ],
            [
                'name' => 'Holidays and Traditions Quiz',
                'subject_id' => 7, // Holidays and Traditions
                'start_date' => '2024-12-15',
                'end_date' => '2024-12-15',
            ],
        ];

        foreach ($exams as $exam) {
            Exam::create($exam);
        }
    }
}
