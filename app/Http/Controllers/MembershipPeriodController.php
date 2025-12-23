<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\MembershipPeriod;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MembershipPeriodController extends Controller
{
    /**
     * Show the form for creating a new membership period.
     */
    public function create(Member $member)
    {
        $invoices = Invoice::where('member_id', $member->id)
            ->select(['id', 'invoice_number', 'invoice_date', 'total', 'status'])
            ->orderBy('invoice_date', 'desc')
            ->get();

        return Inertia::render('members/membership-periods/create', [
            'member' => $member->only(['id', 'first_name', 'last_name', 'email']),
            'invoices' => $invoices,
        ]);
    }

    /**
     * Store a newly created membership period in storage.
     */
    public function store(Request $request, Member $member)
    {
        $validated = $request->validate([
            'begin_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:begin_date',
            'membership_type' => 'nullable|string|max:255',
            'invoice_id' => 'nullable|exists:invoices,id',
            'notes' => 'nullable|string',
        ]);

        // Verify invoice belongs to this member if provided
        if (!empty($validated['invoice_id'])) {
            $invoice = Invoice::findOrFail($validated['invoice_id']);
            if ($invoice->member_id !== $member->id) {
                return back()->withErrors(['invoice_id' => 'Invoice must belong to this member.']);
            }
        }

        $member->membershipPeriods()->create($validated);

        return redirect()->route('members.show', $member)
            ->with('success', 'Membership period created successfully.');
    }

    /**
     * Show the form for editing the specified membership period.
     */
    public function edit(Member $member, MembershipPeriod $membershipPeriod)
    {
        // Verify the membership period belongs to this member
        if ($membershipPeriod->member_id !== $member->id) {
            abort(404);
        }

        $invoices = Invoice::where('member_id', $member->id)
            ->select(['id', 'invoice_number', 'invoice_date', 'total', 'status'])
            ->orderBy('invoice_date', 'desc')
            ->get();

        return Inertia::render('members/membership-periods/edit', [
            'member' => $member->only(['id', 'first_name', 'last_name', 'email']),
            'membershipPeriod' => $membershipPeriod,
            'invoices' => $invoices,
        ]);
    }

    /**
     * Update the specified membership period in storage.
     */
    public function update(Request $request, Member $member, MembershipPeriod $membershipPeriod)
    {
        // Verify the membership period belongs to this member
        if ($membershipPeriod->member_id !== $member->id) {
            abort(404);
        }

        $validated = $request->validate([
            'begin_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:begin_date',
            'membership_type' => 'nullable|string|max:255',
            'invoice_id' => 'nullable|exists:invoices,id',
            'notes' => 'nullable|string',
        ]);

        // Verify invoice belongs to this member if provided
        if (!empty($validated['invoice_id'])) {
            $invoice = Invoice::findOrFail($validated['invoice_id']);
            if ($invoice->member_id !== $member->id) {
                return back()->withErrors(['invoice_id' => 'Invoice must belong to this member.']);
            }
        }

        $membershipPeriod->update($validated);

        return redirect()->route('members.show', $member)
            ->with('success', 'Membership period updated successfully.');
    }

    /**
     * Remove the specified membership period from storage.
     */
    public function destroy(Member $member, MembershipPeriod $membershipPeriod)
    {
        // Verify the membership period belongs to this member
        if ($membershipPeriod->member_id !== $member->id) {
            abort(404);
        }

        $membershipPeriod->delete();

        return redirect()->route('members.show', $member)
            ->with('success', 'Membership period deleted successfully.');
    }
}
