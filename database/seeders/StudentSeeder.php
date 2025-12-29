<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Student;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $students = [
            [
                'first_name' => 'Jacob',
                'middle_name' => 'David',
                'last_name' => 'Abramson',
                'gender' => 'Male',
                'date_of_birth' => '2012-05-10',
                'address' => '100 Family Circle, Brooklyn, NY 11201',
                'email' => 'rachel.abramson@email.com',
                'is_parent_email' => true,
                'parent_id' => 1, // Jonathan Abramson
            ],
            [
                'first_name' => 'Sarah',
                'middle_name' => 'Rachel',
                'last_name' => 'Abramson',
                'gender' => 'Female',
                'date_of_birth' => '2014-08-22',
                'address' => '100 Family Circle, Brooklyn, NY 11201',
                'email' => 'rachel.abramson@email.com',
                'is_parent_email' => true,
                'parent_id' => 2, // Rachel Abramson
            ],
            [
                'first_name' => 'Aaron',
                'middle_name' => 'Joseph',
                'last_name' => 'Silverman',
                'gender' => 'Male',
                'date_of_birth' => '2011-03-15',
                'address' => '200 Parent Lane, Brooklyn, NY 11201',
                'email' => 'david.silverman@email.com',
                'is_parent_email' => true,
                'parent_id' => 3, // David Silverman
            ],
            [
                'first_name' => 'Leah',
                'middle_name' => 'Hannah',
                'last_name' => 'Silverman',
                'gender' => 'Female',
                'date_of_birth' => '2013-11-07',
                'address' => '200 Parent Lane, Brooklyn, NY 11201',
                'email' => 'miriam.silverman@email.com',
                'is_parent_email' => true,
                'parent_id' => 4, // Miriam Silverman
            ],
            [
                'first_name' => 'Samuel',
                'middle_name' => 'Benjamin',
                'last_name' => 'Katz',
                'gender' => 'Male',
                'date_of_birth' => '2015-06-20',
                'address' => '300 Guardian Street, Brooklyn, NY 11201',
                'email' => 'benjamin.katz@email.com',
                'is_parent_email' => true,
                'parent_id' => 5, // Benjamin Katz
            ],
            [
                'first_name' => 'Rebecca',
                'middle_name' => 'Esther',
                'last_name' => 'Katz',
                'gender' => 'Female',
                'date_of_birth' => '2016-09-14',
                'address' => '300 Guardian Street, Brooklyn, NY 11201',
                'email' => 'esther.katz@email.com',
                'is_parent_email' => true,
                'parent_id' => 6, // Esther Katz
            ],
        ];

        foreach ($students as $student) {
            Student::create($student);
        }
    }
}
