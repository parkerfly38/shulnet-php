<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\Yahrzeit;
use App\Services\HebrewCalendarService;
use Illuminate\Database\Seeder;

class YahrzeitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $hebrewCalendarService = new HebrewCalendarService;

        // Get some existing members or create test ones
        $members = Member::limit(3)->get();

        if ($members->count() < 3) {
            // Create additional members if needed
            for ($i = $members->count(); $i < 3; $i++) {
                $members->push(Member::create([
                    'first_name' => 'Test'.($i + 1),
                    'last_name' => 'User',
                    'email' => 'test'.($i + 1).'@example.com',
                    'phone1' => '555-'.str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                    'address_line_1' => ($i + 1).'23 Test St',
                    'city' => 'Test City',
                    'state' => 'TS',
                    'zip' => '12345',
                ]));
            }
        }

        // Create sample yahrzeit records
        $dates = [
            '2023-01-15',
            '2023-03-20',
            '2023-06-10',
        ];

        $relationships = ['Father', 'Mother', 'Grandfather'];
        $names = [
            ['Abraham Cohen', 'אברהם כהן'],
            ['Sarah Levy', 'שרה לוי'],
            ['Isaac Goldman', 'יצחק גולדמן'],
        ];

        foreach ($dates as $index => $date) {
            $hebrewDate = $hebrewCalendarService->gregorianToHebrew($date);

            $yahrzeit = Yahrzeit::create([
                'name' => $names[$index][0],
                'hebrew_name' => $names[$index][1],
                'date_of_death' => $date,
                'hebrew_day_of_death' => $hebrewDate['day'],
                'hebrew_month_of_death' => $hebrewDate['month'],
                'observance_type' => 'standard',
                'notes' => 'Sample yahrzeit record for testing.',
            ]);

            // Attach members with their relationships
            // Attach primary member
            $yahrzeit->members()->attach($members[0]->id, ['relationship' => $relationships[$index]]);

            // Optionally attach additional family members for some yahrzeits
            if ($index === 0 && $members->count() > 1) {
                $yahrzeit->members()->attach($members[1]->id, ['relationship' => 'Son']);
            }
            if ($index === 1 && $members->count() > 2) {
                $yahrzeit->members()->attach($members[2]->id, ['relationship' => 'Daughter']);
            }
        }
    }
}
