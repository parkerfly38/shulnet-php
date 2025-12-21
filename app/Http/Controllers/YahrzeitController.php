<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Yahrzeit;
use App\Services\HebrewCalendarService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

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
                'hebrew_day_of_death', 'hebrew_month_of_death', 'observance_type',
                'notes', 'created_at', 'updated_at'
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

        return Inertia::render('yahrzeits/index', [
            'yahrzeits' => $yahrzeits,
            'filters' => [
                'search' => $search,
            ]
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
            'members' => $members
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
                'relationship' => $memberData['relationship']
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
        
        return Inertia::render('yahrzeits/show', [
            'yahrzeit' => $yahrzeit
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
                'date_of_death' => $yahrzeit->date_of_death->format('Y-m-d'),
                'hebrew_day_of_death' => $yahrzeit->hebrew_day_of_death,
                'hebrew_month_of_death' => $yahrzeit->hebrew_month_of_death,
                'observance_type' => $yahrzeit->observance_type,
                'notes' => $yahrzeit->notes,
            ],
            'members' => $members
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
                'relationship' => $memberData['relationship']
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
}
