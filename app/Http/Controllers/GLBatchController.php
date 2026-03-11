<?php

namespace App\Http\Controllers;

use App\Exports\GLBatchExport;
use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class GLBatchController extends Controller
{
    /**
     * Display the GL batch export form
     */
    public function index()
    {
        $accounts = ChartOfAccount::active()
            ->orderBy('account_code')
            ->get();

        return Inertia::render('admin/gl-batch/index', [
            'accounts' => $accounts,
        ]);
    }

    /**
     * Export GL batch for a date range
     */
    public function export(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'batch_number' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $batchNumber = $request->input('batch_number');

        $filename = 'GL_Batch_' . date('Y-m-d', strtotime($startDate)) . '_to_' . date('Y-m-d', strtotime($endDate)) . '.xlsx';

        return Excel::download(
            new GLBatchExport($startDate, $endDate, $batchNumber),
            $filename
        );
    }

    /**
     * Get GL batch summary data via API
     *
     * @group General Ledger
     * @authenticated
     */
    public function summary(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // Get export instance to retrieve data
        $export = new GLBatchExport($startDate, $endDate);
        $transactions = $export->collection();

        // Calculate summary by GL account
        $summary = $transactions->groupBy('gl_account_code')->map(function ($items) {
            $firstItem = $items->first();

            return [
                'account_code' => $firstItem['gl_account_code'],
                'account_name' => $firstItem['gl_account_name'],
                'transaction_count' => $items->count(),
                'total_amount' => $items->sum('amount'),
            ];
        })->values();

        return response()->json([
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total_transactions' => $transactions->count(),
            'total_amount' => $transactions->sum('amount'),
            'summary_by_account' => $summary,
        ]);
    }
}
