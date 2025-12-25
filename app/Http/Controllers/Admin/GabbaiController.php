<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\InvoiceItem;
use App\Models\GabbaiAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Validator;
use App\Services\SettingsService;

class GabbaiController extends Controller
{
    /**
     * Return upcoming anniversaries and bnai mitzvah dates within a date range.
     * Accepts optional `start` and `end` query params (YYYY-MM-DD). Defaults to today..+30 days.
     */
    public function anniversaries(Request $request)
    {
        $start = $request->get('start') ? Carbon::parse($request->get('start')) : Carbon::today();
        $end = $request->get('end') ? Carbon::parse($request->get('end')) : Carbon::today()->addDays(30);

        $members = Member::query()->where(function ($q) {
            $q->whereNotNull('anniversary_date')
              ->orWhereNotNull('bnaimitzvahdate');
        })->get();

        $results = [];

        foreach ($members as $member) {
            // Anniversary
            if ($member->anniversary_date) {
                $ann = Carbon::parse($member->anniversary_date);
                $occurrence = Carbon::createFromDate($start->year, $ann->month, $ann->day);
                if ($occurrence->lt($start)) {
                    $occurrence->addYear();
                }
                if ($occurrence->between($start, $end)) {
                    $results[] = [
                        'id' => $member->id,
                        'name' => $member->first_name . ' ' . $member->last_name,
                        'type' => 'wedding',
                        'date' => $occurrence->toDateString(),
                    ];
                }
            }

            // Bnai mitzvah
            if ($member->bnaimitzvahdate) {
                $bna = Carbon::parse($member->bnaimitzvahdate);
                $occurrence = Carbon::createFromDate($start->year, $bna->month, $bna->day);
                if ($occurrence->lt($start)) {
                    $occurrence->addYear();
                }
                if ($occurrence->between($start, $end)) {
                    $results[] = [
                        'id' => $member->id,
                        'name' => $member->first_name . ' ' . $member->last_name,
                        'type' => 'bnai',
                        'date' => $occurrence->toDateString(),
                    ];
                }
            }
        }

        // sort by date
        usort($results, function ($a, $b) {
            return strcmp($a['date'], $b['date']);
        });

        return response()->json($results);
    }

    /**
     * Return assignments for a specific date.
     */
    public function assignments(Request $request)
    {
        $date = $request->get('date') ? Carbon::parse($request->get('date'))->toDateString() : Carbon::today()->toDateString();

        $items = GabbaiAssignment::with('member')
            ->where('date', $date)
            ->get()
            ->map(function ($a) {
                return [
                    'id' => $a->id,
                    'honor' => $a->honor,
                    'member_id' => $a->member_id,
                    'member_name' => $a->member ? ($a->member->first_name . ' ' . $a->member->last_name) : null,
                ];
            });

        return response()->json($items);
    }

    /**
     * Return simple config for Gabbai UI (e.g., triennial setting)
     */
    public function config(Request $request, SettingsService $settings)
    {
        return response()->json([
            'triennial' => $settings->isTriennialCycle(),
        ]);
    }

    /**
     * Save assignments for a date. Replaces existing assignments for that date.
     * Payload: { date: 'YYYY-MM-DD', assignments: [{ honor: '1', member_id: 123 | null }, ...] }
     */
    public function saveAssignments(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => ['required', 'date'],
            'assignments' => ['required', 'array'],
            'assignments.*.honor' => ['required', 'string'],
            'assignments.*.member_id' => ['nullable', 'integer', 'exists:members,id'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $date = Carbon::parse($request->get('date'))->toDateString();

        // remove existing for date
        GabbaiAssignment::where('date', $date)->delete();

        $data = [];
        foreach ($request->get('assignments') as $a) {
            $data[] = [
                'member_id' => $a['member_id'] ?? null,
                'date' => $date,
                'honor' => $a['honor'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if (!empty($data)) {
            GabbaiAssignment::insert($data);
        }

        return response()->json(['status' => 'ok']);
    }

    /**
     * Return invoice items that look like pledges for Torah honors (e.g., description contains "aliyah").
     * Optionally filter by due date range via `start` and `end`.
     */
    public function pledges(Request $request)
    {
        $start = $request->get('start') ? Carbon::parse($request->get('start')) : null;
        $end = $request->get('end') ? Carbon::parse($request->get('end')) : null;

        $query = InvoiceItem::query()
            ->with('invoice.member')
            ->whereRaw('LOWER(description) LIKE ?', ['%aliyah%']);

        // join invoices to filter by invoice due_date if provided
        if ($start || $end) {
            $query->whereHas('invoice', function ($q) use ($start, $end) {
                if ($start) {
                    $q->where('due_date', '>=', $start->toDateString());
                }
                if ($end) {
                    $q->where('due_date', '<=', $end->toDateString());
                }
            });
        }

        // Exclude paid invoices by default
        $query->whereHas('invoice', function ($q) {
            $q->where('status', '!=', 'paid');
        });

        $items = $query->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'invoice_id' => $item->invoice_id,
                'invoice_number' => $item->invoice->invoice_number ?? null,
                'member_id' => $item->invoice->member->id ?? null,
                'member_name' => ($item->invoice->member->first_name ?? '') . ' ' . ($item->invoice->member->last_name ?? ''),
                'description' => $item->description,
                'total' => $item->total,
                'due_date' => optional($item->invoice->due_date)->toDateString(),
                'status' => $item->invoice->status ?? null,
            ];
        });

        return response()->json($items);
    }
}
