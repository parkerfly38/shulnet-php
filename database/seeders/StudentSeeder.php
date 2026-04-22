<?php

namespace Database\Seeders;

use App\Models\Student;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $students = [
            [
                'data' => [
                    'first_name' => 'Jacob',
                    'middle_name' => 'David',
                    'last_name' => 'Abramson',
                    'gender' => 'Male',
                    'date_of_birth' => '2012-05-10',
                    'address' => '100 Family Circle, Brooklyn, NY 11201',
                    'email' => 'rachel.abramson@email.com',
                    'is_parent_email' => true,
                ],
                'parent_ids' => [1, 2], // Jonathan & Rachel Abramson
            ],
            [
                'data' => [
                    'first_name' => 'Sarah',
                    'middle_name' => 'Rachel',
                    'last_name' => 'Abramson',
                    'gender' => 'Female',
                    'date_of_birth' => '2014-08-22',
                    'address' => '100 Family Circle, Brooklyn, NY 11201',
                    'email' => 'rachel.abramson@email.com',
                    'is_parent_email' => true,
                ],
                'parent_ids' => [1, 2], // Jonathan & Rachel Abramson
            ],
            [
                'data' => [
                    'first_name' => 'Aaron',
                    'middle_name' => 'Joseph',
                    'last_name' => 'Silverman',
                    'gender' => 'Male',
                    'date_of_birth' => '2011-03-15',
                    'address' => '200 Parent Lane, Brooklyn, NY 11201',
                    'email' => 'david.silverman@email.com',
                    'is_parent_email' => true,
                ],
                'parent_ids' => [3, 4], // David & Miriam Silverman
            ],
            [
                'data' => [
                    'first_name' => 'Leah',
                    'middle_name' => 'Hannah',
                    'last_name' => 'Silverman',
                    'gender' => 'Female',
                    'date_of_birth' => '2013-11-07',
                    'address' => '200 Parent Lane, Brooklyn, NY 11201',
                    'email' => 'miriam.silverman@email.com',
                    'is_parent_email' => true,
                ],
                'parent_ids' => [3, 4], // David & Miriam Silverman
            ],
            [
                'data' => [
                    'first_name' => 'Samuel',
                    'middle_name' => 'Benjamin',
                    'last_name' => 'Katz',
                    'gender' => 'Male',
                    'date_of_birth' => '2015-06-20',
                    'address' => '300 Guardian Street, Brooklyn, NY 11201',
                    'email' => 'benjamin.katz@email.com',
                    'is_parent_email' => true,
                ],
                'parent_ids' => [5, 6], // Benjamin & Esther Katz
            ],
            [
                'data' => [
                    'first_name' => 'Rebecca',
                    'middle_name' => 'Esther',
                    'last_name' => 'Katz',
                    'gender' => 'Female',
                    'date_of_birth' => '2016-09-14',
                    'address' => '300 Guardian Street, Brooklyn, NY 11201',
                    'email' => 'esther.katz@email.com',
                    'is_parent_email' => true,
                ],
                'parent_ids' => [5, 6], // Benjamin & Esther Katz
            ],
        ];

        foreach ($students as $studentData) {
            $student = Student::create($studentData['data']);
            
            if (!empty($studentData['parent_ids'])) {
                $student->parents()->attach($studentData['parent_ids']);
            }
        }
    }
}
