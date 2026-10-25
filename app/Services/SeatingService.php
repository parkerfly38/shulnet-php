<?php

namespace App\Services;

use App\Exceptions\SeatingException;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Member;
use App\Models\Seat;
use App\Models\SeatAssignment;
use App\Models\SeatingSeason;
use Illuminate\Database\QueryException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SeatingService
{
    /**
     * Reserve seats for a member and (optionally) invoice them on a single invoice.
     *
     * Seats already offered to this member as renewals are converted. Renewal offers
     * to other members block the seat until the season's renewal window closes.
     *
     * @param  array<int>  $seatIds
     * @param  array{pricing?: string, create_invoice?: bool, source?: string, enforce_limit?: bool}  $options
     * @return array{assignments: Collection<int, SeatAssignment>, invoice: ?Invoice}
     *
     * @throws SeatingException
     */
    public function reserve(SeatingSeason $season, Member $member, array $seatIds, array $options = []): array
    {
        $seatIds = array_values(array_unique(array_map('intval', $seatIds)));

        if ($seatIds === []) {
            throw new SeatingException('Select at least one seat.');
        }

        $pricing = $options['pricing'] ?? SeatAssignment::pricingFor($member);
        $createInvoice = $options['create_invoice'] ?? true;
        $source = $options['source'] ?? 'admin';

        try {
            return DB::transaction(function () use ($season, $member, $seatIds, $pricing, $createInvoice, $source, $options) {
                $seats = Seat::with('section')
                    ->where('seating_chart_id', $season->seating_chart_id)
                    ->where('is_active', true)
                    ->whereIn('id', $seatIds)
                    ->orderBy('label')
                    ->get();

                if ($seats->count() !== count($seatIds)) {
                    throw new SeatingException('One or more of the selected seats is not available.');
                }

                $existing = $season->assignments()
                    ->whereIn('seat_id', $seatIds)
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('seat_id');

                $renewalWindowOpen = $season->isRenewalWindowOpen();

                foreach ($existing as $assignment) {
                    $isOwnRenewal = $assignment->status === SeatAssignment::STATUS_RENEWAL
                        && $assignment->member_id === $member->id;

                    if ($isOwnRenewal) {
                        continue;
                    }

                    if ($assignment->status === SeatAssignment::STATUS_RENEWAL && ! $renewalWindowOpen) {
                        // The previous holder let the priority window lapse.
                        $assignment->delete();
                        $existing->forget($assignment->seat_id);

                        continue;
                    }

                    throw new SeatingException("Seat {$seats->firstWhere('id', $assignment->seat_id)->label} has already been taken.");
                }

                if (($options['enforce_limit'] ?? false) && $season->max_seats_per_member) {
                    $alreadyReserved = $season->assignments()
                        ->where('member_id', $member->id)
                        ->where('status', SeatAssignment::STATUS_RESERVED)
                        ->count();

                    if ($alreadyReserved + $seats->count() > $season->max_seats_per_member) {
                        throw new SeatingException("You can reserve at most {$season->max_seats_per_member} seats for {$season->name}.");
                    }
                }

                $total = $seats->sum(fn (Seat $seat) => $seat->priceFor($pricing));
                $invoice = ($createInvoice && $total > 0)
                    ? $this->createInvoice($season, $member)
                    : null;

                $assignments = collect();

                foreach ($seats->values() as $index => $seat) {
                    $price = $seat->priceFor($pricing);
                    $item = null;

                    if ($invoice && $price > 0) {
                        $item = InvoiceItem::create([
                            'invoice_id' => $invoice->id,
                            'description' => $this->describe($season, $seat),
                            'gl_account_id' => $season->gl_account_id,
                            'quantity' => 1,
                            'unit_price' => $price,
                            'total' => $price,
                            'sort_order' => $index,
                        ]);
                    }

                    $attributes = [
                        'member_id' => $member->id,
                        'status' => SeatAssignment::STATUS_RESERVED,
                        'pricing' => $pricing,
                        'price' => $price,
                        'invoice_id' => $invoice?->id,
                        'invoice_item_id' => $item?->id,
                        'source' => $source,
                    ];

                    if ($renewal = $existing->get($seat->id)) {
                        $renewal->update($attributes);
                        $assignments->push($renewal);
                    } else {
                        $assignments->push($season->assignments()->create($attributes + ['seat_id' => $seat->id]));
                    }
                }

                if ($invoice) {
                    $invoice->update(['subtotal' => $total, 'total' => $total]);
                }

                return ['assignments' => $assignments, 'invoice' => $invoice];
            });
        } catch (QueryException $e) {
            // Unique (season, seat) index: someone else reserved it between our read and write.
            if (str_contains(strtolower($e->getMessage()), 'unique')) {
                throw new SeatingException('One of the selected seats was just taken. Please choose again.');
            }

            throw $e;
        }
    }

    /**
     * Release a seat, removing its unpaid charge from the invoice.
     *
     * @throws SeatingException
     */
    public function release(SeatAssignment $assignment): void
    {
        DB::transaction(function () use ($assignment) {
            $invoice = $assignment->invoice;

            if ($invoice && (float) $invoice->amount_paid > 0) {
                throw new SeatingException(
                    "Invoice {$invoice->invoice_number} already has payments. Adjust or refund the invoice before releasing this seat."
                );
            }

            $assignment->invoiceItem?->delete();
            $assignment->delete();

            if ($invoice) {
                $invoice->load('items');

                if ($invoice->items->isEmpty()) {
                    $invoice->update(['status' => 'cancelled', 'subtotal' => 0, 'total' => 0]);
                } else {
                    $invoice->calculateTotals();
                    $invoice->save();
                }
            }
        });
    }

    /**
     * Offer last season's seat holders their same seats, held until the renewal window closes.
     *
     * @return int number of renewal offers created
     *
     * @throws SeatingException
     */
    public function offerRenewals(SeatingSeason $season, SeatingSeason $previous): int
    {
        if ($season->is($previous)) {
            throw new SeatingException('Choose a different season to copy renewals from.');
        }

        if ($season->seating_chart_id !== $previous->seating_chart_id) {
            throw new SeatingException('Renewals can only be copied from a season that uses the same seating chart.');
        }

        return DB::transaction(function () use ($season, $previous) {
            $taken = $season->assignments()->pluck('seat_id')->flip();

            $holders = $previous->assignments()
                ->with(['seat', 'member'])
                ->where('status', SeatAssignment::STATUS_RESERVED)
                ->get()
                ->filter(fn (SeatAssignment $a) => $a->seat?->is_active && $a->member && ! $taken->has($a->seat_id));

            foreach ($holders as $holder) {
                $pricing = SeatAssignment::pricingFor($holder->member);

                $season->assignments()->create([
                    'seat_id' => $holder->seat_id,
                    'member_id' => $holder->member_id,
                    'status' => SeatAssignment::STATUS_RENEWAL,
                    'pricing' => $pricing,
                    'price' => $holder->seat->priceFor($pricing),
                    'occupant_name' => $holder->occupant_name,
                    'source' => 'renewal',
                ]);
            }

            return $holders->count();
        });
    }

    protected function createInvoice(SeatingSeason $season, Member $member): Invoice
    {
        $invoice = new Invoice([
            'member_id' => $member->id,
            'invoice_number' => Invoice::generateInvoiceNumber(),
            'invoice_date' => now(),
            'due_date' => $season->first_service_date && $season->first_service_date->isFuture()
                ? $season->first_service_date
                : now()->addDays(30),
            'status' => 'open',
            'subtotal' => 0,
            'tax_amount' => 0,
            'total' => 0,
            'amount_paid' => 0,
            'notes' => "High Holy Day seating: {$season->name}",
        ]);

        $invoice->invoiceable()->associate($season);
        $invoice->save();

        return $invoice;
    }

    protected function describe(SeatingSeason $season, Seat $seat): string
    {
        $section = $seat->section ? " ({$seat->section->name})" : '';

        return "{$season->name} - Seat {$seat->label}{$section}";
    }
}
