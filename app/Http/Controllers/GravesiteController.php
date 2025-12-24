<?php

namespace App\Http\Controllers;

use App\Models\Gravesite;
use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GravesiteController extends Controller
{
    /**
     * Display a listing of gravesites.
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $status = $request->get('status');
        $cemetery = $request->get('cemetery');
        $perPage = $request->get('per_page', 15);

        $query = Gravesite::query()
            ->with(['member'])
            ->orderBy('cemetery_name')
            ->orderBy('section')
            ->orderBy('row')
            ->orderBy('plot_number');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('plot_number', 'like', "%{$search}%")
                  ->orWhere('section', 'like', "%{$search}%")
                  ->orWhere('deceased_name', 'like', "%{$search}%")
                  ->orWhere('reserved_by', 'like', "%{$search}%")
                  ->orWhereHas('member', function ($q) use ($search) {
                      $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                  });
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($cemetery) {
            $query->where('cemetery_name', $cemetery);
        }

        $gravesites = $query->paginate($perPage);

        // Get unique cemetery names for filter
        $cemeteries = Gravesite::select('cemetery_name')
            ->whereNotNull('cemetery_name')
            ->distinct()
            ->orderBy('cemetery_name')
            ->pluck('cemetery_name');

        // Calculate statistics
        $stats = [
            'total' => Gravesite::count(),
            'available' => Gravesite::where('status', 'available')->count(),
            'reserved' => Gravesite::where('status', 'reserved')->count(),
            'occupied' => Gravesite::where('status', 'occupied')->count(),
            'single' => Gravesite::where('gravesite_type', 'single')->count(),
            'double' => Gravesite::where('gravesite_type', 'double')->count(),
            'family' => Gravesite::where('gravesite_type', 'family')->count(),
            'cremation' => Gravesite::where('gravesite_type', 'cremation')->count(),
        ];

        return Inertia::render('gravesites/index', [
            'gravesites' => $gravesites,
            'cemeteries' => $cemeteries,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'cemetery' => $cemetery,
            ],
        ]);
    }

    /**
     * Show the form for creating a new gravesite.
     */
    public function create()
    {
        $members = Member::select('id', 'first_name', 'last_name', 'email')
            ->where('member_type', 'member')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        return Inertia::render('gravesites/create', [
            'members' => $members,
        ]);
    }

    /**
     * Store a newly created gravesite.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'cemetery_name' => 'nullable|string|max:255',
            'section' => 'nullable|string|max:255',
            'row' => 'nullable|string|max:255',
            'plot_number' => 'required|string|max:255',
            'block' => 'nullable|string|max:255',
            'status' => 'required|in:available,reserved,occupied',
            'gravesite_type' => 'required|in:single,double,family,cremation',
            'size_length' => 'nullable|numeric|min:0',
            'size_width' => 'nullable|numeric|min:0',
            'member_id' => 'nullable|exists:members,id',
            'purchase_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric|min:0',
            'reserved_date' => 'nullable|date',
            'reserved_by' => 'nullable|string|max:255',
            'deceased_name' => 'nullable|string|max:255',
            'deceased_hebrew_name' => 'nullable|string|max:255',
            'date_of_birth' => 'nullable|date',
            'date_of_death' => 'nullable|date',
            'burial_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'gps_coordinates' => 'nullable|string|max:255',
            'perpetual_care' => 'boolean',
            'monument_inscription' => 'nullable|string',
        ]);

        Gravesite::create($validated);

        return redirect()->route('gravesites.index')
            ->with('success', 'Gravesite created successfully.');
    }

    /**
     * Display the specified gravesite.
     */
    public function show(Gravesite $gravesite)
    {
        $gravesite->load(['member']);

        return Inertia::render('gravesites/show', [
            'gravesite' => $gravesite,
        ]);
    }

    /**
     * Show the form for editing the specified gravesite.
     */
    public function edit(Gravesite $gravesite)
    {
        $members = Member::select('id', 'first_name', 'last_name', 'email')
            ->where('member_type', 'member')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        $gravesite->load(['member']);

        return Inertia::render('gravesites/edit', [
            'gravesite' => $gravesite,
            'members' => $members,
        ]);
    }

    /**
     * Update the specified gravesite.
     */
    public function update(Request $request, Gravesite $gravesite)
    {
        $validated = $request->validate([
            'cemetery_name' => 'nullable|string|max:255',
            'section' => 'nullable|string|max:255',
            'row' => 'nullable|string|max:255',
            'plot_number' => 'required|string|max:255',
            'block' => 'nullable|string|max:255',
            'status' => 'required|in:available,reserved,occupied',
            'gravesite_type' => 'required|in:single,double,family,cremation',
            'size_length' => 'nullable|numeric|min:0',
            'size_width' => 'nullable|numeric|min:0',
            'member_id' => 'nullable|exists:members,id',
            'purchase_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric|min:0',
            'reserved_date' => 'nullable|date',
            'reserved_by' => 'nullable|string|max:255',
            'deceased_name' => 'nullable|string|max:255',
            'deceased_hebrew_name' => 'nullable|string|max:255',
            'date_of_birth' => 'nullable|date',
            'date_of_death' => 'nullable|date',
            'burial_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'gps_coordinates' => 'nullable|string|max:255',
            'perpetual_care' => 'boolean',
            'monument_inscription' => 'nullable|string',
        ]);

        $gravesite->update($validated);

        return redirect()->route('gravesites.index')
            ->with('success', 'Gravesite updated successfully.');
    }

    /**
     * Remove the specified gravesite.
     */
    public function destroy(Gravesite $gravesite)
    {
        $gravesite->delete();

        return redirect()->route('gravesites.index')
            ->with('success', 'Gravesite deleted successfully.');
    }
}
