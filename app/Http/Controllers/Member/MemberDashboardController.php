<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Student;
use App\Models\Yahrzeit;
use App\Models\GabbaiAssignment;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class MemberDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $member = $user->member;

        if (!$member) {
            return redirect()->route('dashboard')->with('error', 'No member profile found.');
        }

        // Get invoices for this member
        $invoices = Invoice::where('member_id', $member->id)
            ->orderBy('due_date', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'description' => $invoice->notes ?? 'Invoice',
                    'total_amount' => $invoice->total,
                    'status' => $invoice->status,
                    'due_date' => $invoice->due_date,
                    'created_at' => $invoice->created_at,
                ];
            });

        // Get students if member is a parent
        $students = [];
        if ($member->parent_id) {
            $students = Student::where('parent_id', $member->parent_id)
                ->with(['classGrades.classDefinition', 'classGrades.teacher'])
                ->get()
                ->map(function ($student) {
                    return [
                        'id' => $student->id,
                        'first_name' => $student->first_name,
                        'last_name' => $student->last_name,
                        'email' => $student->email,
                        'classes' => $student->classGrades->map(function ($classGrade) {
                            return [
                                'id' => $classGrade->id,
                                'class_name' => $classGrade->classDefinition->class_name ?? 'N/A',
                                'teacher_name' => $classGrade->teacher ? ($classGrade->teacher->first_name . ' ' . $classGrade->teacher->last_name) : 'N/A',
                                'grade' => $classGrade->grade,
                            ];
                        }),
                    ];
                });
        }

        // Get upcoming yahrzeits (next 60 days)
        $startDate = Carbon::today();
        $endDate = Carbon::today()->addDays(60);
        
        $yahrzeits = $member->yahrzeits()
            ->get()
            ->filter(function ($yahrzeit) use ($startDate, $endDate) {
                if (!$yahrzeit->date_of_death) {
                    return false;
                }
                
                // Calculate occurrence in current year based on date_of_death
                $occurrence = Carbon::parse($yahrzeit->date_of_death);
                $currentYearOccurrence = Carbon::createFromDate($startDate->year, $occurrence->month, $occurrence->day);
                
                if ($currentYearOccurrence->lt($startDate)) {
                    $currentYearOccurrence->addYear();
                }
                
                return $currentYearOccurrence->between($startDate, $endDate);
            })
            ->map(function ($yahrzeit) {
                $occurrence = Carbon::parse($yahrzeit->date_of_death);
                $currentYearOccurrence = Carbon::createFromDate(Carbon::today()->year, $occurrence->month, $occurrence->day);
                
                if ($currentYearOccurrence->lt(Carbon::today())) {
                    $currentYearOccurrence->addYear();
                }
                
                return [
                    'id' => $yahrzeit->id,
                    'name' => $yahrzeit->name,
                    'hebrew_name' => $yahrzeit->hebrew_name,
                    'relationship' => $yahrzeit->pivot->relationship ?? 'Unknown',
                    'date_of_death' => $yahrzeit->date_of_death,
                    'occurrence_date' => $currentYearOccurrence->toDateString(),
                ];
            })
            ->sortBy('occurrence_date')
            ->values();

        // Get upcoming aliyah assignments (next 60 days)
        $assignments = GabbaiAssignment::where('member_id', $member->id)
            ->where('date', '>=', $startDate->toDateString())
            ->where('date', '<=', $endDate->toDateString())
            ->orderBy('date', 'asc')
            ->get()
            ->map(function ($assignment) {
                return [
                    'id' => $assignment->id,
                    'date' => $assignment->date,
                    'honor' => $assignment->honor,
                ];
            });

        // Get upcoming events (next 60 days)
        $events = Event::where('event_start', '>=', $startDate->toDateString())
            ->where('event_start', '<=', $endDate->toDateString())
            ->orderBy('event_start', 'asc')
            ->limit(10)
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->name,
                    'description' => $event->tagline ?? $event->description,
                    'start_date' => $event->event_start,
                    'end_date' => $event->event_end,
                    'location' => $event->location,
                ];
            });

        return Inertia::render('member/dashboard', [
            'member' => [
                'id' => $member->id,
                'first_name' => $member->first_name,
                'last_name' => $member->last_name,
                'email' => $member->email,
            ],
            'invoices' => $invoices,
            'students' => $students,
            'yahrzeits' => $yahrzeits,
            'assignments' => $assignments,
            'events' => $events,
        ]);
    }

    public function showInvoice(Request $request, $id)
    {
        $user = $request->user();
        $member = $user->member;

        if (!$member) {
            return redirect()->route('dashboard')->with('error', 'No member profile found.');
        }

        // Get the invoice and verify it belongs to this member
        $invoice = Invoice::with('items')->findOrFail($id);

        if ($invoice->member_id !== $member->id) {
            abort(403, 'You do not have permission to view this invoice.');
        }

        return Inertia::render('member/invoice', [
            'member' => [
                'id' => $member->id,
                'first_name' => $member->first_name,
                'last_name' => $member->last_name,
                'email' => $member->email,
                'phone1' => $member->phone1,
                'address_line_1' => $member->address_line_1,
                'address_line_2' => $member->address_line_2,
                'city' => $member->city,
                'state' => $member->state,
                'zip' => $member->zip,
            ],
            'invoice' => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'invoice_date' => $invoice->invoice_date,
                'due_date' => $invoice->due_date,
                'status' => $invoice->status,
                'subtotal' => $invoice->subtotal,
                'tax_amount' => $invoice->tax_amount,
                'total' => $invoice->total,
                'notes' => $invoice->notes,
                'created_at' => $invoice->created_at,
                'items' => $invoice->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'description' => $item->description,
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'total' => $item->total,
                    ];
                }),
            ],
        ]);
    }
}
