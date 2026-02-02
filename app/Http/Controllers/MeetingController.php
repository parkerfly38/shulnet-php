<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Models\Committee;
use App\Models\Board;
use App\Mail\MeetingInvitationMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class MeetingController extends Controller
{
    /**
     * Display a listing of meetings for a committee or board.
     */
    public function index(Request $request, string $type, int $id)
    {
        $meetable = $this->getMeetable($type, $id);

        $meetings = $meetable->meetings()
            ->orderBy('meeting_date', 'desc')
            ->get();

        return Inertia::render('admin/meetings/index', [
            'meetable' => $meetable,
            'meetableType' => $type,
            'meetings' => $meetings,
        ]);
    }

    /**
     * Show the form for creating a new meeting.
     */
    public function create(Request $request, string $type, int $id)
    {
        $meetable = $this->getMeetable($type, $id);

        return Inertia::render('admin/meetings/create', [
            'meetable' => $meetable,
            'meetableType' => $type,
        ]);
    }

    /**
     * Store a newly created meeting in storage.
     */
    public function store(Request $request, string $type, int $id)
    {
        $meetable = $this->getMeetable($type, $id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'agenda' => 'nullable|string',
            'meeting_date' => 'required|date',
            'meeting_link' => 'nullable|url|max:255',
        ]);

        $meeting = $meetable->meetings()->create($validated);

        return redirect()->route('meetings.show', [
            'type' => $type,
            'id' => $id,
            'meeting' => $meeting->id,
        ])->with('success', 'Meeting created successfully.');
    }

    /**
     * Display the specified meeting.
     */
    public function show(string $type, int $id, Meeting $meeting)
    {
        $meetable = $this->getMeetable($type, $id);

        $meeting->load('meetable');

        return Inertia::render('admin/meetings/show', [
            'meetable' => $meetable,
            'meetableType' => $type,
            'meeting' => $meeting,
        ]);
    }

    /**
     * Show the form for editing the specified meeting.
     */
    public function edit(string $type, int $id, Meeting $meeting)
    {
        $meetable = $this->getMeetable($type, $id);

        return Inertia::render('admin/meetings/edit', [
            'meetable' => $meetable,
            'meetableType' => $type,
            'meeting' => $meeting,
        ]);
    }

    /**
     * Update the specified meeting in storage.
     */
    public function update(Request $request, string $type, int $id, Meeting $meeting)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'agenda' => 'nullable|string',
            'meeting_date' => 'required|date',
            'meeting_link' => 'nullable|url|max:255',
            'minutes' => 'nullable|string',
        ]);

        $meeting->update($validated);

        return redirect()->route('meetings.show', [
            'type' => $type,
            'id' => $id,
            'meeting' => $meeting->id,
        ])->with('success', 'Meeting updated successfully.');
    }

    /**
     * Remove the specified meeting from storage.
     */
    public function destroy(string $type, int $id, Meeting $meeting)
    {
        $meeting->delete();

        return redirect()->route('meetings.index', [
            'type' => $type,
            'id' => $id,
        ])->with('success', 'Meeting deleted successfully.');
    }

    /**
     * Send meeting invitations to all active members.
     */
    public function sendInvitations(string $type, int $id, Meeting $meeting)
    {
        $meetable = $this->getMeetable($type, $id);
        
        $activeMembers = $meetable->activeMembers()->get();

        foreach ($activeMembers as $member) {
            if ($member->email) {
                Mail::to($member->email)->send(new MeetingInvitationMail($meeting, $member));
            }
        }

        return redirect()->route('meetings.show', [
            'type' => $type,
            'id' => $id,
            'meeting' => $meeting->id,
        ])->with('success', "Invitations sent to {$activeMembers->count()} members.");
    }

    /**
     * Get the meetable model (Committee or Board).
     */
    private function getMeetable(string $type, int $id)
    {
        return match ($type) {
            'committee' => Committee::with(['activeMembers'])->findOrFail($id),
            'board' => Board::with(['activeMembers'])->findOrFail($id),
            default => abort(404, 'Invalid type'),
        };
    }
}
