<?php

namespace App\Http\Controllers;

use App\Models\Calendar;
use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Dedoc\Scramble\Attributes\Group;

#[Group(name: 'Synagogue Management')]
class EventController extends Controller
{
    /**
     * Display a listing of events.
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $calendar = $request->get('calendar');
        $perPage = $request->get('per_page', 15);

        $query = Event::query()
            ->with(['calendar'])
            ->select([
                'id', 'calendar_id', 'name', 'description', 'event_start', 'event_end',
                'all_day', 'members_only', 'created_at', 'updated_at',
            ])
            ->orderBy('event_start', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($calendar) {
            $query->where('calendar_id', $calendar);
        }

        $events = $query->paginate($perPage)->through(function ($event) {
            return [
                'id' => $event->id,
                'title' => $event->name, // Map name to title for frontend
                'description' => $event->description,
                'start_date' => $event->event_start, // Map event_start to start_date for frontend
                'end_date' => $event->event_end, // Map event_end to end_date for frontend
                'all_day' => $event->all_day,
                'location' => null, // Field doesn't exist in model
                'members_only' => $event->members_only,
                'calendar' => $event->calendar,
                'created_at' => $event->created_at,
                'updated_at' => $event->updated_at,
            ];
        });
        $calendars = Calendar::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('events/index', [
            'events' => $events,
            'calendars' => $calendars,
            'filters' => [
                'search' => $search,
                'calendar' => $calendar,
            ],
        ]);
    }

    /**
     * Show the form for creating a new event.
     */
    public function create(Request $request)
    {
        $calendars = Calendar::select('id', 'name', 'members_only', 'public')
            ->orderBy('name')
            ->get();

        $selectedCalendar = $request->get('calendar');

        return Inertia::render('events/create', [
            'calendars' => $calendars,
            'selectedCalendar' => $selectedCalendar,
        ]);
    }

    /**
     * Store a newly created event in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'calendar_id' => 'required|exists:calendars,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'all_day' => 'boolean',
            'location' => 'nullable|string|max:255',
            'members_only' => 'boolean',
        ]);

        // Map frontend field names to model field names
        $eventData = [
            'calendar_id' => $validated['calendar_id'],
            'name' => $validated['title'],
            'description' => $validated['description'],
            'event_start' => $validated['start_date'],
            'event_end' => $validated['end_date'],
            'all_day' => $validated['all_day'],
            'members_only' => $validated['members_only'],
            // Note: location field doesn't exist in the model, so we skip it
        ];

        Event::create($eventData);

        return redirect('/admin/events')
            ->with('success', 'Event created successfully.');
    }

    /**
     * Display the specified event.
     */
    public function show(Event $event)
    {
        $event->load(['calendar', 'rsvps.member']);

        // Map database fields to frontend expected fields
        $eventData = [
            'id' => $event->id,
            'calendar_id' => $event->calendar_id,
            'title' => $event->name, // Map name to title
            'description' => $event->description,
            'start_date' => $event->event_start, // Map event_start to start_date
            'end_date' => $event->event_end, // Map event_end to end_date
            'all_day' => $event->all_day,
            'location' => $event->location,
            'members_only' => $event->members_only,
            'calendar' => $event->calendar,
            'created_at' => $event->created_at,
            'updated_at' => $event->updated_at,
            'rsvps' => $event->rsvps->map(function ($rsvp) {
                return [
                    'id' => $rsvp->id,
                    'name' => $rsvp->name,
                    'email' => $rsvp->email,
                    'phone' => $rsvp->phone,
                    'guests' => $rsvp->guests,
                    'status' => $rsvp->status,
                    'notes' => $rsvp->notes,
                    'created_at' => $rsvp->created_at,
                    'member' => $rsvp->member ? [
                        'id' => $rsvp->member->id,
                        'first_name' => $rsvp->member->first_name,
                        'last_name' => $rsvp->member->last_name,
                    ] : null,
                ];
            }),
        ];

        return Inertia::render('events/show', [
            'event' => $eventData,
        ]);
    }

    /**
     * Show the form for editing the specified event.
     */
    public function edit(Event $event)
    {
        $event->load(['calendar']);

        $calendars = Calendar::select('id', 'name', 'members_only', 'public')
            ->orderBy('name')
            ->get();

        // Map database fields to frontend expected fields
        $eventData = [
            'id' => $event->id,
            'calendar_id' => $event->calendar_id,
            'title' => $event->name, // Map name to title
            'description' => $event->description,
            'start_date' => $event->event_start, // Map event_start to start_date
            'end_date' => $event->event_end, // Map event_end to end_date
            'all_day' => $event->all_day,
            'location' => null, // Field doesn't exist in model
            'members_only' => $event->members_only,
        ];

        return Inertia::render('events/edit', [
            'event' => $eventData,
            'calendars' => $calendars,
        ]);
    }

