<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BoardController extends Controller
{
    /**
     * Display a listing of the resource.
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
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('admin/boards/create');
    }

    /**
     * Store a newly created resource in storage.
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
     * Display the specified resource.
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
     * Show the form for editing the specified resource.
     */
    public function edit(Board $board)
    {
        return Inertia::render('admin/boards/edit', [
            'board' => $board,
        ]);
    }

    /**
     * Update the specified resource in storage.
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
     * Remove the specified resource from storage.
     */
    public function destroy(Board $board)
    {
        $board->delete();

        return redirect()->route('boards.index')
            ->with('success', 'Board deleted successfully.');
    }
}
