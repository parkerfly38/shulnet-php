<?php

namespace Database\Seeders;

use App\Models\Calendar;
use Illuminate\Database\Seeder;

class CalendarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        Calendar::factory()->create([
            'name' => 'Shabbat Services',
            'members_only' => false,
            'public' => true,
        ]);
    }
}
