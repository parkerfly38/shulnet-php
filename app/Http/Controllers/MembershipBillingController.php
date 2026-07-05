<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Services\MembershipBillingService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MembershipBillingController extends Controller
{
    public function __construct(protected MembershipBillingService $billingService)
    {
    }

    /**
     * Display membership billing settings
     */
    public function index()
    {
        $settings = [
            'billing_method' => Setting::get('membership_billing_method', 'anniversary'),
            'fixed_month' => Setting::get('membership_billing_fixed_month', '1'),
            'fixed_day' => Setting::get('membership_billing_fixed_day', '1'),
            'grace_period_days' => Setting::get('membership_billing_grace_period_days', '30'),
            'auto_generate' => Setting::get('membership_auto_generate_invoices', 'true') === 'true',
            'invoice_due_days' => Setting::get('membership_invoice_due_days', '30'),
        ];

        $months = [
            1 => 'January',
            2 => 'February',
            3 => 'March',
            4 => 'April',
            5 => 'May',
            6 => 'June',
            7 => 'July',
            8 => 'August',
            9 => 'September',
            10 => 'October',
            11 => 'November',
            12 => 'December',
        ];

        return Inertia::render('settings/membership-billing', [
            'settings' => $settings,
            'months' => $months,
        ]);
    }

    /**
     * Update membership billing settings
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'billing_method' => 'required|in:anniversary,fixed_date',
            'fixed_month' => 'required|integer|min:1|max:12',
            'fixed_day' => 'required|integer|min:1|max:31',
            'grace_period_days' => 'required|integer|min:0|max:365',
            'auto_generate' => 'required|boolean',
            'invoice_due_days' => 'required|integer|min:1|max:365',
        ]);

        Setting::set('membership_billing_method', $validated['billing_method']);
        Setting::set('membership_billing_fixed_month', (string) $validated['fixed_month']);
        Setting::set('membership_billing_fixed_day', (string) $validated['fixed_day']);
        Setting::set('membership_billing_grace_period_days', (string) $validated['grace_period_days']);
        Setting::set('membership_auto_generate_invoices', $validated['auto_generate'] ? 'true' : 'false');
        Setting::set('membership_invoice_due_days', (string) $validated['invoice_due_days']);

        Setting::clearCache();

        return redirect()
            ->route('settings.membership-billing')
            ->with('success', 'Membership billing settings updated successfully.');
    }

    /**
     * Preview members due for renewal
     */
    public function preview(Request $request)
    {
        $date = $request->date ? \Carbon\Carbon::parse($request->date) : now();

        $members = $this->billingService->getMembersDueForRenewal($date);

        $memberData = $members->map(function ($member) {
            return [
                'id' => $member->id,
                'name' => $member->first_name.' '.$member->last_name,
                'email' => $member->email,
                'last_renewal' => $member->last_renewal?->format('Y-m-d'),
                'tiers' => $member->activeMembershipPeriods->map(function ($period) {
                    return [
                        'name' => $period->membershipTier?->name,
                        'price' => $period->membershipTier?->price,
                        'billing_period' => $period->membershipTier?->billing_period,
                    ];
                }),
            ];
        });

        return response()->json([
            'count' => $members->count(),
            'members' => $memberData,
            'date' => $date->format('Y-m-d'),
        ]);
    }

    /**
     * Manually trigger dues generation
     */
    public function generate(Request $request)
    {
        $date = $request->date ? \Carbon\Carbon::parse($request->date) : now();

        $results = $this->billingService->generateDuesInvoices($date);

        return redirect()
            ->route('settings.membership-billing')
            ->with('success', $results['message']);
    }
}
