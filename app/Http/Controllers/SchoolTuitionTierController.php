<?php

namespace App\Http\Controllers;

use App\Models\SchoolTuitionTier;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SchoolTuitionTierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tiers = SchoolTuitionTier::ordered()->get();

        $stats = [
            'total' => $tiers->count(),
            'active' => $tiers->where('is_active', true)->count(),
            'totalRevenue' => $tiers->where('is_active', true)->sum('price'),
        ];

        return Inertia::render('admin/school-tuition-tiers/index', [
            'tiers' => $tiers,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('admin/school-tuition-tiers/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:school_tuition_tiers,slug',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'billing_period' => 'required|in:annual,semester,monthly,custom',
            'max_students' => 'nullable|integer|min:1',
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

        SchoolTuitionTier::create($validated);

        return redirect('/admin/school-tuition-tiers')
            ->with('success', 'School tuition tier created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(SchoolTuitionTier $schoolTuitionTier)
    {
        return Inertia::render('admin/school-tuition-tiers/show', [
            'tier' => $schoolTuitionTier,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SchoolTuitionTier $schoolTuitionTier)
    {
        return Inertia::render('admin/school-tuition-tiers/edit', [
            'tier' => $schoolTuitionTier,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SchoolTuitionTier $schoolTuitionTier)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:school_tuition_tiers,slug,'.$schoolTuitionTier->id,
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'billing_period' => 'required|in:annual,semester,monthly,custom',
            'max_students' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
            'features' => 'nullable|array',
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $schoolTuitionTier->update($validated);

        return redirect('/admin/school-tuition-tiers')
            ->with('success', 'School tuition tier updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SchoolTuitionTier $schoolTuitionTier)
    {
        $schoolTuitionTier->delete();

        return redirect('/admin/school-tuition-tiers')
            ->with('success', 'School tuition tier deleted successfully.');
    }
}
