<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GabbaiAssignment;
use App\Models\InvoiceItem;
use App\Models\Member;
use App\Services\HonorEmailService;
use App\Services\HonorLetterService;
use App\Services\SettingsService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Dedoc\Scramble\Attributes\Group;

#[Group('Synagogue Management')]

class GabbaiController extends Controller
{
    /**
     * Return anniversary and bnai mitzvah dates
     * 
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
                        'name' => $member->first_name.' '.$member->last_name,
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
                        'name' => $member->first_name.' '.$member->last_name,
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
                    'member_name' => $a->member ? ($a->member->first_name.' '.$a->member->last_name) : null,
                    'has_email' => (bool) $a->member?->email,
                    'notified_at' => $a->notified_at?->toIso8601String(),
                    'reminded_at' => $a->reminded_at?->toIso8601String(),
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
     * Save assignments for a date
     *
     * Save assignments for a date, replacing the date's honors with the ones sent. An honor whose member
     * changes is treated as new, so that member is emailed on the next notify and reminded later.
     * With `notify: true`, honorees who haven't been emailed about their honor yet are emailed now.
     * Payload: { date: 'YYYY-MM-DD', notify?: bool, assignments: [{ honor: '1', member_id: 123 | null, portion?: string, reading?: string }, ...] }
     */
    public function saveAssignments(Request $request, HonorEmailService $emails)
    {
        $validator = Validator::make($request->all(), [
            'date' => ['required', 'date'],
            'notify' => ['sometimes', 'boolean'],
            'assignments' => ['present', 'array'],
            'assignments.*.honor' => ['required', 'string', 'max:255', 'distinct'],
            'assignments.*.member_id' => ['nullable', 'integer', 'exists:members,id'],
            'assignments.*.portion' => ['nullable', 'string', 'max:255'],
            'assignments.*.reading' => ['nullable', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $date = Carbon::parse($request->get('date'))->toDateString();
        $incoming = collect($request->get('assignments'))->keyBy('honor');

        DB::transaction(function () use ($date, $incoming) {
            $existing = GabbaiAssignment::where('date', $date)->orderBy('id')->get()->groupBy('honor');

            foreach ($existing as $honor => $rows) {
                // Older saves could leave duplicates of an honor; keep the first. Drop honors no longer sent.
                $rows->skip($incoming->has($honor) ? 1 : 0)->each->delete();
            }

            foreach ($incoming as $honor => $a) {
                $assignment = $existing->get($honor)?->first() ?? new GabbaiAssignment(['date' => $date, 'honor' => $honor]);
                $memberId = $a['member_id'] ?? null;

                if ($assignment->exists && (int) $assignment->member_id !== (int) $memberId) {
                    $assignment->notified_at = null;
                    $assignment->reminded_at = null;
                }

                $assignment->fill([
                    'member_id' => $memberId,
                    'portion' => $a['portion'] ?? $assignment->portion,
                    'reading' => $a['reading'] ?? $assignment->reading,
                ])->save();
            }
        });

        $response = ['status' => 'ok'];

        if ($request->boolean('notify')) {
            $response['notified'] = $emails->send(
                GabbaiAssignment::with('member')->where('date', $date)->whereNull('notified_at')->orderBy('id')->get(),
                reminder: false,
            );
        }

        return response()->json($response);
    }

    /**
     * Email honor reminders for a date
     *
     * Emails every honoree on the date a reminder, whether or not they were reminded before.
     * Payload: { date: 'YYYY-MM-DD' }
     */
    public function sendReminders(Request $request, HonorEmailService $emails)
    {
        $validated = $request->validate(['date' => ['required', 'date']]);
        $date = Carbon::parse($validated['date'])->toDateString();

        return response()->json([
            'status' => 'ok',
            'reminded' => $emails->send(
                GabbaiAssignment::with('member')->where('date', $date)->orderBy('id')->get(),
                reminder: true,
            ),
        ]);
    }

    /**
     * Printable honor letters for a date, one page per honoree: the first notice, or a reminder.
     */
    public function printLetters(Request $request, HonorLetterService $letters)
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'type' => ['sometimes', 'in:notice,reminder'],
        ]);

        $date = Carbon::parse($validated['date']);
        $reminder = ($validated['type'] ?? 'notice') === 'reminder';

        $rendered = GabbaiAssignment::with('member')
            ->where('date', $date->toDateString())
            ->whereNotNull('member_id')
            ->orderBy('id')
            ->get()
            ->filter(fn ($assignment) => $assignment->member)
            ->map(fn ($assignment) => $letters->render($assignment, $reminder))
            ->values()
            ->all();

        return view('gabbai.print-honor-letters', [
            'letters' => $rendered,
            'title' => ($reminder ? 'Torah Honor Reminders' : 'Torah Honor Letters').' - '.$date->format('F j, Y'),
        ]);
    }

    /**
     * Return aliyah pledge invoices
     * 
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
                'member_name' => ($item->invoice->member->first_name ?? '').' '.($item->invoice->member->last_name ?? ''),
                'description' => $item->description,
                'total' => $item->total,
                'due_date' => optional($item->invoice->due_date)->toDateString(),
                'status' => $item->invoice->status ?? null,
            ];
        });

        return response()->json($items);
    }
}
