<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Event;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        $this->call([
            NoteSeeder::class,
            CalendarSeeder::class,
            MemberSeeder::class,
            YahrzeitSeeder::class,
            EventSeeder::class,
            EventRSVPSeeder::class,
            PdfTemplateSeeder::class,
        ]);
    }
}
