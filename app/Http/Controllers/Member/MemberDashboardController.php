<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Student;
use App\Models\Yahrzeit;
use App\Models\GabbaiAssignment;
use App\Models\Event;
use App\Models\Note;
use App\Models\User;
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
                ->with(['classGrades.classDefinition.teacher'])
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
                                'teacher_name' => $classGrade->classDefinition->teacher ? ($classGrade->classDefinition->teacher->first_name . ' ' . $classGrade->classDefinition->teacher->last_name) : 'N/A',
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

    public function invoices(Request $request)
    {
        $user = $request->user();
        $member = $user->member;

        if (!$member) {
            return redirect()->route('dashboard')->with('error', 'No member profile found.');
        }

        // Get all invoices for this member, ordered by date
        $invoices = Invoice::where('member_id', $member->id)
            ->orderBy('invoice_date', 'desc')
            ->get()
            ->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'invoice_date' => $invoice->invoice_date,
                    'due_date' => $invoice->due_date,
                    'status' => $invoice->status,
                    'total' => $invoice->total,
                    'amount_paid' => $invoice->amount_paid,
                    'balance' => $invoice->balance,
                    'notes' => $invoice->notes,
                ];
            });

        return Inertia::render('member/invoices', [
            'member' => [
                'id' => $member->id,
                'first_name' => $member->first_name,
                'last_name' => $member->last_name,
            ],
            'invoices' => $invoices,
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
        $invoice = Invoice::with(['items', 'payments'])->findOrFail($id);

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
                'amount_paid' => $invoice->amount_paid,
                'balance' => $invoice->balance,
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
                'payments' => $invoice->payments->map(function ($payment) {
                    return [
                        'id' => $payment->id,
                        'amount' => $payment->amount,
                        'payment_method' => $payment->payment_method,
                        'status' => $payment->status,
                        'paid_at' => $payment->paid_at,
                        'transaction_id' => $payment->transaction_id,
                    ];
                }),
            ],
        ]);
    }

    public function profile(Request $request)
    {
        $user = $request->user();
        $member = $user->member;

        if (!$member) {
            return redirect()->route('dashboard')->with('error', 'No member profile found.');
        }

        return Inertia::render('member/profile', [
            'member' => [
                'id' => $member->id,
                'first_name' => $member->first_name,
                'last_name' => $member->last_name,
                'email' => $member->email,
                'phone1' => $member->phone1,
                'phone2' => $member->phone2,
                'address_line_1' => $member->address_line_1,
                'address_line_2' => $member->address_line_2,
                'city' => $member->city,
                'state' => $member->state,
                'zip' => $member->zip,
                'hebrew_name' => $member->hebrew_name,
                'father_hebrew_name' => $member->father_hebrew_name,
                'mother_hebrew_name' => $member->mother_hebrew_name,
                'date_of_birth' => $member->date_of_birth,
            ],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $member = $user->member;

        if (!$member) {
            return redirect()->route('dashboard')->with('error', 'No member profile found.');
        }

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone1' => 'nullable|string|max:20',
            'phone2' => 'nullable|string|max:20',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:2',
            'zip' => 'nullable|string|max:10',
            'hebrew_name' => 'nullable|string|max:255',
            'father_hebrew_name' => 'nullable|string|max:255',
            'mother_hebrew_name' => 'nullable|string|max:255',
            'date_of_birth' => 'nullable|date',
        ]);

        $member->update($validated);

        return redirect()->route('member.profile')->with('success', 'Profile updated successfully!');
    }
    public function students(Request $request)
    {
        $user = $request->user();
        $member = $user->member;

        if (!$member) {
            return redirect()->route('dashboard')->with('error', 'No member profile found.');
        }

        // Get students if member is a parent
        $students = [];
        if ($member->parent_id) {
            $students = Student::where('parent_id', $member->parent_id)
                ->with([
                    'classGrades.classDefinition.teacher',
                    'examGrades.exam',
                    'subjectGrades.subject',
                    'attendances.classDefinition'
                ])
                ->get()
                ->map(function ($student) {
                    // Calculate attendance statistics
                    $totalAttendances = $student->attendances->count();
                    $presentCount = $student->attendances->where('status', 'present')->count();
                    $absentCount = $student->attendances->where('status', 'absent')->count();
                    $tardyCount = $student->attendances->where('status', 'tardy')->count();
                    $excusedCount = $student->attendances->where('status', 'excused')->count();
                    
                    $attendanceRate = $totalAttendances > 0 
                        ? round(($presentCount / $totalAttendances) * 100, 1) 
                        : null;

                    return [
                        'id' => $student->id,
                        'first_name' => $student->first_name,
                        'last_name' => $student->last_name,
                        'middle_name' => $student->middle_name,
                        'gender' => $student->gender,
                        'date_of_birth' => $student->date_of_birth,
                        'email' => $student->email,
                        'address' => $student->address,
                        'picture_url' => $student->picture_url,
                        'classes' => $student->classGrades->map(function ($classGrade) {
                            return [
                                'id' => $classGrade->id,
                                'class_name' => $classGrade->classDefinition->class_name ?? 'N/A',
                                'teacher_name' => $classGrade->classDefinition->teacher
                                    ? ($classGrade->classDefinition->teacher->first_name . ' ' . $classGrade->classDefinition->teacher->last_name)
                                    : 'N/A',
                                'grade' => $classGrade->grade,
                                'school_year' => $classGrade->classDefinition->school_year ?? null,
                            ];
                        }),
                        'subject_grades' => $student->subjectGrades->map(function ($subjectGrade) {
                            return [
                                'id' => $subjectGrade->id,
                                'subject_name' => $subjectGrade->subject->name ?? 'N/A',
                                'grade' => $subjectGrade->grade,
                            ];
                        }),
                        'exam_grades' => $student->examGrades->map(function ($examGrade) {
                            return [
                                'id' => $examGrade->id,
                                'exam_name' => $examGrade->exam->name ?? 'N/A',
                                'grade' => $examGrade->grade,
                                'date_taken' => $examGrade->exam->start_date ?? null,
                            ];
                        }),
                        'attendance' => [
                            'total' => $totalAttendances,
                            'present' => $presentCount,
                            'absent' => $absentCount,
                            'tardy' => $tardyCount,
                            'excused' => $excusedCount,
                            'attendance_rate' => $attendanceRate,
                        ],
                        'recent_attendances' => $student->attendances()
                            ->with('classDefinition')
                            ->orderBy('attendance_date', 'desc')
                            ->limit(10)
                            ->get()
                            ->map(function ($attendance) {
                                return [
                                    'id' => $attendance->id,
                                    'date' => $attendance->attendance_date,
                                    'status' => $attendance->status,
                                    'class_name' => $attendance->classDefinition->class_name ?? 'N/A',
                                    'notes' => $attendance->notes,
                                ];
                            }),
                    ];
                });
        }

        return Inertia::render('member/students', [
            'member' => [
                'id' => $member->id,
                'first_name' => $member->first_name,
                'last_name' => $member->last_name,
            ],
            'students' => $students,
            'hasStudents' => $member->parent_id !== null,
        ]);
    }

    public function updateStudent(Request $request, Student $student)
    {
        $user = $request->user();
        $member = $user->member;

        if (!$member) {
            return redirect()->route('dashboard')->with('error', 'No member profile found.');
        }

        // Verify that this student belongs to this member's parent
        if ($student->parent_id !== $member->parent_id) {
            abort(403, 'Unauthorized to update this student.');
        }

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'gender' => 'nullable|string|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
        ]);

        $student->update($validated);

        return redirect()->route('member.students')
            ->with('success', 'Student information updated successfully.');
    }

    public function yahrzeits(Request $request)
    {
        $user = $request->user();
        $member = $user->member;

        if (!$member) {
            return redirect()->route('dashboard')->with('error', 'No member profile found.');
        }

        // Get all yahrzeits for this member
        $yahrzeits = $member->yahrzeits()
            ->get()
            ->map(function ($yahrzeit) {
                // Calculate next occurrence
                $occurrence = null;
                $currentYearOccurrence = null;
                $nextYearOccurrence = null;
                $daysUntil = null;

                if ($yahrzeit->date_of_death) {
                    $occurrence = Carbon::parse($yahrzeit->date_of_death);
                    $currentYearOccurrence = Carbon::createFromDate(
                        Carbon::today()->year,
                        $occurrence->month,
                        $occurrence->day
                    );

                    if ($currentYearOccurrence->lt(Carbon::today())) {
                        $nextYearOccurrence = Carbon::createFromDate(
                            Carbon::today()->year + 1,
                            $occurrence->month,
                            $occurrence->day
                        );
                        $nextOccurrence = $nextYearOccurrence;
                    } else {
                        $nextOccurrence = $currentYearOccurrence;
                    }

                    $daysUntil = (int) round(Carbon::today()->diffInDays($nextOccurrence, false));
                }

                return [
                    'id' => $yahrzeit->id,
                    'name' => $yahrzeit->name,
                    'hebrew_name' => $yahrzeit->hebrew_name,
                    'relationship' => $yahrzeit->pivot->relationship ?? 'Unknown',
                    'date_of_death' => $yahrzeit->date_of_death,
                    'hebrew_day_of_death' => $yahrzeit->hebrew_day_of_death,
                    'hebrew_month_of_death' => $yahrzeit->hebrew_month_of_death,
                    'hebrew_year_of_death' => $yahrzeit->hebrew_year_of_death,
                    'observance_type' => $yahrzeit->observance_type,
                    'notes' => $yahrzeit->notes,
                    'next_occurrence' => $nextOccurrence?->toDateString(),
                    'days_until' => $daysUntil,
                ];
            })
            ->sortBy('days_until')
            ->values();

        return Inertia::render('member/yahrzeits', [
            'member' => [
                'id' => $member->id,
                'first_name' => $member->first_name,
                'last_name' => $member->last_name,
            ],
            'yahrzeits' => $yahrzeits,
        ]);
    }

    public function events(Request $request)
    {
        $user = $request->user();
        $member = $user->member;

        if (!$member) {
            return redirect()->route('dashboard')->with('error', 'No member profile found.');
        }

        $now = now();

        // Get member's upcoming RSVPs
        $upcomingRsvps = $member->rsvps()
            ->with('event')
            ->whereHas('event', function ($query) use ($now) {
                $query->where('event_start', '>=', $now);
            })
            ->get()
            ->map(function ($rsvp) {
                return [
                    'id' => $rsvp->id,
                    'status' => $rsvp->status,
                    'guests' => $rsvp->guests,
                    'notes' => $rsvp->notes,
                    'created_at' => $rsvp->created_at,
                    'event' => [
                        'id' => $rsvp->event->id,
                        'name' => $rsvp->event->name,
                        'tagline' => $rsvp->event->tagline,
                        'event_start' => $rsvp->event->event_start,
                        'event_end' => $rsvp->event->event_end,
                        'location' => $rsvp->event->location,
                        'all_day' => $rsvp->event->all_day,
                    ],
                ];
            });

        // Get member's past RSVPs
        $pastRsvps = $member->rsvps()
            ->with('event')
            ->whereHas('event', function ($query) use ($now) {
                $query->where('event_start', '<', $now);
            })
            ->get()
            ->map(function ($rsvp) {
                return [
                    'id' => $rsvp->id,
                    'status' => $rsvp->status,
                    'guests' => $rsvp->guests,
                    'notes' => $rsvp->notes,
                    'created_at' => $rsvp->created_at,
                    'event' => [
                        'id' => $rsvp->event->id,
                        'name' => $rsvp->event->name,
                        'tagline' => $rsvp->event->tagline,
                        'event_start' => $rsvp->event->event_start,
                        'event_end' => $rsvp->event->event_end,
                        'location' => $rsvp->event->location,
                        'all_day' => $rsvp->event->all_day,
                    ],
                ];
            });

        // Get upcoming events that member can register for (where they haven't RSVP'd)
        $rsvpedEventIds = $member->rsvps()->pluck('event_id')->toArray();
        
        $availableEvents = Event::with('ticketTypes')
            ->where('event_start', '>=', $now)
            ->where('registration_required', true)
            ->where('public', true)
            ->whereNotIn('id', $rsvpedEventIds)
            ->where(function ($query) use ($now) {
                $query->whereNull('registration_ends')
                      ->orWhere('registration_ends', '>=', $now);
            })
            ->orderBy('event_start')
            ->get()
            ->map(function ($event) {
                $ticketTypes = $event->ticketTypes->filter(fn($t) => $t->isAvailable())->map(function ($ticket) {
                    return [
                        'id' => $ticket->id,
                        'name' => $ticket->name,
                        'description' => $ticket->description,
                        'price' => $ticket->price,
                        'quantity_available' => $ticket->quantity_available,
                        'remaining_quantity' => $ticket->remainingQuantity(),
                    ];
                });

                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'tagline' => $event->tagline,
                    'event_start' => $event->event_start,
                    'event_end' => $event->event_end,
                    'location' => $event->location,
                    'all_day' => $event->all_day,
                    'registration_starts' => $event->registration_starts,
                    'registration_ends' => $event->registration_ends,
                    'maxrsvp' => $event->maxrsvp,
                    'members_only' => $event->members_only,
                    'allow_guests' => $event->allow_guests,
                    'max_guests' => $event->max_guests,
                    'ticket_types' => $ticketTypes,
                    'has_paid_tickets' => $ticketTypes->where('price', '>', 0)->count() > 0,
                ];
            });

        return Inertia::render('member/events', [
            'upcomingRsvps' => $upcomingRsvps,
            'pastRsvps' => $pastRsvps,
            'availableEvents' => $availableEvents,
        ]);
    }

    public function registerForEvent(Request $request, Event $event)
    {
        $user = $request->user();
        $member = $user->member;

        if (!$member) {
            return redirect()->route('dashboard')->with('error', 'No member profile found.');
        }

        // Validate registration is allowed
        if (!$event->registration_required || !$event->public) {
            return back()->with('error', 'Registration is not available for this event.');
        }

        $now = now();
        if ($event->registration_ends && $event->registration_ends < $now) {
            return back()->with('error', 'Registration for this event has closed.');
        }

        if ($event->registration_starts && $event->registration_starts > $now) {
            return back()->with('error', 'Registration for this event has not yet opened.');
        }

        // Check if already registered
        if ($member->rsvps()->where('event_id', $event->id)->exists()) {
            return back()->with('error', 'You are already registered for this event.');
        }

        // Validate request
        $rules = [
            'notes' => 'nullable|string|max:500',
            'ticket_type_id' => 'nullable|exists:event_ticket_types,id',
            'quantity' => 'required|integer|min:1',
            'payment_option' => 'required|in:invoice,pay_now',
        ];

        if ($event->allow_guests && $event->max_guests > 0) {
            $rules['guests'] = 'required|integer|min:0|max:' . $event->max_guests;
        }

        $validated = $request->validate($rules);

        // Get ticket type if specified
        $ticketType = null;
        $ticketPrice = 0;
        $totalAmount = 0;

        if ($validated['ticket_type_id']) {
            $ticketType = EventTicketType::find($validated['ticket_type_id']);
            
            if (!$ticketType || !$ticketType->isAvailable()) {
                return back()->with('error', 'Selected ticket type is not available.');
            }

            if ($ticketType->remainingQuantity() !== null && $ticketType->remainingQuantity() < $validated['quantity']) {
                return back()->with('error', 'Not enough tickets available.');
            }

            $ticketPrice = $ticketType->price;
            $totalAmount = $ticketPrice * $validated['quantity'];
        }

        // Create invoice if there's a cost
        $invoice = null;
        if ($totalAmount > 0) {
            $invoice = Invoice::create([
                'member_id' => $member->id,
                'invoice_number' => 'INV-' . strtoupper(uniqid()),
                'invoice_date' => now(),
                'due_date' => $event->event_start,
                'status' => 'open',
                'subtotal' => $totalAmount,
                'tax_amount' => 0,
                'total' => $totalAmount,
                'amount_paid' => 0,
                'notes' => 'Event registration: ' . $event->name,
            ]);

            // Create invoice item
            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'description' => $event->name . ($ticketType ? ' - ' . $ticketType->name : ''),
                'quantity' => $validated['quantity'],
                'unit_price' => $ticketPrice,
                'total' => $totalAmount,
            ]);
        }

        // Create RSVP
        $rsvp = $member->rsvps()->create([
            'event_id' => $event->id,
            'event_ticket_type_id' => $validated['ticket_type_id'],
            'invoice_id' => $invoice?->id,
            'name' => $member->first_name . ' ' . $member->last_name,
            'email' => $member->email,
            'phone' => $member->phone1,
            'guests' => $event->allow_guests ? ($validated['guests'] ?? 0) : 0,
            'quantity' => $validated['quantity'],
            'ticket_price' => $ticketPrice,
            'total_amount' => $totalAmount,
            'notes' => $validated['notes'] ?? null,
            'status' => 'confirmed',
        ]);

        // Update ticket sold count
        if ($ticketType) {
            $ticketType->increment('quantity_sold', $validated['quantity']);
        }

        // Redirect based on payment option
        if ($totalAmount > 0 && $validated['payment_option'] === 'pay_now') {
            return redirect()->route('member.invoices.pay', $invoice->id)
                ->with('success', 'Registration successful! Please complete payment.');
        }

        $message = 'Successfully registered for ' . $event->name . '!';
        if ($invoice) {
            $message .= ' An invoice has been created for your registration.';
        }

        return redirect()->route('member.events')->with('success', $message);
    }

    public function requestYahrzeitChange(Request $request)
    {
        $user = $request->user();
        $member = $user->member;

        if (!$member) {
            return redirect()->route('dashboard')->with('error', 'No member profile found.');
        }

        $validated = $request->validate([
            'yahrzeit_id' => 'required|exists:yahrzeit,id',
            'message' => 'required|string|max:1000',
        ]);

        // Get the yahrzeit to include its details in the note
        $yahrzeit = Yahrzeit::find($validated['yahrzeit_id']);

        // Get the default admin user
        $defaultAdmin = User::getDefaultAdmin();

        if (!$defaultAdmin) {
            return back()->with('error', 'No default admin configured. Please contact support.');
        }

        // Create a note for the default admin
        Note::create([
            'name' => 'Yahrzeit Change Request',
            'note_text' => "Member: {$member->first_name} {$member->last_name}\n" .
                          "Yahrzeit: {$yahrzeit->name}" . ($yahrzeit->hebrew_name ? " ({$yahrzeit->hebrew_name})" : "") . "\n" .
                          "Date of Death: {$yahrzeit->date_of_death}\n\n" .
                          "Requested Change:\n{$validated['message']}",
            'user_id' => $defaultAdmin->id,
            'member_id' => $member->id,
            'item_scope' => 'Member',
            'priority' => 'Medium',
            'visibility' => 'Admin',
        ]);

        return back()->with('success', 'Your change request has been submitted to the administrator.');
    }
}
