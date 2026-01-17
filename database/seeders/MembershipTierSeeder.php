<?php

namespace Database\Seeders;

use App\Models\MembershipTier;
use Illuminate\Database\Seeder;

class MembershipTierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tiers = [
            [
                'name' => 'Family Membership',
                'slug' => 'family-membership',
                'description' => 'Full membership for families including all household members',
                'price' => 500.00,
                'billing_period' => 'annual',
                'is_active' => true,
                'sort_order' => 1,
                'features' => [
                    'Access to all services',
                    'High Holiday seating',
                    'Unlimited family members',
                    'Voting rights',
                    'Committee participation',
                ],
            ],
            [
                'name' => 'Individual Membership',
                'slug' => 'individual-membership',
                'description' => 'Full membership for individuals',
                'price' => 300.00,
                'billing_period' => 'annual',
                'max_members' => 1,
                'is_active' => true,
                'sort_order' => 2,
                'features' => [
                    'Access to all services',
                    'High Holiday seating',
                    'Voting rights',
                    'Committee participation',
                ],
            ],
            [
                'name' => 'Student Membership',
                'slug' => 'student-membership',
                'description' => 'Discounted membership for full-time students',
                'price' => 100.00,
                'billing_period' => 'annual',
                'max_members' => 1,
                'is_active' => true,
                'sort_order' => 3,
                'features' => [
                    'Access to all services',
                    'High Holiday seating',
                    'Young adult programming',
                    'Valid student ID required',
                ],
            ],
            [
                'name' => 'Senior Membership',
                'slug' => 'senior-membership',
                'description' => 'Discounted membership for seniors (65+)',
                'price' => 200.00,
                'billing_period' => 'annual',
                'is_active' => true,
                'sort_order' => 4,
                'features' => [
                    'Access to all services',
                    'High Holiday seating',
                    'Voting rights',
                    'Senior programming',
                ],
            ],
            [
                'name' => 'Free Membership',
                'slug' => 'free-membership',
                'description' => 'Complimentary membership',
                'price' => 0.00,
                'billing_period' => 'annual',
                'is_active' => true,
                'sort_order' => 5,
                'features' => [
                    'Access to all services',
                    'High Holiday seating',
                ],
            ],
            [
                'name' => 'Negotiated Membership',
                'slug' => 'negotiated-membership',
                'description' => 'Custom membership arrangement based on individual circumstances',
                'price' => 0.00,
                'billing_period' => 'custom',
                'is_active' => true,
                'sort_order' => 6,
                'features' => [
                    'Access to all services',
                    'Custom terms',
                    'Confidential arrangement',
                ],
            ],
            [
                'name' => 'Lifetime Membership',
                'slug' => 'lifetime-membership',
                'description' => 'One-time payment for lifetime membership',
                'price' => 5000.00,
                'billing_period' => 'lifetime',
                'is_active' => true,
                'sort_order' => 7,
                'features' => [
                    'All membership benefits',
                    'Lifetime access',
                    'Legacy recognition',
                    'Priority seating',
                    'Special honors',
                ],
            ],
        ];

        foreach ($tiers as $tier) {
            MembershipTier::create($tier);
        }
    }
}
