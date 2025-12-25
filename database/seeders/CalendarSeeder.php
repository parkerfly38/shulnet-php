<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Calendar;

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
