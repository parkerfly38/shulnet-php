<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Yahrzeit;
use App\Models\Event;
use App\Models\Invoice;
use App\Services\HebrewCalendarService;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(HebrewCalendarService $hebrewCalendarService)
    {
        // Get members joined by month for the current year
        $currentYear = now()->year;
        
        // SQLite-compatible query using strftime
        $driver = DB::connection()->getDriverName();
        
        if ($driver === 'sqlite') {
            $monthExpression = "CAST(strftime('%m', created_at) AS INTEGER)";
        } else {
            // MySQL/PostgreSQL
            $monthExpression = 'MONTH(created_at)';
        }
        
        $membersJoinedByMonth = Member::select(
            DB::raw("$monthExpression as month"),
            DB::raw('COUNT(*) as count')
        )
        ->whereYear('created_at', $currentYear)
        ->groupBy('month')
        ->orderBy('month')
        ->get()
        ->pluck('count', 'month')
        ->toArray();

        // Fill in missing months with 0
        $chartData = [];
        $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        for ($month = 1; $month <= 12; $month++) {
            $chartData[] = [
                'month' => $monthNames[$month - 1],
                'members' => $membersJoinedByMonth[$month] ?? 0,
            ];
        }

        // Get current Hebrew date
        $currentHebrewDate = $hebrewCalendarService->getCurrentHebrewDate();
        
        // Get yahrzeits for the current Hebrew month
        $currentMonthYahrzeits = Yahrzeit::where('hebrew_month_of_death', $currentHebrewDate['month'])
            ->with('members:id,first_name,last_name')
            ->orderBy('hebrew_day_of_death')
            ->get()
            ->map(function ($yahrzeit) {
                return [
                    'id' => $yahrzeit->id,
                    'name' => $yahrzeit->name,
                    'hebrew_name' => $yahrzeit->hebrew_name,
                    'hebrew_day_of_death' => $yahrzeit->hebrew_day_of_death,
                    'hebrew_month_of_death' => $yahrzeit->hebrew_month_of_death,
                    'date_of_death' => $yahrzeit->date_of_death?->format('Y-m-d'),
                    'members' => $yahrzeit->members->map(function ($member) {
                        return [
                            'id' => $member->id,
                            'name' => $member->first_name . ' ' . $member->last_name,
                            'relationship' => $member->pivot->relationship,
                        ];
                    }),
                ];
            });

        // Get upcoming events (next 5 events starting from now)
        $upcomingEvents = Event::where('event_start', '>=', now())
            ->orderBy('event_start')
            ->limit(5)
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'tagline' => $event->tagline,
                    'event_start' => $event->event_start,
                    'event_end' => $event->event_end,
                    'all_day' => $event->all_day,
                    'location' => $event->location,
                    'online' => $event->online,
                    'registration_required' => $event->registration_required,
                    'members_only' => $event->members_only,
                ];
            });

        // Get open invoices with aging
        $openInvoices = Invoice::whereIn('status', ['open', 'overdue', 'draft'])
            ->with('member:id,first_name,last_name')
            ->orderBy('due_date')
            ->get()
            ->map(function ($invoice) {
                $daysOverdue = null;
                $agingCategory = 'current';
                
                if ($invoice->due_date) {
                    $daysOverdue = now()->diffInDays($invoice->due_date, false);
                    
                    if ($daysOverdue < 0) {
                        $daysOverdue = abs($daysOverdue);
                        if ($daysOverdue <= 30) {
                            $agingCategory = '1-30';
                        } elseif ($daysOverdue <= 60) {
                            $agingCategory = '31-60';
                        } elseif ($daysOverdue <= 90) {
                            $agingCategory = '61-90';
                        } else {
                            $agingCategory = '90+';
                        }
                    }
                }
                
                return [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'member_name' => $invoice->member ? 
                        $invoice->member->first_name . ' ' . $invoice->member->last_name : 
                        'Unknown',
                    'member_id' => $invoice->member_id,
                    'due_date' => $invoice->due_date?->format('Y-m-d'),
                    'total' => $invoice->total,
                    'status' => $invoice->status,
                    'days_overdue' => $daysOverdue,
                    'aging_category' => $agingCategory,
                ];
            });

        // Group by aging category
        $invoiceAging = [
            'current' => ['count' => 0, 'total' => 0],
            '1-30' => ['count' => 0, 'total' => 0],
            '31-60' => ['count' => 0, 'total' => 0],
            '61-90' => ['count' => 0, 'total' => 0],
            '90+' => ['count' => 0, 'total' => 0],
        ];

        foreach ($openInvoices as $invoice) {
            $category = $invoice['aging_category'];
            $invoiceAging[$category]['count']++;
            $invoiceAging[$category]['total'] += floatval($invoice['total']);
        }

        return Inertia::render('dashboard', [
            'membersJoinedData' => $chartData,
            'currentYear' => $currentYear,
            'currentHebrewDate' => $currentHebrewDate,
            'currentMonthYahrzeits' => $currentMonthYahrzeits,
            'upcomingEvents' => $upcomingEvents,
            'openInvoices' => $openInvoices->take(10), // Limit to 10 most recent
            'invoiceAging' => $invoiceAging,
        ]);
    }
}
