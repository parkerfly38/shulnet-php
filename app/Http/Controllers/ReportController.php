<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Committee;
use App\Models\Board;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Display a listing of reports for a committee or board.
     */
    public function index(Request $request, string $type, int $id)
    {
        $reportable = $this->getReportable($type, $id);

        $reports = $reportable->reports()
            ->latest()
            ->get();

        return Inertia::render('admin/reports/list', [
            'reports' => $reports,
            'reportable' => $reportable,
            'reportableType' => $type,
        ]);
    }

    /**
     * Show the form for creating a new report.
     */
    public function create(Request $request, string $type, int $id)
    {
        $reportable = $this->getReportable($type, $id);

        return Inertia::render('admin/reports/create', [
            'reportable' => $reportable,
            'reportableType' => $type,
        ]);
    }

    /**
     * Store a newly created report in storage.
     */
    public function store(Request $request, string $type, int $id)
    {
        $reportable = $this->getReportable($type, $id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'report_date' => 'required|date',
            'content' => 'required|string',
        ]);

        $reportable->reports()->create($validated);

        return redirect()
            ->route('reports.index', ['type' => $type, 'id' => $id])
            ->with('success', 'Report created successfully.');
    }

    /**
     * Display the specified report.
     */
    public function show(string $type, int $id, Report $report)
    {
        $reportable = $this->getReportable($type, $id);

        // Ensure the report belongs to this reportable
        if ($report->reportable_id !== $reportable->id || 
            $report->reportable_type !== get_class($reportable)) {
            abort(404);
        }

        return Inertia::render('admin/reports/show', [
            'report' => $report,
            'reportable' => $reportable,
            'reportableType' => $type,
        ]);
    }

    /**
     * Show the form for editing the specified report.
     */
    public function edit(string $type, int $id, Report $report)
    {
        $reportable = $this->getReportable($type, $id);

        // Ensure the report belongs to this reportable
        if ($report->reportable_id !== $reportable->id || 
            $report->reportable_type !== get_class($reportable)) {
            abort(404);
        }

        return Inertia::render('admin/reports/edit', [
            'report' => $report,
            'reportable' => $reportable,
            'reportableType' => $type,
        ]);
    }

    /**
     * Update the specified report in storage.
     */
    public function update(Request $request, string $type, int $id, Report $report)
    {
        $reportable = $this->getReportable($type, $id);

        // Ensure the report belongs to this reportable
        if ($report->reportable_id !== $reportable->id || 
            $report->reportable_type !== get_class($reportable)) {
            abort(404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'report_date' => 'required|date',
            'content' => 'required|string',
        ]);

        $report->update($validated);

        return redirect()
            ->route('reports.show', ['type' => $type, 'id' => $id, 'report' => $report->id])
            ->with('success', 'Report updated successfully.');
    }

    /**
     * Remove the specified report from storage.
     */
    public function destroy(string $type, int $id, Report $report)
    {
        $reportable = $this->getReportable($type, $id);

        // Ensure the report belongs to this reportable
        if ($report->reportable_id !== $reportable->id || 
            $report->reportable_type !== get_class($reportable)) {
            abort(404);
        }

        $report->delete();

        return redirect()
            ->route('reports.index', ['type' => $type, 'id' => $id])
            ->with('success', 'Report deleted successfully.');
    }

    /**
     * Get the reportable model based on type and ID.
     */
    private function getReportable(string $type, int $id)
    {
        return match ($type) {
            'committee' => Committee::findOrFail($id),
            'board' => Board::findOrFail($id),
            default => abort(404, 'Invalid reportable type'),
        };
    }
}
