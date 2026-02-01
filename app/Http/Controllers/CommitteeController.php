<?php

namespace App\Http\Controllers;

use App\Models\Committee;
use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommitteeController extends Controller
{
    /**
     * Display a listing of the resource.
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
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('admin/committees/create');
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

        Committee::create($validated);

        return redirect()->route('committees.index')
            ->with('success', 'Committee created successfully.');
    }

    /**
     * Display the specified resource.
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
     * Show the form for editing the specified resource.
     */
    public function edit(Committee $committee)
    {
        return Inertia::render('admin/committees/edit', [
            'committee' => $committee,
        ]);
    }

    /**
     * Update the specified resource in storage.
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
     * Remove the specified resource from storage.
     */
    public function destroy(Committee $committee)
    {
        $committee->delete();

        return redirect()->route('committees.index')
            ->with('success', 'Committee deleted successfully.');
    }
}
