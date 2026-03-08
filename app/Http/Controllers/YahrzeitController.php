<?php

namespace App\Http\Controllers;

use App\Imports\YahrzeitsImport;
use App\Mail\YahrzeitReminderMail;
use App\Models\Member;
use App\Models\Yahrzeit;
use App\Services\HebrewCalendarService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Dedoc\Scramble\Attributes\Group;

#[Group('Synagogue Management')]
class YahrzeitController extends Controller
{
    protected HebrewCalendarService $hebrewCalendar;

    public function __construct(HebrewCalendarService $hebrewCalendar)
    {
        $this->hebrewCalendar = $hebrewCalendar;
    }

    /**
     * Display a listing of yahrzeits.
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $perPage = $request->get('per_page', 15);

        $query = Yahrzeit::query()
            ->with(['members' => function ($query) {
                $query->select(['members.id', 'first_name', 'last_name', 'hebrew_name'])
                    ->withPivot('relationship');
            }])
            ->select([
                'id', 'name', 'hebrew_name', 'date_of_death',
                'hebrew_day_of_death', 'hebrew_month_of_death', 'hebrew_year_of_death',
                'observance_type', 'notes', 'created_at', 'updated_at',
            ])
            ->orderBy('hebrew_month_of_death')
            ->orderBy('hebrew_day_of_death')
            ->orderBy('name');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('hebrew_name', 'like', "%{$search}%")
                    ->orWhereHas('members', function ($memberQuery) use ($search) {
                        $memberQuery->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('hebrew_name', 'like', "%{$search}%")
                            ->orWhere('member_yahrzeit.relationship', 'like', "%{$search}%");
                    });
            });
        }

        $yahrzeits = $query->paginate($perPage);
        
        // Calculate next observance date for each yahrzeit
        $yahrzeits->getCollection()->transform(function ($yahrzeit) {
            try {
                if ($yahrzeit->hebrew_day_of_death && $yahrzeit->hebrew_month_of_death) {
                    $yahrzeit->next_observance_date = $this->hebrewCalendar->getNextYahrzeitDate(
                        $yahrzeit->hebrew_day_of_death,
                        $yahrzeit->hebrew_month_of_death
                    );
                } else {
                    $yahrzeit->next_observance_date = null;
                }
            } catch (\Exception $e) {
                // If calculation fails, set to null
                $yahrzeit->next_observance_date = null;
            }
            return $yahrzeit;
        });

        return Inertia::render('yahrzeits/index', [
            'yahrzeits' => $yahrzeits,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new yahrzeit.
     */
    public function create()
    {
        $members = Member::select('id', 'first_name', 'last_name', 'hebrew_name')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        return Inertia::render('yahrzeits/create', [
            'members' => $members,
        ]);
    }

    /**
     * Store a newly created yahrzeit in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'hebrew_name' => 'nullable|string|max:255',
            'date_of_death' => 'required|date',
            'observance_type' => 'required|string|in:standard,kaddish,memorial_candle,other',
            'notes' => 'nullable|string|max:1000',
            'members' => 'required|array|min:1',
            'members.*.member_id' => 'required|exists:members,id',
            'members.*.relationship' => 'required|string|max:100',
        ]);

        // Convert Gregorian date to Hebrew calendar
        $hebrewDate = $this->hebrewCalendar->gregorianToHebrew($validated['date_of_death']);

        // Create the yahrzeit
        $yahrzeit = Yahrzeit::create([
            'name' => $validated['name'],
            'hebrew_name' => $validated['hebrew_name'],
            'date_of_death' => $validated['date_of_death'],
            'hebrew_day_of_death' => $hebrewDate['day'],
            'hebrew_month_of_death' => $hebrewDate['month'],
            'observance_type' => $validated['observance_type'],
            'notes' => $validated['notes'],
        ]);

        // Attach members with their relationships
        foreach ($validated['members'] as $memberData) {
            $yahrzeit->members()->attach($memberData['member_id'], [
                'relationship' => $memberData['relationship'],
            ]);
        }

        return redirect('/admin/yahrzeits')
            ->with('success', 'Yahrzeit created successfully.');
    }

    /**
     * Display the specified yahrzeit.
     */
    public function show(Yahrzeit $yahrzeit)
    {
        $yahrzeit->load(['members' => function ($query) {
            $query->select(['members.id', 'first_name', 'last_name', 'hebrew_name'])
                ->withPivot('relationship');
        }]);

        // Calculate next and previous observance dates
        try {
            if ($yahrzeit->hebrew_day_of_death && $yahrzeit->hebrew_month_of_death) {
                $yahrzeit->next_observance_date = $this->hebrewCalendar->getNextYahrzeitDate(
                    $yahrzeit->hebrew_day_of_death,
                    $yahrzeit->hebrew_month_of_death
                );
                $yahrzeit->previous_observance_date = $this->hebrewCalendar->getPreviousYahrzeitDate(
                    $yahrzeit->hebrew_day_of_death,
                    $yahrzeit->hebrew_month_of_death
                );
            } else {
                $yahrzeit->next_observance_date = null;
                $yahrzeit->previous_observance_date = null;
            }
        } catch (\Exception $e) {
            $yahrzeit->next_observance_date = null;
            $yahrzeit->previous_observance_date = null;
        }

        return Inertia::render('yahrzeits/show', [
            'yahrzeit' => $yahrzeit,
        ]);
    }

