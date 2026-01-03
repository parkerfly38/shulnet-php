<?php

namespace Database\Seeders;

use App\Models\SchoolTuitionTier;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SchoolTuitionTierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tiers = [
            [
                'name' => 'Full Tuition',
                'slug' => 'full-tuition',
                'description' => 'Standard tuition rate for all students',
                'price' => 5000.00,
                'billing_period' => 'annual',
                'is_active' => true,
                'sort_order' => 1,
                'features' => [
                    'Full school year access',
                    'All course materials included',
                    'Extracurricular activities',
                    'After-school programs',
                ]
            ],
            [
                'name' => 'Multi-Child Discount',
                'slug' => 'multi-child-discount',
                'description' => 'Discounted rate for families with multiple children',
                'price' => 4000.00,
                'billing_period' => 'annual',
                'is_active' => true,
                'sort_order' => 2,
                'features' => [
                    'Full school year access',
                    'All course materials included',
                    '20% discount per additional child',
                    'Extracurricular activities',
                ]
            ],
            [
                'name' => 'Scholarship - Full',
                'slug' => 'scholarship-full',
                'description' => 'Full scholarship for qualifying students',
                'price' => 0.00,
                'billing_period' => 'annual',
                'is_active' => true,
                'sort_order' => 3,
                'features' => [
                    'Full school year access',
                    'All course materials included',
                    'Financial aid approved',
                    'Extracurricular activities',
                ]
            ],
            [
                'name' => 'Scholarship - Partial (50%)',
                'slug' => 'scholarship-partial-50',
                'description' => '50% scholarship for qualifying students',
                'price' => 2500.00,
                'billing_period' => 'annual',
                'is_active' => true,
                'sort_order' => 4,
                'features' => [
                    'Full school year access',
                    'All course materials included',
                    '50% financial aid',
                    'Extracurricular activities',
                ]
            ],
            [
                'name' => 'Scholarship - Partial (25%)',
                'slug' => 'scholarship-partial-25',
                'description' => '25% scholarship for qualifying students',
                'price' => 3750.00,
                'billing_period' => 'annual',
                'is_active' => true,
                'sort_order' => 5,
                'features' => [
                    'Full school year access',
                    'All course materials included',
                    '25% financial aid',
                    'Extracurricular activities',
                ]
            ],
            [
                'name' => 'Semester Payment',
                'slug' => 'semester-payment',
                'description' => 'Pay per semester option',
                'price' => 2750.00,
                'billing_period' => 'semester',
                'is_active' => true,
                'sort_order' => 6,
                'features' => [
                    'Half year access',
                    'All course materials included',
                    'Flexible payment schedule',
                ]
            ],
            [
                'name' => 'Monthly Payment Plan',
                'slug' => 'monthly-payment',
                'description' => 'Monthly installment payment option',
                'price' => 500.00,
                'billing_period' => 'monthly',
                'is_active' => true,
                'sort_order' => 7,
                'features' => [
                    'Spread payments over 10 months',
                    'All course materials included',
                    'No interest charges',
                ]
            ],
            [
                'name' => 'Negotiated Tuition',
                'slug' => 'negotiated-tuition',
                'description' => 'Custom tuition arrangement based on family circumstances',
                'price' => 0.00,
                'billing_period' => 'custom',
                'is_active' => true,
                'sort_order' => 8,
                'features' => [
                    'Custom payment arrangement',
                    'Confidential agreement',
                    'Case-by-case basis',
                ]
            ],
        ];

        foreach ($tiers as $tier) {
            SchoolTuitionTier::create($tier);
        }
    }
}
