<?php

namespace App\Http\Controllers;

use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ChartOfAccountController extends Controller
{
    /**
     * Display a listing of the chart of accounts
     */
    public function index()
    {
        $accounts = ChartOfAccount::orderBy('account_code')->get();

        return Inertia::render('admin/chart-of-accounts/index', [
            'accounts' => $accounts,
        ]);
    }

    /**
     * Show the form for creating a new account
     */
    public function create()
    {
        return Inertia::render('admin/chart-of-accounts/create');
    }

    /**
     * Store a newly created account
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'account_code' => 'required|string|unique:chart_of_accounts,account_code|max:50',
            'account_name' => 'required|string|max:255',
            'account_type' => 'required|in:asset,liability,equity,revenue,expense',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        ChartOfAccount::create($request->all());

        return redirect()->route('admin.chart-of-accounts.index')
            ->with('success', 'GL Account created successfully.');
    }

    /**
     * Show the form for editing the specified account
     */
    public function edit(ChartOfAccount $chartOfAccount)
    {
        return Inertia::render('admin/chart-of-accounts/edit', [
            'account' => $chartOfAccount,
        ]);
    }

    /**
     * Update the specified account
     */
    public function update(Request $request, ChartOfAccount $chartOfAccount)
    {
        $validator = Validator::make($request->all(), [
            'account_code' => 'required|string|max:50|unique:chart_of_accounts,account_code,' . $chartOfAccount->id,
            'account_name' => 'required|string|max:255',
            'account_type' => 'required|in:asset,liability,equity,revenue,expense',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $chartOfAccount->update($request->all());

        return redirect()->route('admin.chart-of-accounts.index')
            ->with('success', 'GL Account updated successfully.');
    }

    /**
     * Remove the specified account
     */
    public function destroy(ChartOfAccount $chartOfAccount)
    {
        // Check if account is in use
        if ($chartOfAccount->invoiceItems()->exists()) {
            return back()->with('error', 'Cannot delete GL account that is assigned to invoice items. Deactivate it instead.');
        }

        $chartOfAccount->delete();

        return redirect()->route('admin.chart-of-accounts.index')
            ->with('success', 'GL Account deleted successfully.');
    }

    /**
     * Get chart of accounts list via API
     *
     * @group General Ledger
     * @authenticated
     */
    public function apiIndex(Request $request)
    {
        $query = ChartOfAccount::query();

        if ($request->has('active_only') && $request->boolean('active_only')) {
            $query->active();
        }

        if ($request->has('account_type')) {
            $query->ofType($request->input('account_type'));
        }

        $accounts = $query->orderBy('account_code')->get();

        return response()->json([
            'data' => $accounts,
        ]);
    }
}
