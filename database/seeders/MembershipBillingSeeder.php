<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\MembershipPeriod;
use App\Models\MembershipTier;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class MembershipBillingSeeder extends Seeder
{
    /**
     * Seed membership tiers and sample membership periods for testing billing.
     */
    public function run(): void
    {
        // Create membership tiers if they don't exist
        $tiers = [
            [
                'name' => 'Individual Membership',
                'slug' => 'individual',
                'description' => 'Individual membership with full benefits',
                'price' => 180.00,
                'billing_period' => 'annual',
                'max_members' => 1,
                'is_active' => true,
                'sort_order' => 1,
                'features' => ['Access to all events', 'Voting rights', 'Newsletter subscription'],
            ],
            [
                'name' => 'Family Membership',
                'slug' => 'family',
                'description' => 'Family membership for up to 4 members',
                'price' => 360.00,
                'billing_period' => 'annual',
                'max_members' => 4,
                'is_active' => true,
                'sort_order' => 2,
                'features' => ['Access to all events', 'Voting rights for adults', 'Newsletter subscription', 'Family rate discounts'],
            ],
            [
                'name' => 'Senior Membership',
                'slug' => 'senior',
                'description' => 'Discounted membership for seniors (65+)',
                'price' => 120.00,
                'billing_period' => 'annual',
                'max_members' => 1,
                'is_active' => true,
                'sort_order' => 3,
                'features' => ['Access to all events', 'Voting rights', 'Newsletter subscription', 'Senior discount'],
            ],
            [
                'name' => 'Student Membership',
                'slug' => 'student',
                'description' => 'Discounted membership for students',
                'price' => 50.00,
                'billing_period' => 'annual',
                'max_members' => 1,
                'is_active' => true,
                'sort_order' => 4,
                'features' => ['Access to all events', 'Newsletter subscription'],
            ],
            [
                'name' => 'Life Membership',
                'slug' => 'lifetime',
                'description' => 'One-time payment for lifetime membership',
                'price' => 5000.00,
                'billing_period' => 'lifetime',
                'max_members' => 1,
                'is_active' => true,
                'sort_order' => 5,
                'features' => ['Access to all events', 'Voting rights', 'Newsletter subscription', 'Lifetime benefits', 'Legacy benefits'],
            ],
        ];

        foreach ($tiers as $tierData) {
            MembershipTier::firstOrCreate(
                ['slug' => $tierData['slug']],
                $tierData
            );
        }

        // Get all tiers
        $individualTier = MembershipTier::where('slug', 'individual')->first();
        $familyTier = MembershipTier::where('slug', 'family')->first();
        $seniorTier = MembershipTier::where('slug', 'senior')->first();
        $studentTier = MembershipTier::where('slug', 'student')->first();

        // Get some members (assuming members exist from previous seeders)
        $members = Member::take(20)->get();

        if ($members->isEmpty()) {
            $this->command->warn('No members found. Please run member seeder first.');

            return;
        }

        // Assign memberships with different anniversary dates throughout the year
        $this->command->info('Creating sample membership periods...');

        foreach ($members as $index => $member) {
            // Skip if member already has active membership
            if ($member->activeMembershipPeriods()->exists()) {
                continue;
            }

            // Vary the tier
            $tier = match ($index % 4) {
                0 => $individualTier,
                1 => $familyTier,
                2 => $seniorTier,
                3 => $studentTier,
                default => $individualTier,
            };

            // Create membership periods with different start dates (anniversaries)
            // Distribute throughout the year
            $monthsAgo = ($index % 12) + 1; // 1-12 months ago
            $startDate = Carbon::now()->subMonths($monthsAgo)->startOfMonth();

            // Set last_renewal to the start date (for anniversary billing)
            $member->update(['last_renewal' => $startDate]);

            // Create the membership period
            MembershipPeriod::create([
                'member_id' => $member->id,
                'membership_tier_id' => $tier->id,
                'begin_date' => $startDate,
                'end_date' => $startDate->copy()->addYear()->subDay(),
                'membership_type' => $tier->name,
                'notes' => 'Created by membership billing seeder',
            ]);

            $this->command->info("  - Created {$tier->name} for {$member->first_name} {$member->last_name} (anniversary: {$startDate->format('M d')})");
        }

        $this->command->info('Membership billing seeder completed!');
        $this->command->info('Members now have staggered renewal dates throughout the year.');
        $this->command->info('Run: php artisan membership:generate-dues --dry-run to see who is due for renewal');
    }
}
