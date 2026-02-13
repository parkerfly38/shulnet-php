<?php

namespace App\Observers;

use App\Models\Event;
use App\Services\ZoomService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class EventObserver
{
    protected ZoomService $zoomService;

    public function __construct(ZoomService $zoomService)
    {
        $this->zoomService = $zoomService;
    }

    /**
     * Handle the Event "created" event.
     */
    public function created(Event $event): void
    {
        // If event is online and Zoom is enabled, create Zoom meeting
        if ($event->online && $this->zoomService->isEnabled()) {
            $this->createZoomMeeting($event);
        }
    }

    /**
     * Handle the Event "updated" event.
     */
    public function updated(Event $event): void
    {
        // Check if online status changed or if dates/title changed for existing Zoom meeting
        if ($event->wasChanged('online')) {
            if ($event->online && $this->zoomService->isEnabled() && !$event->zoom_meeting_id) {
                // Event became online, create Zoom meeting
                $this->createZoomMeeting($event);
            } elseif (!$event->online && $event->zoom_meeting_id) {
                // Event became offline, delete Zoom meeting
                $this->deleteZoomMeeting($event);
            }
        } elseif ($event->online && $event->zoom_meeting_id && $this->zoomService->isEnabled()) {
            // Update existing Zoom meeting if relevant fields changed
            if ($event->wasChanged(['name', 'event_start', 'event_end', 'description'])) {
                $this->updateZoomMeeting($event);
            }
        }
    }

    /**
     * Handle the Event "deleting" event.
     */
    public function deleting(Event $event): void
    {
        // Delete associated Zoom meeting if it exists
        if ($event->zoom_meeting_id && $this->zoomService->isEnabled()) {
            $this->deleteZoomMeeting($event);
        }
    }

    /**
     * Create a Zoom meeting for the event.
     */
    protected function createZoomMeeting(Event $event): void
    {
        $startTime = Carbon::parse($event->event_start);
        $endTime = $event->event_end ? Carbon::parse($event->event_end) : $startTime->copy()->addHour();
        
        $meetingData = [
            'topic' => $event->name,
            'start_time' => $startTime->toIso8601String(),
            'duration' => $this->zoomService->calculateDuration($startTime, $endTime),
            'agenda' => $event->description ?? '',
            'registration_required' => $event->registration_required ?? false,
        ];

        $zoomMeeting = $this->zoomService->createMeeting($meetingData);

        if ($zoomMeeting) {
            $event->zoom_meeting_id = $zoomMeeting['meeting_id'];
            $event->zoom_join_url = $zoomMeeting['join_url'];
            $event->zoom_start_url = $zoomMeeting['start_url'];
            $event->zoom_password = $zoomMeeting['password'];
            $event->zoom_registration_url = $zoomMeeting['registration_url'];
            $event->online_url = $zoomMeeting['join_url']; // Also set the online_url
            
            // Save without triggering events to avoid recursion
            $event->saveQuietly();
            
            Log::info("Zoom meeting created for event {$event->id}: {$zoomMeeting['meeting_id']}");
        }
    }

    /**
     * Update an existing Zoom meeting.
     */
    protected function updateZoomMeeting(Event $event): void
    {
        $startTime = Carbon::parse($event->event_start);
        $endTime = $event->event_end ? Carbon::parse($event->event_end) : $startTime->copy()->addHour();
        
        $meetingData = [
            'topic' => $event->name,
            'start_time' => $startTime->toIso8601String(),
            'duration' => $this->zoomService->calculateDuration($startTime, $endTime),
            'agenda' => $event->description ?? '',
        ];

        $success = $this->zoomService->updateMeeting($event->zoom_meeting_id, $meetingData);
        
        if ($success) {
            Log::info("Zoom meeting updated for event {$event->id}: {$event->zoom_meeting_id}");
        }
    }

    /**
     * Delete the Zoom meeting.
     */
    protected function deleteZoomMeeting(Event $event): void
    {
        $success = $this->zoomService->deleteMeeting($event->zoom_meeting_id);
        
        if ($success) {
            Log::info("Zoom meeting deleted for event {$event->id}: {$event->zoom_meeting_id}");
            
            // Clear Zoom fields without triggering events
            $event->zoom_meeting_id = null;
            $event->zoom_join_url = null;
            $event->zoom_start_url = null;
            $event->zoom_password = null;
            $event->zoom_registration_url = null;
            $event->saveQuietly();
        }
    }
}
