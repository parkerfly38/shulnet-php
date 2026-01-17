<?php

namespace App\Http\Controllers;

use App\Models\Deed;
use App\Models\Interment;
use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IntermentController extends Controller
{
    /**
     * Display a listing of interments.
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $deedId = $request->get('deed');
        $memberId = $request->get('member');
        $perPage = $request->get('per_page', 15);

        $query = Interment::query()
            ->with(['deed', 'member'])
            ->orderBy('interment_date', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('hebrew_name', 'like', "%{$search}%")
                    ->orWhereHas('deed', function ($q) use ($search) {
                        $q->where('deed_number', 'like', "%{$search}%");
                    });
            });
        }

        if ($deedId) {
            $query->where('deed_id', $deedId);
        }

        if ($memberId) {
            $query->where('member_id', $memberId);
        }

        $interments = $query->paginate($perPage);

        $deeds = Deed::select('id', 'deed_number')
            ->where('is_active', true)
            ->orderBy('deed_number')
            ->get();

        $members = Member::select('id', 'first_name', 'last_name')
            ->where('member_type', 'member')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        // Calculate interment statistics
        $stats = [
            'total_count' => Interment::count(),
            'this_year' => Interment::whereYear('interment_date', date('Y'))->count(),
            'last_year' => Interment::whereYear('interment_date', date('Y') - 1)->count(),
            'this_month' => Interment::whereYear('interment_date', date('Y'))
                ->whereMonth('interment_date', date('m'))
                ->count(),
        ];

        return Inertia::render('interments/index', [
            'interments' => $interments,
            'deeds' => $deeds,
            'members' => $members,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'deed' => $deedId,
                'member' => $memberId,
            ],
        ]);
    }

    /**
     * Show the form for creating a new interment.
     */
    public function create(Request $request)
    {
        $deeds = Deed::with('gravesites')
            ->where('is_active', true)
            ->orderBy('deed_number')
            ->get();

        $members = Member::select('id', 'first_name', 'last_name', 'email')
            ->where('member_type', 'member')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        return Inertia::render('interments/create', [
            'deeds' => $deeds,
            'members' => $members,
            'selectedDeed' => $request->get('deed'),
        ]);
    }

    /**
     * Store a newly created interment.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'deed_id' => 'required|exists:deeds,id',
            'gravesite_id' => 'required|exists:gravesites,id',
            'member_id' => 'nullable|exists:members,id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'hebrew_name' => 'nullable|string|max:255',
            'date_of_birth' => 'nullable|date|before:date_of_death',
            'date_of_death' => 'required|date|before_or_equal:today',
            'interment_date' => 'required|date|after_or_equal:date_of_death',
            'cause_of_death' => 'nullable|string|max:255',
            'funeral_home' => 'nullable|string|max:255',
            'rabbi_officiating' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        // Check if deed has available space
        $deed = Deed::findOrFail($validated['deed_id']);
        if (! $deed->hasAvailableSpace()) {
            return back()
                ->withErrors(['deed_id' => 'The selected deed has no available space.'])
                ->withInput();
        }

        $interment = Interment::create($validated);

        // Update deed occupied count
        $deed->increment('occupied');

        // Update gravesite status to occupied
        $gravesite = \App\Models\Gravesite::find($validated['gravesite_id']);
        if ($gravesite) {
            $gravesite->update([
                'status' => 'occupied',
                'deceased_name' => $validated['first_name'].' '.$validated['last_name'],
                'deceased_hebrew_name' => $validated['hebrew_name'] ?? null,
                'date_of_birth' => $validated['date_of_birth'] ?? null,
                'date_of_death' => $validated['date_of_death'],
                'burial_date' => $validated['interment_date'],
            ]);
        }

        return redirect()
            ->route('interments.show', $interment)
            ->with('success', 'Interment record created successfully.');
    }

    /**
     * Display the specified interment.
     */
    public function show(Interment $interment)
    {
        $interment->load(['deed.member', 'member']);

        return Inertia::render('interments/show', [
            'interment' => $interment,
        ]);
    }

    /**
     * Show the form for editing the specified interment.
     */
    public function edit(Interment $interment)
    {
        $deeds = Deed::select('id', 'deed_number', 'capacity', 'occupied')
            ->where('is_active', true)
            ->where(function ($q) use ($interment) {
                $q->whereColumn('occupied', '<', 'capacity')
                    ->orWhere('id', $interment->deed_id);
            })
            ->orderBy('deed_number')
            ->get();

        $members = Member::select('id', 'first_name', 'last_name', 'email')
            ->where('member_type', 'member')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        return Inertia::render('interments/edit', [
            'interment' => $interment,
            'deeds' => $deeds,
            'members' => $members,
        ]);
    }

    /**
     * Update the specified interment.
     */
    public function update(Request $request, Interment $interment)
    {
        $validated = $request->validate([
            'deed_id' => 'required|exists:deeds,id',
            'member_id' => 'nullable|exists:members,id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'hebrew_name' => 'nullable|string|max:255',
            'date_of_birth' => 'nullable|date|before:date_of_death',
            'date_of_death' => 'required|date|before_or_equal:today',
            'interment_date' => 'required|date|after_or_equal:date_of_death',
            'cause_of_death' => 'nullable|string|max:255',
            'funeral_home' => 'nullable|string|max:255',
            'rabbi_officiating' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        // If deed is being changed, check space and update counts
        if ($interment->deed_id !== $validated['deed_id']) {
            $newDeed = Deed::findOrFail($validated['deed_id']);
            if (! $newDeed->hasAvailableSpace()) {
                return back()
                    ->withErrors(['deed_id' => 'The selected deed has no available space.'])
                    ->withInput();
            }

            // Decrement old deed, increment new deed
            $interment->deed->decrement('occupied');
            $newDeed->increment('occupied');
        }

        $interment->update($validated);

        return redirect()
            ->route('interments.show', $interment)
            ->with('success', 'Interment record updated successfully.');
    }

    /**
     * Remove the specified interment.
     */
    public function destroy(Interment $interment)
    {
        // Decrement deed occupied count
        $interment->deed->decrement('occupied');

        $interment->delete();

        return redirect()
            ->route('interments.index')
            ->with('success', 'Interment record deleted successfully.');
    }
}
