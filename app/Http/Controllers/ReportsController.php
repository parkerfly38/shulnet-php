<?php

namespace App\Http\Controllers;

use App\Exports\FinancialSummaryExport;
use App\Exports\InvoicesExport;
use App\Exports\MembersExport;
use App\Exports\StudentsExport;
use App\Exports\YahrzeitExport;
use App\Services\FinancialReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ReportsController extends Controller
{
    protected FinancialReportService $reportService;

    public function __construct(FinancialReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    public function index()
    {
        return Inertia::render('admin/reports/index');
    }

    public function exportMembers(Request $request)
    {
        $filters = $request->only(['search', 'member_type']);

        return Excel::download(
            new MembersExport($filters),
            'members-'.now()->format('Y-m-d').'.xlsx'
        );
    }

    public function exportInvoices(Request $request)
    {
        $filters = $request->only(['status', 'start_date', 'end_date']);

        return Excel::download(
            new InvoicesExport($filters),
            'invoices-'.now()->format('Y-m-d').'.xlsx'
        );
    }

    public function exportStudents(Request $request)
    {
        $filters = $request->only(['class_id', 'grade_level']);

        return Excel::download(
            new StudentsExport($filters),
            'students-'.now()->format('Y-m-d').'.xlsx'
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
            'financial-summary-'.now()->format('Y-m-d').'.xlsx'
        );
    }

    public function exportYahrzeit(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        return Excel::download(
            new YahrzeitExport($startDate, $endDate),
            'yahrzeit-'.now()->format('Y-m-d').'.xlsx'
        );
    }

    /**
     *  Get income summary report
     *
     * @group Financial Reports
     * @authenticated
     */
    public function getIncomeSummary(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $report = $this->reportService->getIncomeSummary(
            $validated['start_date'],
            $validated['end_date']
        );

        return response()->json($report);
    }

    /**
     *  Get outstanding balances report
     *
     * @group Financial Reports
     * @authenticated
     */
    public function getOutstandingBalances(Request $request)
    {
        $minBalance = $request->input('min_balance', 0);

        $report = $this->reportService->getOutstandingBalances($minBalance);

        return response()->json($report);
    }

    /**
     *  Get aging report
     *
     * @group Financial Reports
     * @authenticated
     */
    public function getAgingReport()
    {
        $report = $this->reportService->getAgingReport();

        return response()->json($report);
    }

    /**
     *  Get revenue by source report
     *
     * @group Financial Reports
     * @authenticated
     */
    public function getRevenueBySource(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $report = $this->reportService->getRevenueBySource(
            $validated['start_date'],
            $validated['end_date']
        );

        return response()->json($report);
    }

    /**
     *  Get member growth report
     *
     * @group Financial Reports
     * @authenticated
     */
    public function getMemberGrowth(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $report = $this->reportService->getMemberGrowth(
            $validated['start_date'],
            $validated['end_date']
        );

        return response()->json($report);
    }

    /**
     *  Get tuition revenue report
     *
     * @group Financial Reports
     * @authenticated
     */
    public function getTuitionRevenue(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $report = $this->reportService->getTuitionRevenue($startDate, $endDate);

        return response()->json($report);
    }

    /**
     *  Get payment method analysis
     *
     * @group Financial Reports
     * @authenticated
     */
    public function getPaymentMethodAnalysis(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $report = $this->reportService->getPaymentMethodAnalysis(
            $validated['start_date'],
            $validated['end_date']
        );

        return response()->json($report);
    }

    /**
     *  Get event revenue report
     *
     * @group Financial Reports
     * @authenticated
     */
    public function getEventRevenue(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $report = $this->reportService->getEventRevenue(
            $validated['start_date'],
            $validated['end_date']
        );

        return response()->json($report);
    }

    /**
     *  Get budget vs actual report
     *
     * @group Financial Reports
     * @authenticated
     */
    public function getBudgetVsActual(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'budget' => 'required|array',
            'budget.membership_dues' => 'required|numeric|min:0',
            'budget.tuition' => 'required|numeric|min:0',
            'budget.event_revenue' => 'required|numeric|min:0',
            'budget.donations' => 'required|numeric|min:0',
            'budget.other_income' => 'required|numeric|min:0',
        ]);

        $report = $this->reportService->getBudgetVsActual(
            $validated['budget'],
            $validated['start_date'],
            $validated['end_date']
        );

        return response()->json($report);
    }
}
