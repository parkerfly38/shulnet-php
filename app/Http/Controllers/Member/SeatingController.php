<?php

namespace App\Http\Controllers\Member;

use App\Exceptions\SeatingException;
use App\Http\Controllers\Controller;
use App\Models\SeatAssignment;
use App\Models\SeatingSeason;
use App\Services\SeatingService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SeatingController extends Controller
{
    public function __construct(protected SeatingService $seating) {}

    public function index(Request $request)
    {
        $member = $request->user()->member;

        if (! $member) {
            return redirect()->route('dashboard')->with('error', 'No member profile found.');
        }

        $seasons = SeatingSeason::visibleToMembers()
            ->orderBy('first_service_date')
            ->get();

        // Seasons the member already has seats in stay listed even after sales close.
        $mine = $member->seatAssignments()
            ->with(['season', 'seat.section', 'invoice:id,invoice_number,status,total,amount_paid'])
            ->get()
            ->filter(fn (SeatAssignment $a) => $a->status === SeatAssignment::STATUS_RESERVED
                || $a->season->isRenewalWindowOpen());

        return Inertia::render('member/seating/index', [
            'seasons' => $seasons->map(fn (SeatingSeason $season) => array_merge($season->toArray(), [
                'is_open_for_members' => $season->isOpenForMembers(),
                'is_renewal_window_open' => $season->isRenewalWindowOpen(),
            ]))->values(),
            'myAssignments' => $mine->values(),
        ]);
    }

    public function show(Request $request, SeatingSeason $seatingSeason)
    {
        $member = $request->user()->member;

        if (! $member) {
            return redirect()->route('dashboard')->with('error', 'No member profile found.');
        }

        $hasSeats = $member->seatAssignments()->where('seating_season_id', $seatingSeason->id)->exists();

        if (! $seatingSeason->isVisibleToMembers() && ! $hasSeats) {
            abort(404);
        }

        $seatingSeason->load(['chart.sections', 'chart.seats' => fn ($q) => $q->where('is_active', true)]);

        // Members only learn which seats are taken, never by whom.
        $assignments = $seatingSeason->activeAssignments()->get(['id', 'seat_id', 'member_id', 'status', 'price', 'invoice_id']);

        return Inertia::render('member/seating/show', [
            'season' => array_merge($seatingSeason->toArray(), [
                'is_open_for_members' => $seatingSeason->isOpenForMembers(),
                'is_renewal_window_open' => $seatingSeason->isRenewalWindowOpen(),
            ]),
            'takenSeatIds' => $assignments->where('member_id', '!=', $member->id)->pluck('seat_id')->values(),
            'myAssignments' => $assignments->where('member_id', $member->id)->values(),
            'pricing' => SeatAssignment::pricingFor($member),
        ]);
    }

    public function reserve(Request $request, SeatingSeason $seatingSeason)
    {
        $member = $request->user()->member;

        if (! $member) {
            abort(403, 'You must have a member profile to reserve seats.');
        }

        $validated = $request->validate([
            'seat_ids' => 'required|array|min:1',
            'seat_ids.*' => 'integer',
            'payment_option' => 'required|in:invoice,pay_now',
        ]);

        $renewalSeatIds = $seatingSeason->assignments()
            ->where('member_id', $member->id)
            ->where('status', SeatAssignment::STATUS_RENEWAL)
            ->pluck('seat_id');

        $onlyRenewals = collect($validated['seat_ids'])->diff($renewalSeatIds)->isEmpty();
        $canConfirmRenewals = $onlyRenewals && $seatingSeason->member_sales_enabled && $seatingSeason->isRenewalWindowOpen();

        if (! $seatingSeason->isOpenForMembers() && ! $canConfirmRenewals) {
            return back()->with('error', 'Seat sales for this season are not open.');
        }

        try {
            $result = $this->seating->reserve($seatingSeason, $member, $validated['seat_ids'], [
                'source' => 'member',
                'enforce_limit' => true,
            ]);
        } catch (SeatingException $e) {
            return back()->with('error', $e->getMessage());
        }

        $invoice = $result['invoice'];

        if ($invoice && $validated['payment_option'] === 'pay_now') {
            return redirect()->route('member.invoices.pay', $invoice->id)
                ->with('success', 'Your seats are reserved. Please complete payment.');
        }

        $message = 'Your seats are reserved.';

        if ($invoice) {
            $message .= " Invoice {$invoice->invoice_number} has been added to your account.";
        }

        return redirect()->route('member.seating.show', $seatingSeason)->with('success', $message);
    }
}
