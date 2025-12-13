<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCalendarRequest;
use App\Http\Requests\UpdateCalendarRequest;
use App\Models\Calendar;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
                'created_at', 'updated_at'
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
            ]
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
            'calendar' => $calendar
        ]);
    }

    /**
     * Show the form for editing the specified calendar.
     */
    public function edit(Calendar $calendar)
    {
        return Inertia::render('calendars/edit', [
            'calendar' => $calendar
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
}
