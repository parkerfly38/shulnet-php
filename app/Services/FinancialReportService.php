<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Member;
use App\Models\Payment;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class FinancialReportService
{
    /**
     * Generate income summary report
     */
    public function getIncomeSummary(string $startDate, string $endDate): array
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        // Get payments in date range
        $payments = Payment::where('status', 'completed')
            ->whereBetween('paid_at', [$start, $end])
            ->with('invoice')
            ->get();

        $membershipDues = 0;
        $tuition = 0;
        $eventRevenue = 0;
        $donations = 0;
        $otherIncome = 0;

        foreach ($payments as $payment) {
            $invoice = $payment->invoice;
            if (!$invoice) {
                $otherIncome += $payment->amount;
                continue;
            }

            // Categorize based on invoice items
            $items = $invoice->items;
            foreach ($items as $item) {
                $description = strtolower($item->description);
                $itemTotal = $item->total;

                if (str_contains($description, 'membership') || str_contains($description, 'dues')) {
                    $membershipDues += $itemTotal;
                } elseif (str_contains($description, 'tuition') || str_contains($description, 'hebrew school')) {
                    $tuition += $itemTotal;
                } elseif (str_contains($description, 'event') || str_contains($description, 'ticket')) {
                    $eventRevenue += $itemTotal;
                } elseif (str_contains($description, 'donation') || str_contains($description, 'contribution')) {
                    $donations += $itemTotal;
                } else {
                    $otherIncome += $itemTotal;
                }
            }
        }

        $total = $membershipDues + $tuition + $eventRevenue + $donations + $otherIncome;

        return [
            'start_date' => $start->format('Y-m-d'),
            'end_date' => $end->format('Y-m-d'),
            'categories' => [
                'membership_dues' => round($membershipDues, 2),
                'tuition' => round($tuition, 2),
                'event_revenue' => round($eventRevenue, 2),
                'donations' => round($donations, 2),
                'other_income' => round($otherIncome, 2),
            ],
            'total_revenue' => round($total, 2),
            'payment_count' => $payments->count(),
        ];
    }

    /**
     * Get outstanding balances report
     */
    public function getOutstandingBalances(float $minBalance = 0): array
    {
        $invoices = Invoice::where('status', '!=', 'paid')
            ->where('status', '!=', 'cancelled')
            ->whereRaw('total - amount_paid > ?', [$minBalance])
            ->with('member:id,first_name,last_name,email,phone1,member_type')
            ->get();

        $balances = [];
        foreach ($invoices as $invoice) {
            $memberId = $invoice->member_id;
            if (!isset($balances[$memberId])) {
                $balances[$memberId] = [
                    'member_id' => $memberId,
                    'member_name' => $invoice->member 
                        ? $invoice->member->first_name . ' ' . $invoice->member->last_name 
                        : 'Unknown',
                    'email' => $invoice->member->email ?? '',
                    'phone' => $invoice->member->phone1 ?? '',
                    'member_type' => $invoice->member->member_type ?? '',
                    'total_owed' => 0,
                    'invoice_count' => 0,
                    'oldest_invoice_date' => null,
                    'invoices' => [],
                ];
            }

            $balance = $invoice->total - $invoice->amount_paid;
            $balances[$memberId]['total_owed'] += $balance;
            $balances[$memberId]['invoice_count']++;
            $balances[$memberId]['invoices'][] = [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'invoice_date' => $invoice->invoice_date->format('Y-m-d'),
                'due_date' => $invoice->due_date->format('Y-m-d'),
                'total' => $invoice->total,
                'amount_paid' => $invoice->amount_paid,
                'balance' => round($balance, 2),
                'status' => $invoice->status,
            ];

            if (
                !$balances[$memberId]['oldest_invoice_date'] ||
                $invoice->invoice_date < Carbon::parse($balances[$memberId]['oldest_invoice_date'])
            ) {
                $balances[$memberId]['oldest_invoice_date'] = $invoice->invoice_date->format('Y-m-d');
            }
        }

        // Sort by amount owed (highest first)
        $balances = collect($balances)->sortByDesc('total_owed')->values()->all();

        // Round totals
        foreach ($balances as &$balance) {
            $balance['total_owed'] = round($balance['total_owed'], 2);
        }

        $totalOutstanding = array_sum(array_column($balances, 'total_owed'));

        return [
            'balances' => $balances,
            'total_outstanding' => round($totalOutstanding, 2),
            'member_count' => count($balances),
        ];
    }

    /**
     * Get aging report - categorize invoices by how long they've been outstanding
     */
    public function getAgingReport(): array
    {
        $today = Carbon::today();

        $invoices = Invoice::where('status', '!=', 'paid')
            ->where('status', '!=', 'cancelled')
            ->whereRaw('total - amount_paid > 0')
            ->with('member:id,first_name,last_name,email')
            ->get();

        $aging = [
            'current' => ['count' => 0, 'total' => 0, 'invoices' => []],      // 0-30 days
            '31_60' => ['count' => 0, 'total' => 0, 'invoices' => []],        // 31-60 days
            '61_90' => ['count' => 0, 'total' => 0, 'invoices' => []],        // 61-90 days
            'over_90' => ['count' => 0, 'total' => 0, 'invoices' => []],      // 90+ days
        ];

        foreach ($invoices as $invoice) {
            $balance = $invoice->total - $invoice->amount_paid;
            $daysOld = $today->diffInDays($invoice->due_date, false); // negative if overdue

            $invoiceData = [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'member_name' => $invoice->member 
                    ? $invoice->member->first_name . ' ' . $invoice->member->last_name 
                    : 'Unknown',
                'invoice_date' => $invoice->invoice_date->format('Y-m-d'),
                'due_date' => $invoice->due_date->format('Y-m-d'),
                'days_old' => abs((int)$daysOld),
                'balance' => round($balance, 2),
            ];

            if ($daysOld >= -30) {
                $aging['current']['count']++;
                $aging['current']['total'] += $balance;
                $aging['current']['invoices'][] = $invoiceData;
            } elseif ($daysOld >= -60) {
                $aging['31_60']['count']++;
                $aging['31_60']['total'] += $balance;
                $aging['31_60']['invoices'][] = $invoiceData;
            } elseif ($daysOld >= -90) {
                $aging['61_90']['count']++;
                $aging['61_90']['total'] += $balance;
                $aging['61_90']['invoices'][] = $invoiceData;
            } else {
                $aging['over_90']['count']++;
                $aging['over_90']['total'] += $balance;
                $aging['over_90']['invoices'][] = $invoiceData;
            }
        }

        // Round totals
        foreach ($aging as $key => &$bucket) {
            $bucket['total'] = round($bucket['total'], 2);
        }

        return [
            'aging_buckets' => $aging,
            'total_outstanding' => round(
                $aging['current']['total'] + 
                $aging['31_60']['total'] + 
                $aging['61_90']['total'] + 
                $aging['over_90']['total'],
                2
            ),
        ];
    }

    /**
     * Get event revenue report with detailed analytics
     */
    public function getEventRevenue(string $startDate, string $endDate): array
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        // Get all events in date range
        $events = \App\Models\Event::whereBetween('event_start', [$start, $end])
            ->with(['ticketTypes', 'rsvps.ticketType', 'rsvps.member'])
            ->get();

        $totalRevenue = 0;
        $totalAttendees = 0;
        $eventBreakdown = [];
        $ticketTypeBreakdown = [];

        foreach ($events as $event) {
            $eventRevenue = 0;
            $eventAttendees = 0;
            $ticketSales = [];

            foreach ($event->rsvps as $rsvp) {
                if ($rsvp->status === 'confirmed' || $rsvp->status === 'paid') {
                    $rsvpAmount = $rsvp->total_amount ?? ($rsvp->ticket_price * $rsvp->quantity);
                    $eventRevenue += $rsvpAmount;
                    $totalRevenue += $rsvpAmount;
                    
                    $attendeeCount = $rsvp->quantity ?? 1;
                    $eventAttendees += $attendeeCount;
                    $totalAttendees += $attendeeCount;

                    // Track ticket type sales
                    $ticketTypeName = $rsvp->ticketType->name ?? 'General Admission';
                    if (!isset($ticketSales[$ticketTypeName])) {
                        $ticketSales[$ticketTypeName] = [
                            'quantity' => 0,
                            'revenue' => 0,
                        ];
                    }
                    $ticketSales[$ticketTypeName]['quantity'] += $attendeeCount;
                    $ticketSales[$ticketTypeName]['revenue'] += $rsvpAmount;

                    // Track global ticket type breakdown
                    if (!isset($ticketTypeBreakdown[$ticketTypeName])) {
                        $ticketTypeBreakdown[$ticketTypeName] = [
                            'ticket_type' => $ticketTypeName,
                            'quantity' => 0,
                            'revenue' => 0,
                        ];
                    }
                    $ticketTypeBreakdown[$ticketTypeName]['quantity'] += $attendeeCount;
                    $ticketTypeBreakdown[$ticketTypeName]['revenue'] += $rsvpAmount;
                }
            }

            $capacity = $event->maxrsvp ?? 0;
            $sellThroughRate = $capacity > 0 ? ($eventAttendees / $capacity) * 100 : 0;

            $eventBreakdown[] = [
                'event_id' => $event->id,
                'event_name' => $event->name,
                'event_date' => Carbon::parse($event->event_start)->format('Y-m-d'),
                'revenue' => round($eventRevenue, 2),
                'attendees' => $eventAttendees,
                'capacity' => $capacity,
                'sell_through_rate' => round($sellThroughRate, 2),
                'average_ticket_price' => $eventAttendees > 0 ? round($eventRevenue / $eventAttendees, 2) : 0,
                'ticket_sales' => $ticketSales,
            ];
        }

        // Sort events by revenue (highest first)
        usort($eventBreakdown, fn($a, $b) => $b['revenue'] <=> $a['revenue']);

        // Convert ticket type breakdown to array and sort
        $ticketTypeBreakdown = array_values($ticketTypeBreakdown);
        usort($ticketTypeBreakdown, fn($a, $b) => $b['revenue'] <=> $a['revenue']);

        // Round ticket type totals
        foreach ($ticketTypeBreakdown as &$ticketType) {
            $ticketType['revenue'] = round($ticketType['revenue'], 2);
            $ticketType['average_price'] = $ticketType['quantity'] > 0 
                ? round($ticketType['revenue'] / $ticketType['quantity'], 2) 
                : 0;
        }

        return [
            'start_date' => $start->format('Y-m-d'),
            'end_date' => $end->format('Y-m-d'),
            'total_revenue' => round($totalRevenue, 2),
            'total_attendees' => $totalAttendees,
            'event_count' => $events->count(),
            'average_revenue_per_event' => $events->count() > 0 
                ? round($totalRevenue / $events->count(), 2) 
                : 0,
            'events' => $eventBreakdown,
            'ticket_types' => $ticketTypeBreakdown,
        ];
    }

    /**
     * Get revenue by source report
     */
    public function getRevenueBySource(string $startDate, string $endDate): array
    {
        $incomeSummary = $this->getIncomeSummary($startDate, $endDate);
        $categories = $incomeSummary['categories'];
        $total = $incomeSummary['total_revenue'];

        $breakdown = [];
        foreach ($categories as $category => $amount) {
            $percentage = $total > 0 ? ($amount / $total) * 100 : 0;
            $breakdown[] = [
                'category' => ucwords(str_replace('_', ' ', $category)),
                'amount' => round($amount, 2),
                'percentage' => round($percentage, 2),
            ];
        }

        // Sort by amount descending
        usort($breakdown, fn($a, $b) => $b['amount'] <=> $a['amount']);

        return [
            'start_date' => $incomeSummary['start_date'],
            'end_date' => $incomeSummary['end_date'],
            'breakdown' => $breakdown,
            'total_revenue' => $total,
        ];
    }

    /**
     * Get member growth report
     */
    public function getMemberGrowth(string $startDate, string $endDate): array
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        // Members at start of period
        $startingMembers = Member::where('member_type', 'member')
            ->where('created_at', '<', $start)
            ->count();

        // New members during period
        $newMembers = Member::where('member_type', 'member')
            ->whereBetween('created_at', [$start, $end])
            ->count();

        // Current total
        $currentTotal = Member::where('member_type', 'member')->count();

        // Calculate net change and members lost
        $netChange = $currentTotal - $startingMembers;
        $membersLost = $newMembers - $netChange;

        // Get member type breakdown
        $membersByType = Member::select('member_type', DB::raw('count(*) as count'))
            ->whereIn('member_type', ['member', 'honorary', 'prospective'])
            ->groupBy('member_type')
            ->get()
            ->pluck('count', 'member_type')
            ->toArray();

        return [
            'start_date' => $start->format('Y-m-d'),
            'end_date' => $end->format('Y-m-d'),
            'starting_members' => $startingMembers,
            'new_members' => $newMembers,
            'members_lost' => $membersLost,
            'current_total' => $currentTotal,
            'net_change' => $netChange,
            'growth_rate' => $startingMembers > 0 
                ? round(($netChange / $startingMembers) * 100, 2) 
                : ($currentTotal > 0 ? 100 : 0), // If starting from 0, show 100% growth if there are members now
            'by_type' => $membersByType,
        ];
    }

    /**
     * Get tuition revenue report
     */
    public function getTuitionRevenue(string $startDate = null, string $endDate = null): array
    {
        // Total enrolled students
        $totalStudents = Student::count();

        // Get tuition invoices
        $tuitionInvoices = Invoice::with('items')
            ->get()
            ->filter(function ($invoice) {
                return $invoice->items->some(function ($item) {
                    return str_contains(strtolower($item->description), 'tuition') ||
                           str_contains(strtolower($item->description), 'hebrew school');
                });
            });

        $projectedRevenue = $tuitionInvoices->sum('total');
        $collectedRevenue = $tuitionInvoices->sum('amount_paid');
        $outstandingRevenue = $projectedRevenue - $collectedRevenue;
        $collectionRate = $projectedRevenue > 0 
            ? ($collectedRevenue / $projectedRevenue) * 100 
            : 0;

        return [
            'total_students' => $totalStudents,
            'students_by_grade' => [],
            'projected_revenue' => round($projectedRevenue, 2),
            'collected_revenue' => round($collectedRevenue, 2),
            'outstanding_revenue' => round($outstandingRevenue, 2),
            'collection_rate' => round($collectionRate, 2),
        ];
    }

    /**
     * Get payment method analysis
     */
    public function getPaymentMethodAnalysis(string $startDate, string $endDate): array
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        $payments = Payment::where('status', 'completed')
            ->whereBetween('paid_at', [$start, $end])
            ->select('payment_method', DB::raw('count(*) as count'), DB::raw('sum(amount) as total'))
            ->groupBy('payment_method')
            ->get();

        $totalAmount = $payments->sum('total');
        $totalCount = $payments->sum('count');

        $breakdown = $payments->map(function ($payment) use ($totalAmount, $totalCount) {
            return [
                'method' => ucwords(str_replace('_', ' ', $payment->payment_method)),
                'count' => $payment->count,
                'total' => round($payment->total, 2),
                'percentage_of_revenue' => $totalAmount > 0 
                    ? round(($payment->total / $totalAmount) * 100, 2) 
                    : 0,
                'percentage_of_transactions' => $totalCount > 0 
                    ? round(($payment->count / $totalCount) * 100, 2) 
                    : 0,
                'average_transaction' => round($payment->total / $payment->count, 2),
            ];
        })->toArray();

        return [
            'start_date' => $start->format('Y-m-d'),
            'end_date' => $end->format('Y-m-d'),
            'breakdown' => $breakdown,
            'total_revenue' => round($totalAmount, 2),
            'total_transactions' => $totalCount,
        ];
    }

    /**
     * Get budget vs actual report
     */
    public function getBudgetVsActual(array $budget, string $startDate, string $endDate): array
    {
        $incomeSummary = $this->getIncomeSummary($startDate, $endDate);
        $actual = $incomeSummary['categories'];

        $comparison = [];
        foreach ($budget as $category => $budgetAmount) {
            $actualAmount = $actual[$category] ?? 0;
            $variance = $actualAmount - $budgetAmount;
            $percentOfBudget = $budgetAmount > 0 
                ? ($actualAmount / $budgetAmount) * 100 
                : 0;

            $comparison[] = [
                'category' => ucwords(str_replace('_', ' ', $category)),
                'budget' => round($budgetAmount, 2),
                'actual' => round($actualAmount, 2),
                'variance' => round($variance, 2),
                'percent_of_budget' => round($percentOfBudget, 2),
            ];
        }

        return [
            'start_date' => $incomeSummary['start_date'],
            'end_date' => $incomeSummary['end_date'],
            'comparison' => $comparison,
            'total_budget' => round(array_sum($budget), 2),
            'total_actual' => round($incomeSummary['total_revenue'], 2),
        ];
    }
}
