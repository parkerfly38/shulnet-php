<?php

namespace App\Http\Controllers;

use App\Models\Committee;
use App\Models\Board;
use App\Models\Meeting;
use App\Models\Report;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeadershipDashboardController extends Controller
{
    /**
     * Display the leadership dashboard.
     */
    public function index(Request $request)
    {
        // Get total counts
        $totalCommittees = Committee::count();
        $totalBoards = Board::count();
        
        // Get member counts
        $totalCommitteeMembers = \DB::table('committee_member')
            ->distinct('member_id')
            ->count('member_id');
        $totalBoardMembers = \DB::table('board_member')
            ->distinct('member_id')
            ->count('member_id');

        // Get upcoming meetings (next 30 days)
        $upcomingMeetings = Meeting::whereIn('meetable_type', ['App\Models\Committee', 'App\Models\Board'])
            ->where('meeting_date', '>=', now())
            ->where('meeting_date', '<=', now()->addDays(30))
            ->with('meetable')
            ->orderBy('meeting_date', 'asc')
            ->limit(10)
            ->get()
            ->map(function ($meeting) {
                return [
                    'id' => $meeting->id,
                    'title' => $meeting->title,
                    'meeting_date' => $meeting->meeting_date,
                    'meeting_link' => $meeting->meeting_link,
                    'entity_name' => $meeting->meetable->name ?? 'Unknown',
                    'entity_type' => class_basename($meeting->meetable_type),
                    'entity_id' => $meeting->meetable_id,
                ];
            });

        // Get recent meetings (past 30 days)
        $recentMeetings = Meeting::whereIn('meetable_type', ['App\Models\Committee', 'App\Models\Board'])
            ->where('meeting_date', '>=', now()->subDays(30))
            ->where('meeting_date', '<', now())
            ->with('meetable')
            ->orderBy('meeting_date', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($meeting) {
                return [
                    'id' => $meeting->id,
                    'title' => $meeting->title,
                    'meeting_date' => $meeting->meeting_date,
                    'has_minutes' => !empty($meeting->minutes),
                    'entity_name' => $meeting->meetable->name ?? 'Unknown',
                    'entity_type' => class_basename($meeting->meetable_type),
                    'entity_id' => $meeting->meetable_id,
                ];
            });

        // Get upcoming term ends (next 60 days)
        $upcomingTermEnds = collect();
        
        // Committee term ends
        $committeeTermEnds = \DB::table('committee_member')
            ->join('members', 'committee_member.member_id', '=', 'members.id')
            ->join('committees', 'committee_member.committee_id', '=', 'committees.id')
            ->whereNotNull('committee_member.term_end_date')
            ->where('committee_member.term_end_date', '>=', now())
            ->where('committee_member.term_end_date', '<=', now()->addDays(60))
            ->select(
                'members.id as member_id',
                'members.first_name',
                'members.last_name',
                'committees.id as entity_id',
                'committees.name as entity_name',
                'committee_member.title',
                'committee_member.term_end_date',
                \DB::raw("'Committee' as entity_type")
            )
            ->get();

        // Board term ends
        $boardTermEnds = \DB::table('board_member')
            ->join('members', 'board_member.member_id', '=', 'members.id')
            ->join('boards', 'board_member.board_id', '=', 'boards.id')
            ->whereNotNull('board_member.term_end_date')
            ->where('board_member.term_end_date', '>=', now())
            ->where('board_member.term_end_date', '<=', now()->addDays(60))
            ->select(
                'members.id as member_id',
                'members.first_name',
                'members.last_name',
                'boards.id as entity_id',
                'boards.name as entity_name',
                'board_member.title',
                'board_member.term_end_date',
                \DB::raw("'Board' as entity_type")
            )
            ->get();

        $upcomingTermEnds = $committeeTermEnds->concat($boardTermEnds)
            ->sortBy('term_end_date')
            ->values();

        // Get recent reports (current month)
        $recentReports = Report::whereIn('reportable_type', ['App\Models\Committee', 'App\Models\Board'])
            ->whereYear('report_date', now()->year)
            ->whereMonth('report_date', now()->month)
            ->with('reportable')
            ->orderBy('report_date', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($report) {
                return [
                    'id' => $report->id,
                    'title' => $report->title,
                    'report_date' => $report->report_date,
                    'content' => substr($report->content, 0, 200),
                    'entity_name' => $report->reportable->name ?? 'Unknown',
                    'entity_type' => class_basename($report->reportable_type),
                    'entity_id' => $report->reportable_id,
                ];
            });

        // Get all reports count for the month
        $monthlyReportsCount = Report::whereIn('reportable_type', ['App\Models\Committee', 'App\Models\Board'])
            ->whereYear('report_date', now()->year)
            ->whereMonth('report_date', now()->month)
            ->count();

        return Inertia::render('admin/leadership/dashboard', [
            'stats' => [
                'total_committees' => $totalCommittees,
                'total_boards' => $totalBoards,
                'total_committee_members' => $totalCommitteeMembers,
                'total_board_members' => $totalBoardMembers,
                'upcoming_meetings_count' => $upcomingMeetings->count(),
                'recent_meetings_count' => $recentMeetings->count(),
                'expiring_terms_count' => $upcomingTermEnds->count(),
                'monthly_reports_count' => $monthlyReportsCount,
            ],
            'upcomingMeetings' => $upcomingMeetings,
            'recentMeetings' => $recentMeetings,
            'upcomingTermEnds' => $upcomingTermEnds,
            'recentReports' => $recentReports,
        ]);
    }
}
