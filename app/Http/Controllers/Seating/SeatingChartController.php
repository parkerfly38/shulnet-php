<?php

namespace App\Http\Controllers\Seating;

use App\Http\Controllers\Controller;
use App\Models\Seat;
use App\Models\SeatAssignment;
use App\Models\SeatingChart;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SeatingChartController extends Controller
{
    public function index()
    {
        $charts = SeatingChart::withCount(['seats', 'seasons'])->orderBy('name')->get();

        return Inertia::render('admin/seating/charts/index', [
            'charts' => $charts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp,gif|max:10240',
        ]);

        $chart = SeatingChart::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        if ($request->hasFile('image')) {
            $this->storeImage($chart, $request->file('image'));
        }

        return redirect()->route('seating-charts.edit', $chart)
            ->with('success', 'Seating chart created. Place seats on the map to get started.');
    }

    /**
     * The seat map editor.
     */
    public function edit(SeatingChart $seatingChart)
    {
        $seatingChart->load(['sections', 'seats']);

        $assignedSeatIds = SeatAssignment::whereIn('seat_id', $seatingChart->seats->pluck('id'))
            ->distinct()
            ->pluck('seat_id');

        return Inertia::render('admin/seating/charts/edit', [
            'chart' => $seatingChart,
            'assignedSeatIds' => $assignedSeatIds,
        ]);
    }

    /**
     * Update the chart's name, description and background image.
     */
    public function update(Request $request, SeatingChart $seatingChart)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp,gif|max:10240',
        ]);

        $seatingChart->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        if ($request->hasFile('image')) {
            $this->storeImage($seatingChart, $request->file('image'));
        }

        return back()->with('success', 'Seating chart updated.');
    }

    /**
     * Save the sections and seats placed in the editor. Seats missing from the
     * payload are deleted, unless they have ever been assigned.
     */
    public function updateLayout(Request $request, SeatingChart $seatingChart)
    {
        $validated = $request->validate([
            'sections' => 'present|array',
            'sections.*.id' => 'nullable|integer',
            'sections.*.key' => 'required|string|max:50|distinct',
            'sections.*.name' => 'required|string|max:100',
            'sections.*.color' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'seats' => 'present|array|max:5000',
            'seats.*.id' => 'nullable|integer',
            'seats.*.label' => 'required|string|max:20|distinct:ignore_case',
            'seats.*.x' => 'required|numeric|min:0|max:100',
            'seats.*.y' => 'required|numeric|min:0|max:100',
            'seats.*.section_key' => 'nullable|string|max:50',
            'seats.*.member_price' => 'required|numeric|min:0',
            'seats.*.nonmember_price' => 'required|numeric|min:0',
            'seats.*.is_accessible' => 'boolean',
            'seats.*.is_active' => 'boolean',
        ], [
            'seats.*.label.distinct' => 'Seat labels must be unique.',
        ]);

        DB::transaction(function () use ($seatingChart, $validated) {
            // Sections
            $existingSections = $seatingChart->sections()->get()->keyBy('id');
            $sectionIdsByKey = [];
            $keptSectionIds = [];

            foreach ($validated['sections'] as $index => $data) {
                $attributes = ['name' => $data['name'], 'color' => $data['color'], 'sort_order' => $index];
                $section = isset($data['id']) ? $existingSections->get($data['id']) : null;

                if ($section) {
                    $section->update($attributes);
                } else {
                    $section = $seatingChart->sections()->create($attributes);
                }

                $sectionIdsByKey[$data['key']] = $section->id;
                $keptSectionIds[] = $section->id;
            }

            $seatingChart->sections()->whereNotIn('id', $keptSectionIds)->delete();

            // Seats
            $existingSeats = $seatingChart->seats()->get()->keyBy('id');
            $keptSeatIds = collect($validated['seats'])->pluck('id')->filter()
                ->intersect($existingSeats->keys())->values();

            $removed = $existingSeats->keys()->diff($keptSeatIds);
            $assignedRemoved = Seat::whereIn('id', $removed)->whereHas('assignments')->pluck('label');

            if ($assignedRemoved->isNotEmpty()) {
                throw ValidationException::withMessages([
                    'seats' => 'These seats have been assigned and cannot be deleted (mark them unavailable instead): '
                        .$assignedRemoved->implode(', '),
                ]);
            }

            Seat::whereIn('id', $removed)->delete();

            // Free current labels first so seats can swap labels without tripping the unique index.
            foreach ($keptSeatIds as $id) {
                $existingSeats[$id]->update(['label' => "__tmp_{$id}"]);
            }

            foreach ($validated['seats'] as $data) {
                $attributes = [
                    'label' => trim($data['label']),
                    'x' => round($data['x'], 3),
                    'y' => round($data['y'], 3),
                    'seating_section_id' => $sectionIdsByKey[$data['section_key'] ?? ''] ?? null,
                    'member_price' => $data['member_price'],
                    'nonmember_price' => $data['nonmember_price'],
                    'is_accessible' => $data['is_accessible'] ?? false,
                    'is_active' => $data['is_active'] ?? true,
                ];

                $seat = isset($data['id']) ? $existingSeats->get($data['id']) : null;

                if ($seat) {
                    $seat->update($attributes);
                } else {
                    $seatingChart->seats()->create($attributes);
                }
            }
        });

        return back()->with('success', 'Seat layout saved.');
    }

    public function destroy(SeatingChart $seatingChart)
    {
        if ($seatingChart->seasons()->exists()) {
            return back()->with('error', 'This chart is used by a seating season and cannot be deleted.');
        }

        if ($seatingChart->image_path) {
            Storage::disk('public')->delete($seatingChart->image_path);
        }

        $seatingChart->delete();

        return redirect()->route('seating-charts.index')->with('success', 'Seating chart deleted.');
    }

    protected function storeImage(SeatingChart $chart, UploadedFile $file): void
    {
        $previous = $chart->image_path;
        $size = @getimagesize($file->getRealPath()) ?: [null, null];

        $chart->update([
            'image_path' => $file->store('seating-charts', 'public'),
            'image_width' => $size[0],
            'image_height' => $size[1],
        ]);

        if ($previous) {
            Storage::disk('public')->delete($previous);
        }
    }
}
