<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Member;
use App\Models\MembershipPeriod;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MembershipBillingService
{
    /**
     * Generate membership dues invoices based on billing settings
     *
     * @param  Carbon|null  $asOfDate  The date to check for due renewals (defaults to today)
     * @return array Statistics about generated invoices
     */
    public function generateDuesInvoices(?Carbon $asOfDate = null): array
    {
        $asOfDate = $asOfDate ?? now();
        $billingMethod = Setting::get('membership_billing_method', 'anniversary');
        $autoGenerate = Setting::get('membership_auto_generate_invoices', 'true') === 'true';

        if (! $autoGenerate) {
            Log::info('Membership auto-generation is disabled');

            return [
                'generated' => 0,
                'skipped' => 0,
                'errors' => 0,
                'message' => 'Auto-generation disabled',
            ];
        }

        if ($billingMethod === 'anniversary') {
            return $this->generateAnniversaryBilling($asOfDate);
        } else {
            return $this->generateFixedDateBilling($asOfDate);
        }
    }

    /**
     * Generate invoices based on anniversary dates (join date or last renewal)
     */
    protected function generateAnniversaryBilling(Carbon $asOfDate): array
    {
        $gracePeriodDays = (int) Setting::get('membership_billing_grace_period_days', 30);
        $generated = 0;
        $skipped = 0;
        $errors = 0;

        // Get members with active membership periods
        $members = Member::whereHas('activeMembershipPeriods')
            ->with(['activeMembershipPeriods.membershipTier'])
            ->get();

        foreach ($members as $member) {
            try {
                foreach ($member->activeMembershipPeriods as $period) {
                    // Skip if no tier or tier is not active
                    if (! $period->membershipTier || ! $period->membershipTier->is_active) {
                        $skipped++;

                        continue;
                    }

                    // Determine anniversary date
                    $anniversaryDate = $member->lastrenewal ?? $period->begin_date;

                    if (! $anniversaryDate) {
                        $skipped++;

                        continue;
                    }

                    // Calculate next billing date (anniversary in current/next year)
                    $nextBillingDate = Carbon::parse($anniversaryDate)->year($asOfDate->year);
                    if ($nextBillingDate->isPast() && $nextBillingDate->diffInDays($asOfDate) > $gracePeriodDays) {
                        $nextBillingDate->addYear();
                    }

                    // Check if we should bill now (within grace period)
                    if (abs($nextBillingDate->diffInDays($asOfDate)) <= $gracePeriodDays) {
                        // Check if invoice already exists for this period
                        if ($this->hasRecentInvoice($member, $period, $nextBillingDate, $gracePeriodDays)) {
                            $skipped++;

                            continue;
                        }

                        // Generate invoice
                        if ($this->createMembershipInvoice($member, $period, $nextBillingDate)) {
                            $generated++;

                            // Update last renewal date
                            $member->update(['lastrenewal' => $nextBillingDate]);
                        } else {
                            $errors++;
                        }
                    } else {
                        $skipped++;
                    }
                }
            } catch (\Exception $e) {
                Log::error('Error generating anniversary billing for member '.$member->id.': '.$e->getMessage());
                $errors++;
            }
        }

        return [
            'generated' => $generated,
            'skipped' => $skipped,
            'errors' => $errors,
            'message' => "Anniversary billing: Generated {$generated} invoices",
        ];
    }

    /**
     * Generate invoices on a fixed date for all members
     */
    protected function generateFixedDateBilling(Carbon $asOfDate): array
    {
        $fixedMonth = (int) Setting::get('membership_billing_fixed_month', 1);
        $fixedDay = (int) Setting::get('membership_billing_fixed_day', 1);
        $gracePeriodDays = (int) Setting::get('membership_billing_grace_period_days', 30);
        $generated = 0;
        $skipped = 0;
        $errors = 0;

        // Calculate the billing date for this year
        $billingDate = Carbon::create($asOfDate->year, $fixedMonth, $fixedDay);

        // Check if we're within the grace period of the billing date
        if (abs($billingDate->diffInDays($asOfDate)) > $gracePeriodDays) {
            return [
                'generated' => 0,
                'skipped' => 0,
                'errors' => 0,
                'message' => "Not within billing window. Next billing: {$billingDate->format('Y-m-d')}",
            ];
        }

        // Get members with active membership periods
        $members = Member::whereHas('activeMembershipPeriods')
            ->with(['activeMembershipPeriods.membershipTier'])
            ->get();

        foreach ($members as $member) {
            try {
                foreach ($member->activeMembershipPeriods as $period) {
                    // Skip if no tier or tier is not active
                    if (! $period->membershipTier || ! $period->membershipTier->is_active) {
                        $skipped++;

                        continue;
                    }

                    // Check if invoice already exists for this period and billing date
                    if ($this->hasRecentInvoice($member, $period, $billingDate, $gracePeriodDays)) {
                        $skipped++;

                        continue;
                    }

                    // Generate invoice
                    if ($this->createMembershipInvoice($member, $period, $billingDate)) {
                        $generated++;

                        // Update last renewal date
                        $member->update(['lastrenewal' => $billingDate]);
                    } else {
                        $errors++;
                    }
                }
            } catch (\Exception $e) {
                Log::error('Error generating fixed-date billing for member '.$member->id.': '.$e->getMessage());
                $errors++;
            }
        }

        return [
            'generated' => $generated,
            'skipped' => $skipped,
            'errors' => $errors,
            'message' => "Fixed-date billing: Generated {$generated} invoices for {$billingDate->format('Y-m-d')}",
        ];
    }

    /**
     * Check if member has a recent invoice for this membership period
     */
    protected function hasRecentInvoice(Member $member, MembershipPeriod $period, Carbon $billingDate, int $gracePeriodDays): bool
    {
        return Invoice::where('member_id', $member->id)
            ->whereHas('items', function ($query) use ($period) {
                $query->where('description', 'like', '%membership%')
                    ->orWhere('description', 'like', '%dues%')
                    ->orWhere('description', 'like', '%'.$period->membershipTier->name.'%');
            })
            ->whereBetween('invoice_date', [
                $billingDate->copy()->subDays($gracePeriodDays),
                $billingDate->copy()->addDays($gracePeriodDays),
            ])
            ->exists();
    }

    /**
     * Create a membership invoice for a member
     */
    protected function createMembershipInvoice(Member $member, MembershipPeriod $period, Carbon $invoiceDate): bool
    {
        try {
            DB::beginTransaction();

            $tier = $period->membershipTier;
            $dueDays = (int) Setting::get('membership_invoice_due_days', 30);

            // Calculate period dates
            $periodStart = $invoiceDate->copy();
            $periodEnd = $this->calculatePeriodEnd($periodStart, $tier->billing_period);

            // Create invoice
            $invoice = Invoice::create([
                'invoice_number' => Invoice::generateInvoiceNumber(),
                'member_id' => $member->id,
                'invoice_date' => $invoiceDate,
                'due_date' => $invoiceDate->copy()->addDays($dueDays),
                'status' => 'draft',
                'subtotal' => $tier->price,
                'tax_amount' => 0,
                'total' => $tier->price,
                'amount_paid' => 0,
                'notes' => "Membership dues for {$tier->name} - {$periodStart->format('M d, Y')} to {$periodEnd->format('M d, Y')}",
            ]);

            // Create invoice item
            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'description' => "{$tier->name} Membership Dues",
                'quantity' => 1,
                'unit_price' => $tier->price,
                'total' => $tier->price,
            ]);

            // Update membership period
            $period->update([
                'invoice_id' => $invoice->id,
                'end_date' => $periodEnd,
            ]);

            DB::commit();

            Log::info("Created membership invoice {$invoice->invoice_number} for member {$member->id}");

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating membership invoice: '.$e->getMessage());

            return false;
        }
    }

    /**
     * Calculate period end date based on billing period
     */
    protected function calculatePeriodEnd(Carbon $start, string $billingPeriod): Carbon
    {
        $end = $start->copy();

        switch ($billingPeriod) {
            case 'monthly':
                return $end->addMonth()->subDay();
            case 'annual':
                return $end->addYear()->subDay();
            case 'lifetime':
                return $end->addYears(100); // Effectively no end
            default:
                return $end->addYear()->subDay(); // Default to annual
        }
    }

    /**
     * Get members due for renewal on a specific date
     */
    public function getMembersDueForRenewal(?Carbon $date = null): Collection
    {
        $date = $date ?? now();
        $billingMethod = Setting::get('membership_billing_method', 'anniversary');
        $gracePeriodDays = (int) Setting::get('membership_billing_grace_period_days', 30);

        if ($billingMethod === 'anniversary') {
            return Member::whereHas('activeMembershipPeriods')
                ->with(['activeMembershipPeriods.membershipTier'])
                ->get()
                ->filter(function ($member) use ($date, $gracePeriodDays) {
                    if (! $member->lastrenewal) {
                        return false;
                    }
                    $anniversaryDate = Carbon::parse($member->lastrenewal)->year($date->year);

                    return abs($anniversaryDate->diffInDays($date)) <= $gracePeriodDays;
                });
        } else {
            $fixedMonth = (int) Setting::get('membership_billing_fixed_month', 1);
            $fixedDay = (int) Setting::get('membership_billing_fixed_day', 1);
            $billingDate = Carbon::create($date->year, $fixedMonth, $fixedDay);

            if (abs($billingDate->diffInDays($date)) <= $gracePeriodDays) {
                return Member::whereHas('activeMembershipPeriods')
                    ->with(['activeMembershipPeriods.membershipTier'])
                    ->get();
            }

            return collect();
        }
    }
}
