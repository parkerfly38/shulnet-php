<?php

namespace Database\Seeders;

use App\Models\Board;
use App\Models\Member;
use Illuminate\Database\Seeder;

class BoardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Board of Directors
        $boardOfDirectors = Board::create([
            'name' => 'Board of Directors',
            'description' => 'The governing body of the synagogue, responsible for overall policy, financial oversight, and strategic direction.',
        ]);

        // Create Executive Board
        $executiveBoard = Board::create([
            'name' => 'Executive Board',
            'description' => 'A subset of the Board of Directors handling day-to-day leadership and urgent decisions between full board meetings.',
        ]);

        // Attach members to Board of Directors if members exist
        $members = Member::all();
        if ($members->count() > 0) {
            // President
            $boardOfDirectors->members()->attach($members->first()->id, [
                'title' => 'President',
                'term_start_date' => now()->subYear()->toDateString(),
                'term_end_date' => now()->addYear()->toDateString(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Add more positions if we have more members
            if ($members->count() > 1) {
                $boardOfDirectors->members()->attach($members->skip(1)->first()->id, [
                    'title' => 'Vice President',
                    'term_start_date' => now()->subYear()->toDateString(),
                    'term_end_date' => now()->addYear()->toDateString(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            if ($members->count() > 2) {
                $boardOfDirectors->members()->attach($members->skip(2)->first()->id, [
                    'title' => 'Treasurer',
                    'term_start_date' => now()->subYear()->toDateString(),
                    'term_end_date' => now()->addYear()->toDateString(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            if ($members->count() > 3) {
                $boardOfDirectors->members()->attach($members->skip(3)->first()->id, [
                    'title' => 'Secretary',
                    'term_start_date' => now()->subYear()->toDateString(),
                    'term_end_date' => now()->addYear()->toDateString(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            if ($members->count() > 4) {
                $boardOfDirectors->members()->attach($members->skip(4)->first()->id, [
                    'title' => 'Member at Large',
                    'term_start_date' => now()->subMonths(6)->toDateString(),
                    'term_end_date' => now()->addMonths(18)->toDateString(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Attach to Executive Board
            if ($members->count() > 0) {
                $executiveBoard->members()->attach($members->first()->id, [
                    'title' => 'President',
                    'term_start_date' => now()->subYear()->toDateString(),
                    'term_end_date' => now()->addYear()->toDateString(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            if ($members->count() > 1) {
                $executiveBoard->members()->attach($members->skip(1)->first()->id, [
                    'title' => 'Vice President',
                    'term_start_date' => now()->subYear()->toDateString(),
                    'term_end_date' => now()->addYear()->toDateString(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
