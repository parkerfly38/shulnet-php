<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        Event::factory()->create([
            'name' => 'Shabbat',
            'tagline' => 'Weekly Shabbat Service',
            'event_start' => '2024-01-05 18:00:00',
            'event_end' => '2024-01-05 20:00:00',
            'location' => '144 York Street, Bangor, ME 04401',
            'registration_required' => false,
            'members_only' => false,
            'description' => 'Join us for our weekly Shabbat service.',
            'online' => false,
            'public' => true,
            'calendar_id' => 1,
        ]);
    }
}
