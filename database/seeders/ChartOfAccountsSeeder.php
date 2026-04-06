<?php

namespace Database\Seeders;

use App\Models\ChartOfAccount;
use Illuminate\Database\Seeder;

class ChartOfAccountsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $accounts = [
            // Revenue Accounts
            [
                'account_code' => '4000',
                'account_name' => 'Membership Dues Revenue',
                'account_type' => 'revenue',
                'description' => 'Annual and monthly membership dues',
                'is_active' => true,
                'sort_order' => 10,
            ],
            [
                'account_code' => '4100',
                'account_name' => 'Hebrew School Tuition',
                'account_type' => 'revenue',
                'description' => 'Tuition revenue from Hebrew school',
                'is_active' => true,
                'sort_order' => 20,
            ],
            [
                'account_code' => '4200',
                'account_name' => 'Donations - General',
                'account_type' => 'revenue',
                'description' => 'General unrestricted donations',
                'is_active' => true,
                'sort_order' => 30,
            ],
            [
                'account_code' => '4210',
                'account_name' => 'Donations - Building Fund',
                'account_type' => 'revenue',
                'description' => 'Donations designated for building/capital improvements',
                'is_active' => true,
                'sort_order' => 40,
            ],
            [
                'account_code' => '4220',
                'account_name' => 'Donations - Memorial',
                'account_type' => 'revenue',
                'description' => 'Memorial and yahrzeit donations',
                'is_active' => true,
                'sort_order' => 50,
            ],
            [
                'account_code' => '4300',
                'account_name' => 'Event Revenue',
                'account_type' => 'revenue',
                'description' => 'Revenue from events, programs, and ticket sales',
                'is_active' => true,
                'sort_order' => 60,
            ],
            [
                'account_code' => '4400',
                'account_name' => 'Cemetery Plot Sales',
                'account_type' => 'revenue',
                'description' => 'Revenue from cemetery plot purchases',
                'is_active' => true,
                'sort_order' => 70,
            ],
            [
                'account_code' => '4410',
                'account_name' => 'Cemetery Services',
                'account_type' => 'revenue',
                'description' => 'Revenue from interment and cemetery services',
                'is_active' => true,
                'sort_order' => 80,
            ],
            [
                'account_code' => '4500',
                'account_name' => 'High Holiday Seats',
                'account_type' => 'revenue',
                'description' => 'Revenue from High Holiday seat purchases',
                'is_active' => true,
                'sort_order' => 90,
            ],
            [
                'account_code' => '4600',
                'account_name' => 'Religious Services Fees',
                'account_type' => 'revenue',
                'description' => 'Bar/Bat Mitzvah, wedding, and other service fees',
                'is_active' => true,
                'sort_order' => 100,
            ],
            [
                'account_code' => '4700',
                'account_name' => 'Gift Shop Sales',
                'account_type' => 'revenue',
                'description' => 'Revenue from gift shop and judaica sales',
                'is_active' => true,
                'sort_order' => 110,
            ],
            [
                'account_code' => '4800',
                'account_name' => 'Facility Rental Income',
                'account_type' => 'revenue',
                'description' => 'Revenue from renting facilities to external groups',
                'is_active' => true,
                'sort_order' => 120,
            ],
            [
                'account_code' => '4900',
                'account_name' => 'Fundraising Revenue',
                'account_type' => 'revenue',
                'description' => 'Revenue from fundraising campaigns and galas',
                'is_active' => true,
                'sort_order' => 130,
            ],
            [
                'account_code' => '4950',
                'account_name' => 'Other Income',
                'account_type' => 'revenue',
                'description' => 'Miscellaneous revenue not categorized elsewhere',
                'is_active' => true,
                'sort_order' => 140,
            ],

            // Accounts Receivable (Asset Account)
            [
                'account_code' => '1200',
                'account_name' => 'Accounts Receivable',
                'account_type' => 'asset',
                'description' => 'Outstanding member balances',
                'is_active' => true,
                'sort_order' => 150,
            ],

            // Expense Accounts (examples, can be expanded)
            [
                'account_code' => '6000',
                'account_name' => 'Payroll Expenses',
                'account_type' => 'expense',
                'description' => 'Salaries and wages for staff',
                'is_active' => true,
                'sort_order' => 160,
            ],
            [
                'account_code' => '6100',
                'account_name' => 'Utilities',
                'account_type' => 'expense',
                'description' => 'Electric, gas, water, and other utilities',
                'is_active' => true,
                'sort_order' => 170,
            ],
            [
                'account_code' => '6200',
                'account_name' => 'Building Maintenance',
                'account_type' => 'expense',
                'description' => 'Repairs, maintenance, and cleaning',
                'is_active' => true,
                'sort_order' => 180,
            ],
        ];

        foreach ($accounts as $account) {
            ChartOfAccount::updateOrCreate(
                ['account_code' => $account['account_code']],
                $account
            );
        }

        $this->command->info('Chart of Accounts seeded successfully!');
    }
}
