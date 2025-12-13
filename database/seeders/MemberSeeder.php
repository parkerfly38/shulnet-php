<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Member;

class MemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Member::factory()->create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'address_line_1' => '123 Main St',
            'address_line_2' => 'Apt 4B',
            'city' => 'Anytown',
            'state' => 'CA',
            'zip' => '12345',
            'country' => 'USA',
            'phone1' => '555-1234',
            'phone2' => '555-5678',
            'dob' => '1990-01-01',
            'title' => 'Mr.',
            'gender' => 'Male',
            'aliyah' => true,
            'bnaimitzvahdate' => '2003-05-15',
            'chazanut' => 'Yes',
            'email' => 'john.doe@example.com',
        ]);
    }
}
