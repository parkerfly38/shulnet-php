<?php

namespace App\Http\Controllers;

use App\Mail\InvoiceMail;
use App\Models\Event;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Member;
use App\Models\MembershipPeriod;
use App\Models\MembershipTier;
use App\Models\ParentModel;
use App\Models\SchoolTuitionTier;
use App\Models\Student;
use App\Models\Yahrzeit;
use App\Services\HebrewCalendarService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(HebrewCalendarService $hebrewCalendarService, Request $request)
    {
        $user = $request->user();

        // Check if user is an admin
        if ($user->hasRole('admin')) {
            return $this->adminDashboard($hebrewCalendarService);
        }

        // Check if user has a member profile
        if ($user->member) {
            return redirect()->route('member.dashboard');
        }

        // Default user dashboard (no member profile)
        return $this->defaultDashboard($user);
    }

    private function defaultDashboard($user)
    {
        return Inertia::render('dashboard', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    private function adminDashboard(HebrewCalendarService $hebrewCalendarService)
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
                            'name' => $member->first_name.' '.$member->last_name,
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
                    $daysOverdue = (int) floor(now()->diffInDays($invoice->due_date, false));

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
                        $invoice->member->first_name.' '.$invoice->member->last_name :
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

        // Get active membership tiers for onboarding workflow
        $membershipTiers = MembershipTier::active()
            ->ordered()
            ->get(['id', 'name', 'slug', 'description', 'price', 'billing_period', 'features']);

        // Get active school tuition tiers for student onboarding workflow
        $schoolTuitionTiers = SchoolTuitionTier::active()
            ->ordered()
            ->get(['id', 'name', 'slug', 'description', 'price', 'billing_period', 'features']);

        // Get parents and members for student onboarding workflow
        $parents = ParentModel::select('id', 'first_name', 'last_name', 'email')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        $members = Member::select('id', 'first_name', 'last_name', 'email')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        return Inertia::render('admin/dashboard', [
            'membersJoinedData' => $chartData,
            'currentYear' => $currentYear,
            'currentHebrewDate' => $currentHebrewDate,
            'currentMonthYahrzeits' => $currentMonthYahrzeits,
            'upcomingEvents' => $upcomingEvents,
            'openInvoices' => $openInvoices->take(10), // Limit to 10 most recent
            'invoiceAging' => $invoiceAging,
            'membershipTiers' => $membershipTiers,
            'schoolTuitionTiers' => $schoolTuitionTiers,
            'parents' => $parents,
            'members' => $members,
        ]);
    }

    public function onboardMember(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|string|in:male,female,other',
            'membership_tier_id' => 'required|exists:membership_tiers,id',
            'start_date' => 'required|date',
            'create_invoice' => 'boolean',
            'email_invoice' => 'boolean',
        ]);

        DB::beginTransaction();
        try {
            // Create the member
            $member = Member::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
                'date_of_birth' => $validated['date_of_birth'] ?? null,
                'gender' => $validated['gender'] ?? null,
                'status' => 'active',
            ]);

            // Create membership period
            $tier = MembershipTier::findOrFail($validated['membership_tier_id']);
            $startDate = $validated['start_date'];

            // Calculate end date based on billing period
            $endDate = match ($tier->billing_period) {
                'annual' => date('Y-m-d', strtotime($startDate.' +1 year -1 day')),
                'monthly' => date('Y-m-d', strtotime($startDate.' +1 month -1 day')),
                'lifetime' => null,
                default => date('Y-m-d', strtotime($startDate.' +1 year -1 day')),
            };

            $membershipPeriod = MembershipPeriod::create([
                'member_id' => $member->id,
                'membership_tier_id' => $tier->id,
                'begin_date' => $startDate,
                'end_date' => $endDate,
                'price' => $tier->price,
                'status' => 'active',
            ]);

            // Create invoice if requested
            if ($validated['create_invoice'] ?? false) {
                $invoice = Invoice::create([
                    'member_id' => $member->id,
                    'invoiceable_type' => Member::class,
                    'invoiceable_id' => $member->id,
                    'invoice_number' => 'INV-'.date('Y').'-'.str_pad(Invoice::max('id') + 1, 6, '0', STR_PAD_LEFT),
                    'invoice_date' => now(),
                    'due_date' => date('Y-m-d', strtotime('+30 days')),
                    'subtotal' => $tier->price,
                    'tax' => 0,
                    'total' => $tier->price,
                    'status' => 'open',
                    'notes' => 'Membership: '.$tier->name,
                ]);

                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'description' => $tier->name.' Membership',
                    'quantity' => 1,
                    'unit_price' => $tier->price,
                    'total' => $tier->price,
                ]);

                // Send email if requested
                if ($validated['email_invoice'] ?? false) {
                    if ($member->email) {
                        try {
                            // Generate PDF path (you may need to implement PDF generation)
                            $pdfPath = storage_path('app/invoices/invoice-'.$invoice->invoice_number.'.pdf');

                            Mail::to($member->email)->send(new InvoiceMail($invoice->load('member', 'items'), $pdfPath));
                        } catch (\Exception $e) {
                            // Log error but don't fail the onboarding
                            \Log::warning('Failed to send invoice email: '.$e->getMessage());
                        }
                    }
                }
            }

            DB::commit();

            return redirect()->route('dashboard')->with('success', 'Member onboarded successfully!');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Failed to onboard member: '.$e->getMessage()]);
        }
    }

    public function onboardStudent(Request $request)
    {
        $validated = $request->validate([
            'students' => 'required|array|min:1',
            'students.*.first_name' => 'required|string|max:255',
            'students.*.last_name' => 'required|string|max:255',
            'students.*.middle_name' => 'nullable|string|max:255',
            'students.*.email' => 'nullable|email|max:255',
            'students.*.gender' => 'nullable|string|in:male,female,other',
            'students.*.date_of_birth' => 'nullable|date',
            'students.*.address' => 'nullable|string',
            'parent_data.selection_type' => 'required|in:existing_parent,existing_member,new_parent',
            'parent_data.parent_id' => 'required_if:parent_data.selection_type,existing_parent',
            'parent_data.member_id' => 'required_if:parent_data.selection_type,existing_member',
            'parent_data.first_name' => 'required_if:parent_data.selection_type,new_parent|string|max:255',
            'parent_data.last_name' => 'required_if:parent_data.selection_type,new_parent|string|max:255',
            'parent_data.email' => 'required_if:parent_data.selection_type,new_parent|email|max:255',
            'parent_data.phone' => 'nullable|string|max:50',
            'parent_data.address' => 'nullable|string',
            'tuition_data.tuition_tier_id' => 'required|exists:school_tuition_tiers,id',
            'tuition_data.quantity' => 'required|integer|min:1',
            'tuition_data.start_date' => 'required|date',
            'tuition_data.create_invoice' => 'boolean',
            'tuition_data.email_invoice' => 'boolean',
        ]);

        DB::beginTransaction();
        try {
            // Handle parent creation/selection
            $parentId = null;
            $parentData = $validated['parent_data'];

            if ($parentData['selection_type'] === 'existing_parent') {
                $parentId = $parentData['parent_id'];
            } elseif ($parentData['selection_type'] === 'existing_member') {
                // Convert member to parent
                $member = Member::findOrFail($parentData['member_id']);
                $parent = ParentModel::create([
                    'first_name' => $member->first_name,
                    'last_name' => $member->last_name,
                    'email' => $member->email,
                    'phone' => $member->phone,
                    'address' => $member->address,
                    'member_id' => $member->id,
                ]);
                $parentId = $parent->id;
            } else {
                // Create new parent
                $parent = ParentModel::create([
                    'first_name' => $parentData['first_name'],
                    'last_name' => $parentData['last_name'],
                    'email' => $parentData['email'],
                    'phone' => $parentData['phone'] ?? null,
                    'address' => $parentData['address'] ?? null,
                ]);
                $parentId = $parent->id;
            }

            // Create students
            $students = [];
            foreach ($validated['students'] as $studentData) {
                $student = Student::create([
                    'first_name' => $studentData['first_name'],
                    'last_name' => $studentData['last_name'],
                    'middle_name' => $studentData['middle_name'] ?? null,
                    'email' => $studentData['email'] ?? null,
                    'gender' => $studentData['gender'] ?? null,
                    'date_of_birth' => $studentData['date_of_birth'] ?? null,
                    'address' => $studentData['address'] ?? null,
                    'parent_id' => $parentId,
                    'status' => 'active',
                ]);
                $students[] = $student;
            }

            // Create invoice if requested
            $tuitionData = $validated['tuition_data'];
            if ($tuitionData['create_invoice'] ?? false) {
                $tier = SchoolTuitionTier::findOrFail($tuitionData['tuition_tier_id']);
                $quantity = $tuitionData['quantity'];
                $total = $tier->price * $quantity;

                // Get parent to check if they have a member_id
                $parent = ParentModel::find($parentId);
                $memberId = $parent->member_id ?? null;

                $invoice = Invoice::create([
                    'member_id' => $memberId,
                    'invoiceable_type' => ParentModel::class,
                    'invoiceable_id' => $parentId,
                    'invoice_number' => 'INV-'.date('Y').'-'.str_pad(Invoice::max('id') + 1, 6, '0', STR_PAD_LEFT),
                    'invoice_date' => now(),
                    'due_date' => date('Y-m-d', strtotime('+30 days')),
                    'subtotal' => $total,
                    'tax' => 0,
                    'total' => $total,
                    'status' => 'open',
                    'notes' => 'Tuition for '.count($students).' student(s): '.$tier->name,
                ]);

                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'description' => $tier->name.' ('.$quantity.' student'.($quantity > 1 ? 's' : '').')',
                    'quantity' => $quantity,
                    'unit_price' => $tier->price,
                    'total' => $total,
                ]);

                // Send email if requested
                if ($validated['tuition_data']['email_invoice'] ?? false) {
                    $parent = ParentModel::find($parentId);
                    if ($parent && $parent->email) {
                        try {
                            // Generate PDF path (you may need to implement PDF generation)
                            $pdfPath = storage_path('app/invoices/invoice-'.$invoice->invoice_number.'.pdf');

                            Mail::to($parent->email)->send(new InvoiceMail($invoice->load('member', 'items'), $pdfPath));
                        } catch (\Exception $e) {
                            // Log error but don't fail the onboarding
                            \Log::warning('Failed to send invoice email: '.$e->getMessage());
                        }
                    }
                }
            }

            DB::commit();

            return redirect()->route('dashboard')->with('success', count($students).' student(s) onboarded successfully!');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Failed to onboard student(s): '.$e->getMessage()]);
        }
    }
}
