<?php

namespace App\Http\Controllers;

use App\Exports\FinancialSummaryExport;
use App\Exports\InvoicesExport;
use App\Exports\MembersExport;
use App\Exports\StudentsExport;
use App\Exports\YahrzeitExport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ReportsController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/reports/index');
    }

    public function exportMembers(Request $request)
    {
        $filters = $request->only(['search', 'member_type']);
        
        return Excel::download(
            new MembersExport($filters),
            'members-' . now()->format('Y-m-d') . '.xlsx'
        );
    }

    public function exportInvoices(Request $request)
    {
        $filters = $request->only(['status', 'start_date', 'end_date']);
        
        return Excel::download(
            new InvoicesExport($filters),
            'invoices-' . now()->format('Y-m-d') . '.xlsx'
        );
    }

    public function exportStudents(Request $request)
    {
        $filters = $request->only(['class_id', 'grade_level']);
        
        return Excel::download(
            new StudentsExport($filters),
            'students-' . now()->format('Y-m-d') . '.xlsx'
        );
    }

    public function exportFinancialSummary(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        return Excel::download(
            new FinancialSummaryExport($validated['start_date'], $validated['end_date']),
            'financial-summary-' . now()->format('Y-m-d') . '.xlsx'
        );
    }

    public function exportYahrzeit(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        return Excel::download(
            new YahrzeitExport($startDate, $endDate),
            'yahrzeit-' . now()->format('Y-m-d') . '.xlsx'
        );
    }
}
