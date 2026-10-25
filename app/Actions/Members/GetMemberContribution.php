<?php

namespace App\Actions\Members;

use App\Models\Member;

class GetMemberContribution
{
    public function handle(Member $member): array
    {
        // Count boards and committees
        $boardsCount = $member->boards()->count();
        $committeesCount = $member->committees()->count();

        // Get all invoices with their items for this member
        $invoices = \App\Models\Invoice::where('member_id', $member->id)
            ->where('amount_paid', '>', 0)
            ->with('items')
            ->get();

        // Calculate dues, donations, and other purchases based on invoice item descriptions
        $duesTotal = 0;
        $donationsTotal = 0;
        $otherPurchasesTotal = 0;

        foreach ($invoices as $invoice) {
            $invoicePaid = floatval($invoice->amount_paid);
            $invoiceTotal = floatval($invoice->total);
            
            // Calculate the proportion of the invoice that was paid
            $paymentRatio = $invoiceTotal > 0 ? $invoicePaid / $invoiceTotal : 0;
            
            foreach ($invoice->items as $item) {
                $description = strtolower($item->description);
                // Use the item's total multiplied by payment ratio
                $amount = floatval($item->total) * $paymentRatio;

                // Categorize based on description
                if (str_contains($description, 'membership') || str_contains($description, 'dues')) {
                    $duesTotal += $amount;
                } elseif (str_contains($description, 'donation') || str_contains($description, 'contribution')) {
                    $donationsTotal += $amount;
                } else {
                    // Everything else: event tickets, tuition, products, etc.
                    $otherPurchasesTotal += $amount;
                }
            }
        }

        return [
            'boards_count' => $boardsCount,
            'committees_count' => $committeesCount,
            'dues_total' => round($duesTotal, 2),
            'donations_total' => round($donationsTotal, 2),
            'other_purchases_total' => round($otherPurchasesTotal, 2),
        ];
    }
}
