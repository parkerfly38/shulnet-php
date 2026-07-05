<?php

namespace App\Console\Commands;

use App\Services\MembershipBillingService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GenerateMembershipDues extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'membership:generate-dues 
                            {--date= : Date to check for renewals (Y-m-d format, defaults to today)}
                            {--force : Force generation even if auto-generation is disabled}
                            {--dry-run : Preview what would be generated without creating invoices}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate membership dues invoices based on billing settings (anniversary or fixed date)';

    /**
     * Execute the console command.
     */
    public function handle(MembershipBillingService $billingService): int
    {
        $this->info('Starting membership dues generation...');

        // Parse date parameter
        $date = $this->option('date') ? Carbon::parse($this->option('date')) : now();
        $this->info("Checking renewals for date: {$date->format('Y-m-d')}");

        // Show current settings
        $billingMethod = \App\Models\Setting::get('membership_billing_method', 'anniversary');
        $this->info("Billing method: {$billingMethod}");

        if ($billingMethod === 'fixed_date') {
            $month = \App\Models\Setting::get('membership_billing_fixed_month', 1);
            $day = \App\Models\Setting::get('membership_billing_fixed_day', 1);
            $this->info("Fixed billing date: Month {$month}, Day {$day}");
        }

        // Check if dry run
        if ($this->option('dry-run')) {
            $this->warn('DRY RUN MODE - No invoices will be created');
            $members = $billingService->getMembersDueForRenewal($date);
            $this->info("Found {$members->count()} members due for renewal:");

            foreach ($members as $member) {
                $this->line("  - {$member->first_name} {$member->last_name} (ID: {$member->id})");
                foreach ($member->activeMembershipPeriods as $period) {
                    if ($period->membershipTier) {
                        $this->line("    └─ {$period->membershipTier->name} - \${$period->membershipTier->price}");
                    }
                }
            }

            return Command::SUCCESS;
        }

        // Override auto-generate if forced
        if ($this->option('force')) {
            $this->warn('Forcing generation (ignoring auto-generate setting)');
            \App\Models\Setting::set('membership_auto_generate_invoices', 'true');
        }

        // Generate invoices
        $this->info('Generating invoices...');
        $results = $billingService->generateDuesInvoices($date);

        // Display results
        $this->newLine();
        $this->info('===== Generation Results =====');
        $this->info($results['message']);
        $this->line("Generated: {$results['generated']}");
        $this->line("Skipped: {$results['skipped']}");

        if ($results['errors'] > 0) {
            $this->error("Errors: {$results['errors']}");
        } else {
            $this->line("Errors: {$results['errors']}");
        }

        $this->newLine();

        if ($results['generated'] > 0) {
            $this->info('✓ Membership dues invoices generated successfully!');

            return Command::SUCCESS;
        } else {
            $this->warn('No invoices were generated. Check logs for details.');

            return Command::SUCCESS;
        }
    }
}
