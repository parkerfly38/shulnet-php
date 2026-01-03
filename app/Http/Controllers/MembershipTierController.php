<?php

namespace App\Http\Controllers;

use App\Models\MembershipTier;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MembershipTierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tiers = MembershipTier::ordered()->get();
        
        $stats = [
            'total' => $tiers->count(),
            'active' => $tiers->where('is_active', true)->count(),
            'totalRevenue' => $tiers->where('is_active', true)->sum('price'),
        ];

        return Inertia::render('admin/membership-tiers/index', [
            'tiers' => $tiers,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('admin/membership-tiers/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:membership_tiers,slug',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'billing_period' => 'required|in:annual,monthly,lifetime,custom',
            'max_members' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
            'features' => 'nullable|array',
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Set defaults
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        MembershipTier::create($validated);

        return redirect()->route('membership-tiers.index')
            ->with('success', 'Membership tier created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(MembershipTier $membershipTier)
    {
        return Inertia::render('admin/membership-tiers/show', [
            'tier' => $membershipTier->load('membershipPeriods'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MembershipTier $membershipTier)
    {
        return Inertia::render('admin/membership-tiers/edit', [
            'tier' => $membershipTier,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MembershipTier $membershipTier)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:membership_tiers,slug,' . $membershipTier->id,
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'billing_period' => 'required|in:annual,monthly,lifetime,custom',
            'max_members' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
            'features' => 'nullable|array',
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $membershipTier->update($validated);

        return redirect()->route('membership-tiers.index')
            ->with('success', 'Membership tier updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MembershipTier $membershipTier)
    {
        // Check if tier is being used
        if ($membershipTier->membershipPeriods()->count() > 0) {
            return back()->with('error', 'Cannot delete membership tier that is in use.');
        }

        $membershipTier->delete();

        return redirect()->route('membership-tiers.index')
            ->with('success', 'Membership tier deleted successfully.');
    }
}
