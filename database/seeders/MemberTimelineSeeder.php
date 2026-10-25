<?php

namespace Database\Seeders;

use App\Models\Member;
use Illuminate\Database\Seeder;

/**
 * Back-dates seeded members so they join at a steady trickle over the past 12 months
 * instead of all appearing on the day the database was seeded. Run after every seeder
 * that creates members.
 */
class MemberTimelineSeeder extends Seeder
{
    public function run(): void
    {
        $ids = Member::query()->orderBy('id')->pluck('id');
        $count = $ids->count();

        if ($count === 0) {
            return;
        }

        $start = now()->subMonths(12)->startOfDay();
        $secondsPerSlot = (int) floor($start->diffInSeconds(now()->subDay()->endOfDay()) / $count);

        foreach ($ids as $index => $id) {
            // One slot per member, with a random time inside it so joins look natural rather than evenly spaced.
            $joinedAt = $start->copy()->addSeconds(($index * $secondsPerSlot) + random_int(0, max(0, $secondsPerSlot - 1)));

            Member::query()->whereKey($id)->update([
                'created_at' => $joinedAt,
                'updated_at' => $joinedAt,
            ]);
        }
    }
}
