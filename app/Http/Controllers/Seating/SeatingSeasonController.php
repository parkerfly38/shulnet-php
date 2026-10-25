<?php

namespace App\Http\Controllers\Seating;

use App\Exceptions\SeatingException;
use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\Member;
use App\Models\SeatAssignment;
use App\Models\SeatingChart;
use App\Models\SeatingSeason;
use App\Services\SeatingService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SeatingSeasonController extends Controller
{
    public function __construct(protected SeatingService $seating) {}

    public function index()
    {
        $seasons = SeatingSeason::with('chart:id,name')
            ->withCount([
                'assignments as reserved_count' => fn ($q) => $q->where('status', SeatAssignment::STATUS_RESERVED),
                'assignments as renewal_count' => fn ($q) => $q->where('status', SeatAssignment::STATUS_RENEWAL),
            ])
            ->orderByDesc('first_service_date')
            ->orderByDesc('id')
            ->get()
            ->map(fn (SeatingSeason $season) => array_merge($season->toArray(), [
                'seat_count' => $season->chart?->seats()->where('is_active', true)->count() ?? 0,
                'is_open_for_members' => $season->isOpenForMembers(),
            ]));

        return Inertia::render('admin/seating/seasons/index', [
            'seasons' => $seasons,
            'charts' => SeatingChart::orderBy('name')->get(['id', 'name']),
            'glAccounts' => $this->glAccounts(),
        ]);
    }

    public function store(Request $request)
    {
        $season = SeatingSeason::create($this->validateSeason($request));

        return redirect()->route('seating-seasons.show', $season)
            ->with('success', 'Seating season created.');
    }

    public function show(SeatingSeason $seatingSeason)
    {
        $seatingSeason->load(['chart.sections', 'chart.seats', 'glAccount']);

        $assignments = $seatingSeason->assignments()
            ->with(['member:id,first_name,last_name,email,member_type', 'invoice:id,invoice_number,status,total,amount_paid'])
            ->get();

        $renewalWindowOpen = $seatingSeason->isRenewalWindowOpen();
        $activeSeats = $seatingSeason->chart->seats->where('is_active', true);
        $reserved = $assignments->where('status', SeatAssignment::STATUS_RESERVED);

        return Inertia::render('admin/seating/seasons/show', [
            'season' => array_merge($seatingSeason->toArray(), [
                'is_open_for_members' => $seatingSeason->isOpenForMembers(),
                'is_renewal_window_open' => $renewalWindowOpen,
            ]),
            'assignments' => $assignments->map(fn (SeatAssignment $a) => array_merge($a->toArray(), [
                // Lapsed renewals no longer block the seat.
                'is_expired' => $a->status === SeatAssignment::STATUS_RENEWAL && ! $renewalWindowOpen,
            ]))->values(),
            'stats' => [
                'seats' => $activeSeats->count(),
                'reserved' => $reserved->count(),
                'renewals' => $renewalWindowOpen ? $assignments->where('status', SeatAssignment::STATUS_RENEWAL)->count() : 0,
                'invoiced' => (float) $reserved->sum('price'),
                'paid' => (float) $reserved->pluck('invoice')->filter()->unique('id')->sum('amount_paid'),
            ],
            'renewalSources' => SeatingSeason::where('seating_chart_id', $seatingSeason->seating_chart_id)
                ->whereKeyNot($seatingSeason->id)
                ->orderByDesc('first_service_date')
                ->get(['id', 'name']),
            'charts' => SeatingChart::orderBy('name')->get(['id', 'name']),
            'glAccounts' => $this->glAccounts(),
        ]);
    }

    public function update(Request $request, SeatingSeason $seatingSeason)
    {
        $validated = $this->validateSeason($request);

        if ((int) $validated['seating_chart_id'] !== $seatingSeason->seating_chart_id && $seatingSeason->assignments()->exists()) {
            return back()->with('error', 'The seating chart cannot be changed after seats have been assigned.');
        }

        $seatingSeason->update($validated);

        return back()->with('success', 'Seating season updated.');
    }

    public function destroy(SeatingSeason $seatingSeason)
    {
        if ($seatingSeason->assignments()->where('status', SeatAssignment::STATUS_RESERVED)->exists()) {
            return back()->with('error', 'Release all reserved seats before deleting this season.');
        }

        $seatingSeason->delete();

        return redirect()->route('seating-seasons.index')->with('success', 'Seating season deleted.');
    }

    /**
     * Assign seats to a member and invoice them.
     */
    public function assign(Request $request, SeatingSeason $seatingSeason)
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
            'seat_ids' => 'required|array|min:1',
            'seat_ids.*' => 'integer',
            'pricing' => ['required', Rule::in([SeatAssignment::PRICING_MEMBER, SeatAssignment::PRICING_NONMEMBER])],
            'create_invoice' => 'boolean',
        ]);

        $member = Member::findOrFail($validated['member_id']);

        try {
            $result = $this->seating->reserve($seatingSeason, $member, $validated['seat_ids'], [
                'pricing' => $validated['pricing'],
                'create_invoice' => $validated['create_invoice'] ?? true,
                'source' => 'admin',
            ]);
        } catch (SeatingException $e) {
            return back()->with('error', $e->getMessage());
        }

        $count = $result['assignments']->count();
        $message = "{$count} ".($count === 1 ? 'seat' : 'seats')." assigned to {$member->first_name} {$member->last_name}.";

        if ($result['invoice']) {
            $message .= " Invoice {$result['invoice']->invoice_number} created.";
        }

        return back()->with('success', $message);
    }

    public function updateAssignment(Request $request, SeatingSeason $seatingSeason, SeatAssignment $assignment)
    {
        abort_unless($assignment->seating_season_id === $seatingSeason->id, 404);

        $validated = $request->validate([
            'occupant_name' => 'nullable|string|max:255',
        ]);

        $assignment->update($validated);

        return back()->with('success', 'Seat updated.');
    }

    public function release(SeatingSeason $seatingSeason, SeatAssignment $assignment)
    {
        abort_unless($assignment->seating_season_id === $seatingSeason->id, 404);

        try {
            $this->seating->release($assignment);
        } catch (SeatingException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Seat released.');
    }

    /**
     * Copy last season's holders into this season as renewal offers.
     */
    public function renewals(Request $request, SeatingSeason $seatingSeason)
    {
        $validated = $request->validate([
            'from_season_id' => 'required|exists:seating_seasons,id',
        ]);

        try {
            $count = $this->seating->offerRenewals($seatingSeason, SeatingSeason::findOrFail($validated['from_season_id']));
        } catch (SeatingException $e) {
            return back()->with('error', $e->getMessage());
        }

        $message = "{$count} renewal ".($count === 1 ? 'offer' : 'offers').' created.';

        if (! $seatingSeason->renewal_ends_at) {
            $message .= ' Set a renewal deadline so other members cannot take these seats in the meantime.';
        }

        return back()->with('success', $message);
    }

    protected function validateSeason(Request $request): array
    {
        return $request->validate([
            'seating_chart_id' => 'required|exists:seating_charts,id',
            'name' => 'required|string|max:255',
            'first_service_date' => 'nullable|date',
            'member_sales_enabled' => 'boolean',
            'sale_starts_at' => 'nullable|date',
            'sale_ends_at' => 'nullable|date|after_or_equal:sale_starts_at',
            'renewal_ends_at' => 'nullable|date',
            'max_seats_per_member' => 'nullable|integer|min:1',
            'gl_account_id' => 'nullable|exists:chart_of_accounts,id',
            'notes' => 'nullable|string',
        ]);
    }

    protected function glAccounts()
    {
        return ChartOfAccount::active()
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name']);
    }
}
