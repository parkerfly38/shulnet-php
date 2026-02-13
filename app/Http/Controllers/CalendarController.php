<?php

namespace App\Http\Controllers;

use App\Models\Calendar;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Dedoc\Scramble\Attributes\Group;

#[Group('Synagogue Management')]

class CalendarController extends Controller
{
    /**
     * Display a listing of calendars.
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $perPage = $request->get('per_page', 15);

        $query = Calendar::query()
            ->select([
                'id', 'name', 'members_only', 'public',
                'created_at', 'updated_at',
            ])
            ->orderBy('name');

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $calendars = $query->paginate($perPage);

        return Inertia::render('calendars/index', [
            'calendars' => $calendars,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new calendar.
     */
    public function create()
    {
        return Inertia::render('calendars/create');
    }

    /**
     * Store a newly created calendar in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'members_only' => 'boolean',
            'public' => 'boolean',
        ]);

        Calendar::create($validated);

        return redirect('/admin/calendars')
            ->with('success', 'Calendar created successfully.');
    }

    /**
     * Display the specified calendar.
     */
    public function show(Calendar $calendar)
    {
        return Inertia::render('calendars/show', [
            'calendar' => $calendar,
        ]);
    }

    /**
     * Show the form for editing the specified calendar.
     */
    public function edit(Calendar $calendar)
    {
        return Inertia::render('calendars/edit', [
            'calendar' => $calendar,
        ]);
    }

    /**
     * Update the specified calendar in storage.
     */
    public function update(Request $request, Calendar $calendar)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'members_only' => 'boolean',
            'public' => 'boolean',
        ]);

        $calendar->update($validated);

        return redirect('/admin/calendars')
            ->with('success', 'Calendar updated successfully.');
    }

    /**
     * Remove the specified calendar from storage.
     */
    public function destroy(Calendar $calendar)
    {
        $calendar->delete();

        return redirect('/admin/calendars')
            ->with('success', 'Calendar deleted successfully.');
    }

    /**
     *  Get a paginated list of calendars
     *
     * @group Calendars
     *
     * @authenticated
     */
    public function apiIndex(Request $request)
    {
        $search = $request->get('search');
        $membersOnly = $request->get('members_only');
        $public = $request->get('public');
        $perPage = $request->get('per_page', 15);

        $query = Calendar::query()
            ->withCount('events')
            ->orderBy('name');

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($membersOnly !== null) {
            $query->where('members_only', $membersOnly);
        }

        if ($public !== null) {
            $query->where('public', $public);
        }

        $calendars = $query->paginate($perPage);

        return response()->json($calendars);
    }

    /**
     *  Get a single calendar
     *
     * @group Calendars
     *
     * @authenticated
     */
    public function apiShow(Calendar $calendar)
    {
        $calendar->loadCount('events');

        return response()->json([
            'data' => $calendar,
        ]);
    }

    /**
     *  Create a new calendar
     *
     * @group Calendars
     *
     * @authenticated
     */
    public function apiStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'members_only' => 'boolean',
            'public' => 'boolean',
        ]);

        $calendar = Calendar::create($validated);
        $calendar->loadCount('events');

        return response()->json([
            'data' => $calendar,
            'message' => 'Calendar created successfully.',
        ], 201);
    }

    /**
     *  Update an existing calendar
     *
     * @group Calendars
     *
     * @authenticated
     */
    public function apiUpdate(Request $request, Calendar $calendar)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'members_only' => 'boolean',
            'public' => 'boolean',
        ]);

        $calendar->update($validated);
        $calendar->loadCount('events');

        return response()->json([
            'data' => $calendar,
            'message' => 'Calendar updated successfully.',
        ]);
    }

    /**
     *  Delete a calendar
     *
     * @group Calendars
     *
     * @authenticated
     */
    public function apiDestroy(Calendar $calendar)
    {
        // Check if calendar has events
        if ($calendar->events()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete calendar with existing events.',
            ], 422);
        }

        $calendar->delete();

        return response()->json([
            'message' => 'Calendar deleted successfully.',
        ]);
    }
}
