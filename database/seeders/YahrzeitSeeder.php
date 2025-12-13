<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\Yahrzeit;
use App\Services\HebrewCalendarService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class YahrzeitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $hebrewCalendarService = new HebrewCalendarService();

        // Get some existing members or create test ones
        $member = Member::first();
        
        if (!$member) {
            $member = Member::create([
                'first_name' => 'Test',
                'last_name' => 'User',
                'email' => 'test@example.com',
                'phone' => '555-1234',
                'address' => '123 Test St',
                'city' => 'Test City',
                'state' => 'TS',
                'zip' => '12345',
                'tribe' => 'Israel',
            ]);
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
            
            Yahrzeit::create([
                'member_id' => $member->id,
                'name' => $names[$index][0],
                'hebrew_name' => $names[$index][1],
                'relationship' => $relationships[$index],
                'date_of_death' => $date,
                'hebrew_day_of_death' => $hebrewDate['day'],
                'hebrew_month_of_death' => $hebrewDate['month'],
                'observance_type' => 'standard',
                'notes' => 'Sample yahrzeit record for testing.',
            ]);
        }
    }
}
