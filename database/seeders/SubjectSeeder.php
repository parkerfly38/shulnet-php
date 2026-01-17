<?php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subjects = [
            ['name' => 'Torah', 'description' => 'Study of the Five Books of Moses'],
            ['name' => 'Talmud', 'description' => 'Study of Jewish law and tradition'],
            ['name' => 'Hebrew Language', 'description' => 'Modern and classical Hebrew'],
            ['name' => 'Jewish History', 'description' => 'History of the Jewish people'],
            ['name' => 'Prayer and Liturgy', 'description' => 'Jewish prayer services and customs'],
            ['name' => 'Jewish Ethics', 'description' => 'Moral teachings and values'],
            ['name' => 'Holidays and Traditions', 'description' => 'Jewish holidays and customs'],
            ['name' => 'Prophets', 'description' => 'Study of Nevi\'im'],
        ];

        foreach ($subjects as $subject) {
            Subject::create($subject);
        }
    }
}