    /**
     * Update the specified event in storage.
     */
    public function update(Request $request, Event $event)
    {
        $validated = $request->validate([
            'calendar_id' => 'required|exists:calendars,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'all_day' => 'boolean',
            'location' => 'nullable|string|max:255',
            'members_only' => 'boolean',
        ]);

        // Map frontend field names to model field names
        $eventData = [
            'calendar_id' => $validated['calendar_id'],
            'name' => $validated['title'],
            'description' => $validated['description'],
            'event_start' => $validated['start_date'],
            'event_end' => $validated['end_date'],
            'all_day' => $validated['all_day'],
            'members_only' => $validated['members_only'],
            // Note: location field doesn't exist in the model, so we skip it
        ];

        $event->update($eventData);

        return redirect('/admin/events')
            ->with('success', 'Event updated successfully.');
    }

    /**
     * Remove the specified event from storage.
     */
    public function destroy(Event $event)
    {
        $event->delete();

        return redirect('/admin/events')
            ->with('success', 'Event deleted successfully.');
    }

    /**
     * Get upcoming events within a date range.
     */
    public function upcoming(Request $request)
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        $query = Event::query()
            ->with(['calendar'])
            ->orderBy('event_start', 'asc');

        if ($startDate) {
            $query->where('event_start', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('event_start', '<=', $endDate);
        }

        $events = $query->get();

        return response()->json($events);
    }

    /**
     *  Get a paginated list of events
     *
     * @group Events
     *
     * @authenticated
     */
    public function apiIndex(Request $request)
    {
        $search = $request->get('search');
        $calendar = $request->get('calendar');
        $membersOnly = $request->get('members_only');
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $perPage = $request->get('per_page', 15);

        $query = Event::query()
            ->with(['calendar'])
            ->orderBy('event_start', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($calendar) {
            $query->where('calendar_id', $calendar);
        }

        if ($membersOnly !== null) {
            $query->where('members_only', $membersOnly);
        }

        if ($startDate) {
            $query->where('event_start', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('event_start', '<=', $endDate);
        }

        $events = $query->paginate($perPage);

        return response()->json($events);
    }

    /**
     *  Get a single event
     *
     * @group Events
     *
     * @authenticated
     */
    public function apiShow(Event $event)
    {
        $event->load(['calendar', 'rsvps.member', 'ticketTypes']);

        return response()->json([
            'data' => $event,
        ]);
    }

    /**
     *  Create a new event
     *
     * @group Events
     *
     * @authenticated
     */
    public function apiStore(Request $request)
    {
        $validated = $request->validate([
            'calendar_id' => 'required|exists:calendars,id',
            'name' => 'required|string|max:255',
            'tagline' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'event_start' => 'required|date',
            'event_end' => 'nullable|date|after_or_equal:event_start',
            'all_day' => 'boolean',
            'location' => 'nullable|string|max:255',
            'online' => 'boolean',
            'online_url' => 'nullable|url',
            'members_only' => 'boolean',
            'public' => 'boolean',
            'registration_required' => 'boolean',
            'registration_starts' => 'nullable|date',
            'registration_ends' => 'nullable|date',
            'maxrsvp' => 'nullable|integer|min:0',
            'allow_guests' => 'boolean',
            'max_guests' => 'nullable|integer|min:0',
        ]);

        $event = Event::create($validated);
        $event->load(['calendar', 'ticketTypes']);

        return response()->json([
            'data' => $event,
            'message' => 'Event created successfully.',
        ], 201);
    }

    /**
     *  Update an existing event
     *
     * @group Events
     *
     * @authenticated
     */
    public function apiUpdate(Request $request, Event $event)
    {
        $validated = $request->validate([
            'calendar_id' => 'sometimes|required|exists:calendars,id',
            'name' => 'sometimes|required|string|max:255',
            'tagline' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'event_start' => 'sometimes|required|date',
            'event_end' => 'nullable|date|after_or_equal:event_start',
            'all_day' => 'boolean',
            'location' => 'nullable|string|max:255',
            'online' => 'boolean',
            'online_url' => 'nullable|url',
            'members_only' => 'boolean',
            'public' => 'boolean',
            'registration_required' => 'boolean',
            'registration_starts' => 'nullable|date',
            'registration_ends' => 'nullable|date',
            'maxrsvp' => 'nullable|integer|min:0',
            'allow_guests' => 'boolean',
            'max_guests' => 'nullable|integer|min:0',
        ]);

        $event->update($validated);
        $event->load(['calendar', 'ticketTypes']);

        return response()->json([
            'data' => $event,
            'message' => 'Event updated successfully.',
        ]);
    }

    /**
     *  Delete an event
     *
     * @group Events
     *
     * @authenticated
     */
    public function apiDestroy(Event $event)
    {
        $event->delete();

        return response()->json([
            'message' => 'Event deleted successfully.',
        ]);
    }
}
