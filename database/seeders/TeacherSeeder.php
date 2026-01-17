<?php

namespace Database\Seeders;

use App\Models\Teacher;
use Illuminate\Database\Seeder;

class TeacherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teachers = [
            [
                'first_name' => 'David',
                'last_name' => 'Cohen',
                'title' => 'Rabbi',
                'address' => '123 Scholar Lane, Brooklyn, NY 11201',
                'qualifications' => 'PhD in Talmudic Studies, Semicha from Yeshiva University',
                'start_date' => '2015-09-01',
                'position_title' => 'Senior Torah Teacher',
                'emploee_code' => 'TCH001',
                'email' => 'david.cohen@shul.edu',
                'phone' => '555-0101',
            ],
            [
                'first_name' => 'Sarah',
                'last_name' => 'Levy',
                'title' => 'Mrs.',
                'address' => '456 Education Ave, Brooklyn, NY 11201',
                'qualifications' => 'MA in Hebrew Education, B.Ed in Jewish Studies',
                'start_date' => '2017-08-15',
                'position_title' => 'Hebrew Language Instructor',
                'emploee_code' => 'TCH002',
                'email' => 'sarah.levy@shul.edu',
                'phone' => '555-0102',
            ],
            [
                'first_name' => 'Michael',
                'last_name' => 'Goldstein',
                'title' => 'Dr.',
                'address' => '789 Academic Rd, Brooklyn, NY 11201',
                'qualifications' => 'PhD in Jewish History, MA in Religious Studies',
                'start_date' => '2016-01-10',
                'position_title' => 'Jewish History Professor',
                'emploee_code' => 'TCH003',
                'email' => 'michael.goldstein@shul.edu',
                'phone' => '555-0103',
            ],
            [
                'first_name' => 'Rebecca',
                'last_name' => 'Stein',
                'title' => 'Ms.',
                'address' => '321 Learning Blvd, Brooklyn, NY 11201',
                'qualifications' => 'BA in Jewish Studies, Certificate in Early Childhood Education',
                'start_date' => '2018-09-01',
                'position_title' => 'Junior Teacher',
                'emploee_code' => 'TCH004',
                'email' => 'rebecca.stein@shul.edu',
                'phone' => '555-0104',
            ],
        ];

        foreach ($teachers as $teacher) {
            Teacher::create($teacher);
        }
    }
}
