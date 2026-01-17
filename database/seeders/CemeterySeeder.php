<?php

namespace Database\Seeders;

use App\Models\Deed;
use App\Models\Gravesite;
use App\Models\Interment;
use App\Models\Member;
use Illuminate\Database\Seeder;

class CemeterySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create 50 gravesites across different statuses
        $availableGravesites = Gravesite::factory()->count(20)->available()->create();
        $reservedGravesites = Gravesite::factory()->count(10)->reserved()->create();
        $occupiedGravesites = Gravesite::factory()->count(20)->occupied()->create();

        // Get existing members or create some if needed
        $members = Member::where('member_type', 'member')->get();
        if ($members->count() < 10) {
            $members = Member::factory()->count(10)->create(['member_type' => 'member']);
        }

        // Create 15 deeds with various configurations
        $deeds = collect();

        // Create 15 deeds
        for ($i = 0; $i < 15; $i++) {
            $deed = Deed::factory()->create([
                'member_id' => $members->random()->id,
            ]);

            // Associate 1-4 gravesites with each deed
            $gravesiteCount = rand(1, 4);
            $selectedGravesites = $availableGravesites->random(min($gravesiteCount, $availableGravesites->count()));
            $deed->gravesites()->attach($selectedGravesites->pluck('id'));

            $deeds->push($deed);
        }

        // Create interments for some of the deeds
        // We'll create 1-3 interments for about 10 deeds
        $deedsForInterments = $deeds->random(10);

        foreach ($deedsForInterments as $deed) {
            $intermentCount = rand(1, 3);

            for ($j = 0; $j < $intermentCount; $j++) {
                // Randomly decide if interment is linked to a member
                $linkedMember = rand(0, 1) ? $members->random() : null;

                Interment::factory()->create([
                    'deed_id' => $deed->id,
                    'member_id' => $linkedMember?->id,
                ]);

                // Update the deed's occupied count
                $deed->increment('occupied');
            }
        }

        $this->command->info('Cemetery data seeded successfully!');
        $this->command->info('- Gravesites: '.Gravesite::count());
        $this->command->info('- Deeds: '.Deed::count());
        $this->command->info('- Interments: '.Interment::count());
        $this->command->info('- Deed-Gravesite associations: '.\DB::table('deed_gravesite')->count());
    }
}