    /**
     * Show the form for editing the specified yahrzeit.
     */
    public function edit(Yahrzeit $yahrzeit)
    {
        $yahrzeit->load(['members' => function ($query) {
            $query->select(['members.id', 'first_name', 'last_name', 'middle_name', 'hebrew_name'])
                ->withPivot('relationship');
        }]);

        $members = Member::select('id', 'first_name', 'last_name', 'hebrew_name')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        return Inertia::render('yahrzeits/edit', [
            'yahrzeit' => [
                'id' => $yahrzeit->id,
                'members' => $yahrzeit->members->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'first_name' => $member->first_name,
                        'last_name' => $member->last_name,
                        'middle_name' => $member->middle_name,
                        'hebrew_name' => $member->hebrew_name,
                        'pivot' => [
                            'relationship' => $member->pivot->relationship,
                        ],
                    ];
                }),
                'name' => $yahrzeit->name,
                'hebrew_name' => $yahrzeit->hebrew_name,
                'date_of_death' => $yahrzeit->date_of_death?->format('Y-m-d'),
                'hebrew_day_of_death' => $yahrzeit->hebrew_day_of_death,
                'hebrew_month_of_death' => $yahrzeit->hebrew_month_of_death,
                'observance_type' => $yahrzeit->observance_type,
                'notes' => $yahrzeit->notes,
            ],
            'members' => $members,
        ]);
    }

    /**
     * Update the specified yahrzeit in storage.
     */
    public function update(Request $request, Yahrzeit $yahrzeit)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'hebrew_name' => 'nullable|string|max:255',
            'date_of_death' => 'required|date',
            'observance_type' => 'required|string|in:standard,kaddish,memorial_candle,other',
            'notes' => 'nullable|string|max:1000',
            'members' => 'required|array|min:1',
            'members.*.member_id' => 'required|exists:members,id',
            'members.*.relationship' => 'required|string|max:100',
        ]);

        // Convert Gregorian date to Hebrew calendar
        $hebrewDate = $this->hebrewCalendar->gregorianToHebrew($validated['date_of_death']);

        // Update the yahrzeit
        $yahrzeit->update([
            'name' => $validated['name'],
            'hebrew_name' => $validated['hebrew_name'],
            'date_of_death' => $validated['date_of_death'],
            'hebrew_day_of_death' => $hebrewDate['day'],
            'hebrew_month_of_death' => $hebrewDate['month'],
            'observance_type' => $validated['observance_type'],
            'notes' => $validated['notes'],
        ]);

        // Sync members with their relationships
        $syncData = [];
        foreach ($validated['members'] as $memberData) {
            $syncData[$memberData['member_id']] = [
                'relationship' => $memberData['relationship'],
            ];
        }
        $yahrzeit->members()->sync($syncData);

        return redirect('/admin/yahrzeits')
            ->with('success', 'Yahrzeit updated successfully.');
    }

    /**
     * Remove the specified yahrzeit from storage.
     */
    public function destroy(Yahrzeit $yahrzeit)
    {
        // The pivot table entries will be deleted automatically due to cascade
        $yahrzeit->delete();

        return redirect('/admin/yahrzeits')
            ->with('success', 'Yahrzeit deleted successfully.');
    }

    /**
     * API endpoint for yahrzeit search autocomplete.
     */
    public function search(Request $request)
    {
        $search = $request->get('q');
        $limit = $request->get('limit', 10);

        $yahrzeits = Yahrzeit::query()
            ->with(['members' => function ($query) {
                $query->select(['members.id', 'first_name', 'last_name', 'hebrew_name'])
                    ->withPivot('relationship');
            }])
            ->select(['id', 'name', 'hebrew_name', 'date_of_death'])
            ->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('hebrew_name', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->limit($limit)
            ->get();

        return response()->json($yahrzeits);
    }

    /**
     * Import yahrzeits from CSV/Excel file
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240',
        ]);

        // Increase time and memory limits for large imports
        set_time_limit(300); // 5 minutes
        ini_set('memory_limit', '512M');

        try {
            $import = new YahrzeitsImport($this->hebrewCalendar);
            Excel::import($import, $request->file('file'));

            $errors = $import->getErrors();

            return redirect()->route('yahrzeits.index')->with([
                'success' => sprintf(
                    'Import completed! %d yahrzeits imported, %d updated.',
                    $import->getImported(),
                    $import->getUpdated()
                ),
                'import_errors' => $errors,
            ]);
        } catch (\Exception $e) {
            return redirect()->route('yahrzeits.index')->with('error', 'Import failed: '.$e->getMessage());
        }
    }

    /**
     * Download a sample CSV template for importing yahrzeits
     */
    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="yahrzeits-import-template.csv"',
        ];

        $columns = ['name', 'hebrew_name', 'date_of_death', 'hebrew_day_of_death', 'hebrew_month_of_death', 'hebrew_year_of_death', 'observance_type', 'notes'];

        $callback = function () use ($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            // Add comment row with field requirements
            fputcsv($file, [
                'REQUIRED',
                'Optional',
                'Optional (YYYY-MM-DD) - Required if Hebrew dates not provided',
                'Optional (1-30) - Required if date_of_death not provided',
                'Optional (1-13 or name like Tishrei, Adar I, Adar II) - Required if date_of_death not provided',
                'Optional (e.g. 5780)',
                'Optional (standard/kaddish/memorial_candle/other)',
                'Optional',
            ]);

            // Add sample row
            fputcsv($file, [
                'John Doe',
                'יוחנן בן דוד',
                '2020-01-15',
                '20',
                'Tevet',
                '5780',
                'standard',
                'Optional notes about the deceased',
            ]);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Prepare yahrzeit reminder data with family members and calculated date
     */
    public function prepareReminder(Yahrzeit $yahrzeit)
    {
        $yahrzeit->load('members');

        // Calculate Gregorian date for current Hebrew year
        $hebrewCalendarService = app(\App\Services\HebrewCalendarService::class);
        $gregorianDate = $hebrewCalendarService->getGregorianDateForCurrentYear(
            $yahrzeit->hebrew_day_of_death,
            $yahrzeit->hebrew_month_of_death
        );

        return response()->json([
            'family_members' => $yahrzeit->members,
            'gregorian_date' => $gregorianDate,
        ]);
    }

    /**
     * Send yahrzeit reminder email to family members
     */
    public function sendReminder(Request $request, Yahrzeit $yahrzeit)
    {
        $validated = $request->validate([
            'recipient_email' => 'required|email',
            'recipient_name' => 'required|string',
            'gregorian_date' => 'required|string',
        ]);

        try {
            Mail::to($validated['recipient_email'])->send(
                new YahrzeitReminderMail(
                    $yahrzeit,
                    $validated['gregorian_date'],
                    $validated['recipient_name']
                )
            );

            return back()->with('success', 'Yahrzeit reminder sent to '.$validated['recipient_email']);
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to send reminder: '.$e->getMessage());
        }
    }

    /**
     * Print yahrzeit reminder letter
     */
    public function printReminder(Yahrzeit $yahrzeit, Request $request)
    {
        $validated = $request->validate([
            'member_ids' => 'required|string',
            'gregorian_date' => 'required|string',
        ]);

        $memberIds = explode(',', $validated['member_ids']);

        // Load the selected members
        $yahrzeit->load(['members' => function ($query) use ($memberIds) {
            $query->whereIn('members.id', $memberIds)->withPivot('relationship');
        }]);

        return view('yahrzeits.print-reminder', [
            'yahrzeit' => $yahrzeit,
            'members' => $yahrzeit->members,
            'gregorianDate' => $validated['gregorian_date'],
        ]);
    }

    /**
     * Prepare monthly yahrzeit letters data
     */
    public function prepareMonthlyLetters(Request $request)
    {
        // Get current Hebrew month as default
        $currentHebrewDate = $this->hebrewCalendar->getCurrentHebrewDate();
        
        // Allow month to be specified, default to current month
        $selectedMonth = $request->get('month', $currentHebrewDate['month']);

        // Get all yahrzeits for the selected Hebrew month
        $yahrzeits = Yahrzeit::where('hebrew_month_of_death', $selectedMonth)
            ->with(['members' => function ($query) {
                $query->withPivot('relationship');
            }])
            ->orderBy('hebrew_day_of_death')
            ->get();

        // Prepare data with Gregorian dates
        $yahrzeitsData = $yahrzeits->map(function ($yahrzeit) {
            $gregorianDate = $this->hebrewCalendar->getGregorianDateForCurrentYear(
                $yahrzeit->hebrew_day_of_death,
                $yahrzeit->hebrew_month_of_death
            );

            return [
                'id' => $yahrzeit->id,
                'name' => $yahrzeit->name,
                'hebrew_name' => $yahrzeit->hebrew_name,
                'hebrew_day_of_death' => $yahrzeit->hebrew_day_of_death,
                'hebrew_month_of_death' => $yahrzeit->hebrew_month_of_death,
                'date_of_death' => $yahrzeit->date_of_death,
                'observance_type' => $yahrzeit->observance_type,
                'notes' => $yahrzeit->notes,
                'gregorian_date' => $gregorianDate,
                'members' => $yahrzeit->members->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'first_name' => $member->first_name,
                        'last_name' => $member->last_name,
                        'email' => $member->email,
                        'relationship' => $member->pivot->relationship,
                    ];
                }),
            ];
        });

        return response()->json([
            'yahrzeits' => $yahrzeitsData,
            'hebrew_month' => $selectedMonth,
            'hebrew_date' => $currentHebrewDate,
        ]);
    }

    /**
     * Send monthly yahrzeit reminder emails
     */
    public function sendMonthlyReminders(Request $request)
    {
        $validated = $request->validate([
            'yahrzeit_ids' => 'required|array',
            'yahrzeit_ids.*' => 'exists:yahrzeit,id',
            'month' => 'nullable|integer|min:1|max:12',
        ]);

        $successCount = 0;
        $failedCount = 0;
        $errors = [];

        foreach ($validated['yahrzeit_ids'] as $yahrzeitId) {
            $yahrzeit = Yahrzeit::with('members')->find($yahrzeitId);

            if (!$yahrzeit) {
                continue;
            }

            // Calculate Gregorian date
            $gregorianDate = $this->hebrewCalendar->getGregorianDateForCurrentYear(
                $yahrzeit->hebrew_day_of_death,
                $yahrzeit->hebrew_month_of_death
            );

            // Send email to each member with an email address
            foreach ($yahrzeit->members as $member) {
                if ($member->email) {
                    try {
                        Mail::to($member->email)->send(
                            new YahrzeitReminderMail(
                                $yahrzeit,
                                $gregorianDate,
                                $member->first_name.' '.$member->last_name
                            )
                        );
                        $successCount++;
                    } catch (\Exception $e) {
                        $failedCount++;
                        $errors[] = "Failed to send to {$member->email}: {$e->getMessage()}";
                    }
                }
            }
        }

        if ($failedCount > 0) {
            return back()->with('warning', "Sent {$successCount} emails. {$failedCount} failed. ".implode(' ', $errors));
        }

        return back()->with('success', "Successfully sent {$successCount} yahrzeit reminder emails.");
    }

    /**
     * Print monthly yahrzeit letters (all in one PDF)
     */
    public function printMonthlyLetters(Request $request)
    {
        $validated = $request->validate([
            'yahrzeit_ids' => 'required|array',
            'yahrzeit_ids.*' => 'exists:yahrzeit,id',
            'month' => 'nullable|integer|min:1|max:12',
        ]);

        // Get Hebrew month for the title
        $currentHebrewDate = $this->hebrewCalendar->getCurrentHebrewDate();
        $selectedMonth = $validated['month'] ?? $currentHebrewDate['month'];
        
        $hebrewMonthNames = [
            1 => 'Tishrei', 2 => 'Cheshvan', 3 => 'Kislev', 4 => 'Tevet',
            5 => 'Shevat', 6 => 'Adar', 7 => 'Nisan', 8 => 'Iyar',
            9 => 'Sivan', 10 => 'Tammuz', 11 => 'Av', 12 => 'Elul'
        ];

        // Get all yahrzeits with their members
        $yahrzeits = Yahrzeit::whereIn('id', $validated['yahrzeit_ids'])
            ->with(['members' => function ($query) {
                $query->withPivot('relationship');
            }])
            ->orderBy('hebrew_day_of_death')
            ->get();

        // Prepare data with Gregorian dates
        $lettersData = [];

        foreach ($yahrzeits as $yahrzeit) {
            $gregorianDate = $this->hebrewCalendar->getGregorianDateForCurrentYear(
                $yahrzeit->hebrew_day_of_death,
                $yahrzeit->hebrew_month_of_death
            );

            foreach ($yahrzeit->members as $member) {
                $lettersData[] = [
                    'member' => $member,
                    'yahrzeit' => $yahrzeit,
                    'gregorianDate' => $gregorianDate,
                ];
            }
        }

        return view('yahrzeits.print-monthly-letters', [
            'lettersData' => $lettersData,
            'hebrewMonth' => $hebrewMonthNames[$selectedMonth] ?? 'Unknown',
        ]);
    }
}
