<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Committee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommitteeController extends Controller
{
    /**
     * Display a listing of committees the authenticated member belongs to.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $member = $user->member;

        if (!$member) {
            return redirect()->route('member.dashboard')
                ->with('error', 'You must be associated with a member account to view committees.');
        }

        $committees = $member->committees()
            ->with(['members' => function ($query) {
                $query->orderBy('first_name');
            }])
            ->withCount('meetings')
            ->get()
            ->map(function ($committee) {
                // Get upcoming meetings count
                $upcomingMeetingsCount = $committee->meetings()
                    ->where('meeting_date', '>=', now())
                    ->count();
                
                $committee->upcoming_meetings_count = $upcomingMeetingsCount;
                return $committee;
            });

        return Inertia::render('member/committees/index', [
            'committees' => $committees,
            'member' => $member,
        ]);
    }

    /**
     * Display the specified committee.
     */
    public function show(Request $request, Committee $committee)
    {
        $user = $request->user();
        $member = $user->member;

        if (!$member) {
            return redirect()->route('member.dashboard')
                ->with('error', 'You must be associated with a member account.');
        }

        // Verify the member belongs to this committee
        if (!$committee->members()->where('members.id', $member->id)->exists()) {
            abort(403, 'You do not have access to this committee.');
        }

        // Load relationships
        $committee->load([
            'members' => function ($query) {
                $query->orderBy('first_name');
            },
        ]);

        // Get upcoming meetings
        $upcomingMeetings = $committee->meetings()
            ->where('meeting_date', '>=', now())
            ->orderBy('meeting_date', 'asc')
            ->get();

        // Get recent reports
        $reports = $committee->reports()
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('member/committees/show', [
            'committee' => $committee,
            'upcomingMeetings' => $upcomingMeetings,
            'reports' => $reports,
            'member' => $member,
        ]);
    }
}
