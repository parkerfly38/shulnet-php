<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Insert membership billing settings
        DB::table('settings')->insert([
            [
                'key' => 'membership_billing_method',
                'value' => 'anniversary',
                'group' => 'membership',
                'type' => 'select',
                'description' => 'How membership dues should be billed: anniversary (on each member\'s join date) or fixed_date (all members on same date)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'membership_billing_fixed_month',
                'value' => '1',
                'group' => 'membership',
                'type' => 'select',
                'description' => 'Month for fixed-date billing (1-12). Only used when billing_method is fixed_date',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'membership_billing_fixed_day',
                'value' => '1',
                'group' => 'membership',
                'type' => 'select',
                'description' => 'Day of month for fixed-date billing (1-31). Only used when billing_method is fixed_date',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'membership_billing_grace_period_days',
                'value' => '30',
                'group' => 'membership',
                'type' => 'text',
                'description' => 'Number of days before/after billing date to avoid duplicate invoices',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'membership_auto_generate_invoices',
                'value' => 'true',
                'group' => 'membership',
                'type' => 'boolean',
                'description' => 'Automatically generate membership dues invoices',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'membership_invoice_due_days',
                'value' => '30',
                'group' => 'membership',
                'type' => 'text',
                'description' => 'Number of days after invoice date when payment is due',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('settings')->whereIn('key', [
            'membership_billing_method',
            'membership_billing_fixed_month',
            'membership_billing_fixed_day',
            'membership_billing_grace_period_days',
            'membership_auto_generate_invoices',
            'membership_invoice_due_days',
        ])->delete();
    }
};
