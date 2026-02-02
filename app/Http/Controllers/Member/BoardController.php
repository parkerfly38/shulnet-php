<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Board;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BoardController extends Controller
{
    /**
     * Display a listing of boards the authenticated member belongs to.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $member = $user->member;

        if (!$member) {
            return redirect()->route('member.dashboard')
                ->with('error', 'You must be associated with a member account to view boards.');
        }

        $boards = $member->boards()
            ->with(['members' => function ($query) {
                $query->orderBy('first_name');
            }])
            ->withCount('meetings')
            ->get()
            ->map(function ($board) {
                // Get upcoming meetings count
                $upcomingMeetingsCount = $board->meetings()
                    ->where('meeting_date', '>=', now())
                    ->count();
                
                $board->upcoming_meetings_count = $upcomingMeetingsCount;
                return $board;
            });

        return Inertia::render('member/boards/index', [
            'boards' => $boards,
            'member' => $member,
        ]);
    }

    /**
     * Display the specified board.
     */
    public function show(Request $request, Board $board)
    {
        $user = $request->user();
        $member = $user->member;

        if (!$member) {
            return redirect()->route('member.dashboard')
                ->with('error', 'You must be associated with a member account.');
        }

        // Verify the member belongs to this board
        if (!$board->members()->where('members.id', $member->id)->exists()) {
            abort(403, 'You do not have access to this board.');
        }

        // Load relationships
        $board->load([
            'members' => function ($query) {
                $query->orderBy('first_name');
            },
        ]);

        // Get upcoming meetings
        $upcomingMeetings = $board->meetings()
            ->where('meeting_date', '>=', now())
            ->orderBy('meeting_date', 'asc')
            ->get();

        // Get recent reports
        $reports = $board->reports()
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('member/boards/show', [
            'board' => $board,
            'upcomingMeetings' => $upcomingMeetings,
            'reports' => $reports,
            'member' => $member,
        ]);
    }
}
