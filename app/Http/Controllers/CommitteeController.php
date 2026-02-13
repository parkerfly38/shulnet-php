<?php

namespace App\Http\Controllers;

use App\Models\Committee;
use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Dedoc\Scramble\Attributes\Group;

#[Group('Leadership Management')]

class CommitteeController extends Controller
{
    /**
     * Display a listing of committees.
     */
    public function index()
    {
        $committees = Committee::withCount(['members', 'activeMembers'])
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/committees/index', [
            'committees' => $committees,
        ]);
    }

    /**
     * Show the form for creating a new committee.
     */
    public function create()
    {
        return Inertia::render('admin/committees/create');
    }

    /**
     * Store a newly created committee in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Committee::create($validated);

        return redirect()->route('committees.index')
            ->with('success', 'Committee created successfully.');
    }

    /**
     * Display the specified committee.
     */
    public function show(Committee $committee)
    {
        $committee->load([
            'members' => function ($query) {
                $query->orderByPivot('term_start_date', 'desc');
            },
        ]);

        $availableMembers = Member::select('id', 'first_name', 'last_name', 'email')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        return Inertia::render('admin/committees/show', [
            'committee' => $committee,
            'availableMembers' => $availableMembers,
        ]);
    }

    /**
     * Show the form for editing the specified committee.
     */
    public function edit(Committee $committee)
    {
        return Inertia::render('admin/committees/edit', [
            'committee' => $committee,
        ]);
    }

    /**
     * Update the specified committee in storage.
     */
    public function update(Request $request, Committee $committee)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $committee->update($validated);

        return redirect()->route('committees.index')
            ->with('success', 'Committee updated successfully.');
    }

    /**
     * Remove the specified committee from storage.
     */
    public function destroy(Committee $committee)
    {
        $committee->delete();

        return redirect()->route('committees.index')
            ->with('success', 'Committee deleted successfully.');
    }

    /**
     * Attach a member to the committee with term details.
     */
    public function attachMember(Request $request, Committee $committee)
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
            'title' => 'nullable|string|max:255',
            'term_start_date' => 'required|date',
            'term_end_date' => 'nullable|date|after_or_equal:term_start_date',
        ]);

        // Check if member is already attached
        if ($committee->members()->where('member_id', $validated['member_id'])->exists()) {
            return back()->withErrors(['member_id' => 'This member is already on this committee.']);
        }

        $committee->members()->attach($validated['member_id'], [
            'title' => $validated['title'] ?? null,
            'term_start_date' => $validated['term_start_date'],
            'term_end_date' => $validated['term_end_date'] ?? null,
        ]);

        return back()->with('success', 'Member added to committee successfully.');
    }

    /**
     * Detach a member from the committee.
     */
    public function detachMember(Committee $committee, Member $member)
    {
        $committee->members()->detach($member->id);

        return back()->with('success', 'Member removed from committee.');
    }
}
