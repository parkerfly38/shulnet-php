<?php

namespace Database\Seeders;

use App\Models\ClassDefinition;
use Illuminate\Database\Seeder;

class ClassDefinitionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $classes = [
            [
                'name' => 'Torah Studies - Beginners',
                'class_number' => 'TOR-101',
                'description' => 'Introduction to Torah study for young learners',
                'teacher_id' => 1, // Rabbi David Cohen
                'capacity' => 15,
                'start_date' => '2024-09-01',
                'end_date' => '2025-06-30',
                'location' => 'Room 101',
                'fee' => 500.00,
            ],
            [
                'name' => 'Hebrew Language Level 1',
                'class_number' => 'HEB-101',
                'description' => 'Basic Hebrew reading and writing skills',
                'teacher_id' => 2, // Sarah Levy
                'capacity' => 20,
                'start_date' => '2024-09-01',
                'end_date' => '2025-06-30',
                'location' => 'Room 102',
                'fee' => 450.00,
            ],
            [
                'name' => 'Jewish History - Ancient Period',
                'class_number' => 'HIS-201',
                'description' => 'From Abraham to the destruction of the Second Temple',
                'teacher_id' => 3, // Dr. Michael Goldstein
                'capacity' => 18,
                'start_date' => '2024-09-01',
                'end_date' => '2025-06-30',
                'location' => 'Room 201',
                'fee' => 550.00,
            ],
            [
                'name' => 'Talmud for Youth',
                'class_number' => 'TAL-101',
                'description' => 'Introduction to Talmudic reasoning and logic',
                'teacher_id' => 1, // Rabbi David Cohen
                'capacity' => 12,
                'start_date' => '2024-09-01',
                'end_date' => '2025-06-30',
                'location' => 'Room 103',
                'fee' => 600.00,
            ],
            [
                'name' => 'Hebrew Language Level 2',
                'class_number' => 'HEB-201',
                'description' => 'Intermediate Hebrew conversation and comprehension',
                'teacher_id' => 2, // Sarah Levy
                'capacity' => 18,
                'start_date' => '2024-09-01',
                'end_date' => '2025-06-30',
                'location' => 'Room 104',
                'fee' => 475.00,
            ],
            [
                'name' => 'Jewish Holidays and Traditions',
                'class_number' => 'HOL-101',
                'description' => 'Understanding the meaning and customs of Jewish holidays',
                'teacher_id' => 4, // Rebecca Stein
                'capacity' => 25,
                'start_date' => '2024-09-01',
                'end_date' => '2025-06-30',
                'location' => 'Room 105',
                'fee' => 400.00,
            ],
        ];

        foreach ($classes as $class) {
            ClassDefinition::create($class);
        }
    }
}
