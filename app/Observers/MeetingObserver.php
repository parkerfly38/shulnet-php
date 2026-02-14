<?php

namespace App\Observers;

use App\Models\Meeting;
use App\Services\ZoomService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class MeetingObserver
{
    protected ZoomService $zoomService;

    public function __construct(ZoomService $zoomService)
    {
        $this->zoomService = $zoomService;
    }

    /**
     * Handle the Meeting "created" event.
     */
    public function created(Meeting $meeting): void
    {
        // If meeting has a meeting_link that doesn't start with https://zoom.us and Zoom is enabled
        // we'll create a Zoom meeting. Or if meeting_link is empty and Zoom is enabled.
        if ($this->shouldCreateZoomMeeting($meeting)) {
            $this->createZoomMeeting($meeting);
        }
    }

    /**
     * Handle the Meeting "updated" event.
     */
    public function updated(Meeting $meeting): void
    {
        if ($meeting->zoom_meeting_id && $this->zoomService->isEnabled()) {
            // Update existing Zoom meeting if relevant fields changed
            if ($meeting->wasChanged(['title', 'meeting_date', 'agenda'])) {
                $this->updateZoomMeeting($meeting);
            }
        } elseif ($this->shouldCreateZoomMeeting($meeting) && !$meeting->zoom_meeting_id) {
            // Create Zoom meeting if conditions are now met
            $this->createZoomMeeting($meeting);
        }
    }

    /**
     * Handle the Meeting "deleting" event.
     */
    public function deleting(Meeting $meeting): void
    {
        // Delete associated Zoom meeting if it exists
        if ($meeting->zoom_meeting_id && $this->zoomService->isEnabled()) {
            $this->deleteZoomMeeting($meeting);
        }
    }

    /**
     * Determine if a Zoom meeting should be created.
     */
    protected function shouldCreateZoomMeeting(Meeting $meeting): bool
    {
        if (!$this->zoomService->isEnabled()) {
            return false;
        }

        // Create Zoom meeting if:
        // 1. No meeting_link is set, OR
        // 2. meeting_link is set but doesn't already contain a Zoom URL
        return empty($meeting->meeting_link) || 
               !str_contains($meeting->meeting_link, 'zoom.us');
    }

    /**
     * Create a Zoom meeting.
     */
    protected function createZoomMeeting(Meeting $meeting): void
    {
        $meetingDate = Carbon::parse($meeting->meeting_date);
        
        $meetingData = [
            'topic' => $meeting->title,
            'start_time' => $meetingDate->toIso8601String(),
            'duration' => 60, // Default 1 hour for board/committee meetings
            'agenda' => $meeting->agenda ?? '',
            'registration_required' => false,
        ];

        $zoomMeeting = $this->zoomService->createMeeting($meetingData);

        if ($zoomMeeting) {
            $meeting->zoom_meeting_id = $zoomMeeting['meeting_id'];
            $meeting->zoom_join_url = $zoomMeeting['join_url'];
            $meeting->zoom_start_url = $zoomMeeting['start_url'];
            $meeting->zoom_password = $zoomMeeting['password'];
            $meeting->meeting_link = $zoomMeeting['join_url']; // Also set the meeting_link
            
            // Save without triggering events to avoid recursion
            $meeting->saveQuietly();
            
            Log::info("Zoom meeting created for meeting {$meeting->id}: {$zoomMeeting['meeting_id']}");
        }
    }

    /**
     * Update an existing Zoom meeting.
     */
    protected function updateZoomMeeting(Meeting $meeting): void
    {
        $meetingDate = Carbon::parse($meeting->meeting_date);
        
        $meetingData = [
            'topic' => $meeting->title,
            'start_time' => $meetingDate->toIso8601String(),
            'duration' => 60,
            'agenda' => $meeting->agenda ?? '',
        ];

        $success = $this->zoomService->updateMeeting($meeting->zoom_meeting_id, $meetingData);
        
        if ($success) {
            Log::info("Zoom meeting updated for meeting {$meeting->id}: {$meeting->zoom_meeting_id}");
        }
    }

    /**
     * Delete the Zoom meeting.
     */
    protected function deleteZoomMeeting(Meeting $meeting): void
    {
        $success = $this->zoomService->deleteMeeting($meeting->zoom_meeting_id);
        
        if ($success) {
            Log::info("Zoom meeting deleted for meeting {$meeting->id}: {$meeting->zoom_meeting_id}");
            
            // Clear Zoom fields without triggering events
            $meeting->zoom_meeting_id = null;
            $meeting->zoom_join_url = null;
            $meeting->zoom_start_url = null;
            $meeting->zoom_password = null;
            $meeting->saveQuietly();
        }
    }
}
