<?php

namespace Database\Seeders;

use App\Models\Committee;
use App\Models\Member;
use Illuminate\Database\Seeder;

class CommitteeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Finance Committee
        $financeCommittee = Committee::create([
            'name' => 'Finance Committee',
            'description' => 'Oversees the synagogue\'s financial health, budgets, and financial planning.',
        ]);

        // Create Building & Grounds Committee
        $buildingCommittee = Committee::create([
            'name' => 'Building & Grounds Committee',
            'description' => 'Manages the maintenance, improvements, and safety of the synagogue facilities.',
        ]);

        // Create Membership Committee
        $membershipCommittee = Committee::create([
            'name' => 'Membership Committee',
            'description' => 'Focuses on member engagement, retention, and recruitment of new members.',
        ]);

        // Create Education Committee
        $educationCommittee = Committee::create([
            'name' => 'Education Committee',
            'description' => 'Oversees religious school programs, adult education, and lifelong learning initiatives.',
        ]);

        // Create Social Action Committee
        $socialActionCommittee = Committee::create([
            'name' => 'Social Action Committee',
            'description' => 'Coordinates social justice initiatives, community service, and charitable activities.',
        ]);

        // Create Ritual Committee
        $ritualCommittee = Committee::create([
            'name' => 'Ritual Committee',
            'description' => 'Manages religious services, holiday observances, and ritual practices.',
        ]);

        // Attach members to committees if members exist
        $members = Member::all();
        if ($members->count() > 0) {
            // Finance Committee
            $financeCommittee->members()->attach($members->first()->id, [
                'title' => 'Chair',
                'term_start_date' => now()->subMonths(8)->toDateString(),
                'term_end_date' => now()->addMonths(16)->toDateString(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if ($members->count() > 1) {
                $financeCommittee->members()->attach($members->skip(1)->first()->id, [
                    'title' => 'Member',
                    'term_start_date' => now()->subMonths(6)->toDateString(),
                    'term_end_date' => null, // No end date - ongoing
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Building & Grounds Committee
            if ($members->count() > 2) {
                $buildingCommittee->members()->attach($members->skip(2)->first()->id, [
                    'title' => 'Chair',
                    'term_start_date' => now()->subYear()->toDateString(),
                    'term_end_date' => now()->addYear()->toDateString(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Membership Committee
            if ($members->count() > 3) {
                $membershipCommittee->members()->attach($members->skip(3)->first()->id, [
                    'title' => 'Chair',
                    'term_start_date' => now()->subMonths(4)->toDateString(),
                    'term_end_date' => now()->addMonths(20)->toDateString(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Education Committee
            if ($members->count() > 4) {
                $educationCommittee->members()->attach($members->skip(4)->first()->id, [
                    'title' => 'Chair',
                    'term_start_date' => now()->subMonths(10)->toDateString(),
                    'term_end_date' => now()->addMonths(14)->toDateString(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            if ($members->count() > 5) {
                $educationCommittee->members()->attach($members->skip(5)->first()->id, [
                    'title' => 'Member',
                    'term_start_date' => now()->subMonths(3)->toDateString(),
                    'term_end_date' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Social Action Committee
            if ($members->count() > 6) {
                $socialActionCommittee->members()->attach($members->skip(6)->first()->id, [
                    'title' => 'Chair',
                    'term_start_date' => now()->subMonths(5)->toDateString(),
                    'term_end_date' => now()->addMonths(19)->toDateString(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Ritual Committee
            if ($members->count() > 7) {
                $ritualCommittee->members()->attach($members->skip(7)->first()->id, [
                    'title' => 'Chair',
                    'term_start_date' => now()->subYear()->toDateString(),
                    'term_end_date' => now()->addYear()->toDateString(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
