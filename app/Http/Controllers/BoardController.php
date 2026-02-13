<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Dedoc\Scramble\Attributes\Group;

#[Group('Leadership Management')]
class BoardController extends Controller
{
    /**
     * Display a listing of the boards.
     */
    public function index()
    {
        $boards = Board::withCount(['members', 'activeMembers'])
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/boards/index', [
            'boards' => $boards,
        ]);
    }

    /**
     * Show the form for creating a new board.
     */
    public function create()
    {
        return Inertia::render('admin/boards/create');
    }

    /**
     * Store a newly created board in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Board::create($validated);

        return redirect()->route('boards.index')
            ->with('success', 'Board created successfully.');
    }

    /**
     * Display the specified board.
     */
    public function show(Board $board)
    {
        $board->load([
            'members' => function ($query) {
                $query->orderByPivot('term_start_date', 'desc');
            },
        ]);

        $availableMembers = Member::select('id', 'first_name', 'last_name', 'email')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        return Inertia::render('admin/boards/show', [
            'board' => $board,
            'availableMembers' => $availableMembers,
        ]);
    }

    /**
     * Show the form for editing the specified board.
     */
    public function edit(Board $board)
    {
        return Inertia::render('admin/boards/edit', [
            'board' => $board,
        ]);
    }

    /**
     * Update the specified board in storage.
     */
    public function update(Request $request, Board $board)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $board->update($validated);

        return redirect()->route('boards.index')
            ->with('success', 'Board updated successfully.');
    }

    /**
     * Remove the specified board from storage.
     */
    public function destroy(Board $board)
    {
        $board->delete();

        return redirect()->route('boards.index')
            ->with('success', 'Board deleted successfully.');
    }

    /**
     * Attach a member to the board with term details.
     */
    public function attachMember(Request $request, Board $board)
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
            'title' => 'nullable|string|max:255',
            'term_start_date' => 'required|date',
            'term_end_date' => 'nullable|date|after_or_equal:term_start_date',
        ]);

        // Check if member is already attached
        if ($board->members()->where('member_id', $validated['member_id'])->exists()) {
            return back()->withErrors(['member_id' => 'This member is already on this board.']);
        }

        $board->members()->attach($validated['member_id'], [
            'title' => $validated['title'] ?? null,
            'term_start_date' => $validated['term_start_date'],
            'term_end_date' => $validated['term_end_date'] ?? null,
        ]);

        return back()->with('success', 'Member added to board successfully.');
    }

    /**
     * Detach a member from the board.
     */
    public function detachMember(Board $board, Member $member)
    {
        $board->members()->detach($member->id);

        return back()->with('success', 'Member removed from board.');
    }
}
