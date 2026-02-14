<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRSVPRequest;
use App\Http\Requests\UpdateEventRSVPRequest;
use App\Models\EventRSVP;
use App\Models\Event;
use App\Services\ZoomService;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

#[Group(name: 'Synagogue Management')]
class EventRSVPController extends Controller
{
    protected ZoomService $zoomService;

    public function __construct(ZoomService $zoomService)
    {
        $this->zoomService = $zoomService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = EventRSVP::with(['event', 'member', 'ticketType'])
            ->orderBy('created_at', 'desc');

        if ($request->has('event_id')) {
            $query->where('event_id', $request->event_id);
        }

        return $query->paginate(50);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEventRSVPRequest $request)
    {
        $rsvp = EventRSVP::create($request->validated());

        // Load the event relationship
        $rsvp->load('event');

        // If event is online and has a Zoom meeting, register attendee
        if ($rsvp->event->online && $rsvp->event->zoom_meeting_id && $this->zoomService->isEnabled()) {
            $this->registerZoomAttendee($rsvp);
        }

        return response()->json($rsvp->load(['event', 'member', 'ticketType']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(EventRSVP $eventRSVP)
    {
        return $eventRSVP->load(['event', 'member', 'ticketType']);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEventRSVPRequest $request, EventRSVP $eventRSVP)
    {
        $eventRSVP->update($request->validated());

        return response()->json($eventRSVP->load(['event', 'member', 'ticketType']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EventRSVP $eventRSVP)
    {
        $eventRSVP->delete();

        return response()->json(['message' => 'RSVP deleted successfully']);
    }

    /**
     * Register an attendee with Zoom for the event.
     */
    protected function registerZoomAttendee(EventRSVP $rsvp): void
    {
        // Parse name into first and last name
        $nameParts = explode(' ', $rsvp->name, 2);
        $firstName = $nameParts[0] ?? '';
        $lastName = $nameParts[1] ?? '';

        $registrantData = [
            'email' => $rsvp->email,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'phone' => $rsvp->phone ?? '',
        ];

        $zoomRegistration = $this->zoomService->addRegistrant(
            $rsvp->event->zoom_meeting_id,
            $registrantData
        );

        if ($zoomRegistration) {
            Log::info("Zoom registrant added for RSVP {$rsvp->id}: {$zoomRegistration['registrant_id']}");
            
            // Optionally store the Zoom registrant ID (would need migration to add field)
            // $rsvp->zoom_registrant_id = $zoomRegistration['registrant_id'];
            // $rsvp->saveQuietly();
        }
    }
}
