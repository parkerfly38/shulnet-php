<?php

namespace App\Http\Controllers;

use App\Mail\InvoiceMail;
use App\Models\Deed;
use App\Models\Gravesite;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Member;
use App\Models\MembershipTier;
use App\Models\SchoolTuitionTier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Dedoc\Scramble\Attributes\Group;

#[Group(name: 'Cemetery Management')]

class DeedController extends Controller
{
    /**
     * Display a listing of deeds.
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $memberId = $request->get('member');
        $perPage = $request->get('per_page', 15);

        $query = Deed::query()
            ->with(['member', 'interments', 'gravesites'])
            ->orderBy('deed_number', 'asc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('deed_number', 'like', "%{$search}%")
                    ->orWhereHas('member', function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                    });
            });
        }

        if ($memberId) {
            $query->where('member_id', $memberId);
        }

        // Note: plot_type and has_space filters removed as these are now gravesite attributes

        $deeds = $query->paginate($perPage);

        $members = Member::select('id', 'first_name', 'last_name')
            ->where('member_type', 'member')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        // Calculate deed statistics
        $stats = [
            'total_count' => Deed::count(),
            'total_occupied' => Deed::sum('occupied'),
        ];

        return Inertia::render('deeds/index', [
            'deeds' => $deeds,
            'members' => $members,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'member' => $memberId,
            ],
        ]);
    }

    /**
     * Show the form for creating a new deed.
     */
    public function create()
    {
        $members = Member::select('id', 'first_name', 'last_name', 'email')
            ->where('member_type', 'member')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        $gravesites = Gravesite::select('id', 'plot_number', 'section', 'row', 'cemetery_name', 'gravesite_type', 'status')
            ->orderBy('cemetery_name')
            ->orderBy('section')
            ->orderBy('row')
            ->orderBy('plot_number')
            ->get();

        $membershipTiers = MembershipTier::active()
            ->ordered()
            ->select('id', 'name', 'description', 'price', 'billing_period')
            ->get();

        $tuitionTiers = SchoolTuitionTier::active()
            ->ordered()
            ->select('id', 'name', 'description', 'price', 'billing_period')
            ->get();

        return Inertia::render('deeds/create', [
            'members' => $members,
            'gravesites' => $gravesites,
            'membershipTiers' => $membershipTiers,
            'tuitionTiers' => $tuitionTiers,
        ]);
    }

    /**
     * Store a newly created deed.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
            'deed_number' => 'required|unique:deeds,deed_number',
            'purchase_date' => 'required|date',
            'purchase_price' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'gravesite_ids' => 'required|array|min:1',
            'gravesite_ids.*' => 'exists:gravesites,id',
        ]);

        $deed = Deed::create($validated);

        // Attach gravesites if provided
        if ($request->has('gravesite_ids')) {
            $deed->gravesites()->sync($request->gravesite_ids);
        }

        // Load the member relationship
        $deed->load('member');

        // Get members and gravesites for re-rendering the form
        $members = Member::select('id', 'first_name', 'last_name', 'email')
            ->where('member_type', 'member')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        $gravesites = Gravesite::select('id', 'section', 'row', 'plot_number', 'gravesite_type', 'status', 'cemetery_name')
            ->orderBy('section')
            ->orderBy('row')
            ->orderBy('plot_number')
            ->get();

        $membershipTiers = MembershipTier::active()
            ->ordered()
            ->select('id', 'name', 'description', 'price', 'billing_period')
            ->get();

        $tuitionTiers = SchoolTuitionTier::active()
            ->ordered()
            ->select('id', 'name', 'description', 'price', 'billing_period')
            ->get();

        return Inertia::render('deeds/create', [
            'members' => $members,
            'gravesites' => $gravesites,
            'deed' => $deed->toArray(),
            'membershipTiers' => $membershipTiers,
            'tuitionTiers' => $tuitionTiers,
        ])->with('success', 'Deed created successfully.');
    }

    /**
     * Display the specified deed.
     */
    public function show(Deed $deed)
    {
        $deed->load(['member', 'interments.member', 'gravesites']);

        return Inertia::render('deeds/show', [
            'deed' => $deed,
        ]);
    }

    /**
     * Show the form for editing the specified deed.
     */
    public function edit(Deed $deed)
    {
        $deed->load('gravesites');

        $members = Member::select('id', 'first_name', 'last_name', 'email')
            ->where('member_type', 'member')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        $gravesites = Gravesite::select('id', 'plot_number', 'section', 'row', 'cemetery_name', 'gravesite_type', 'status')
            ->orderBy('cemetery_name')
            ->orderBy('section')
            ->orderBy('row')
            ->orderBy('plot_number')
            ->get();

        return Inertia::render('deeds/edit', [
            'deed' => $deed,
            'members' => $members,
            'gravesites' => $gravesites,
        ]);
    }

    /**
     * Update the specified deed.
     */
    public function update(Request $request, Deed $deed)
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
            'deed_number' => 'required|unique:deeds,deed_number,'.$deed->id,
            'purchase_date' => 'required|date',
            'purchase_price' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
            'gravesite_ids' => 'required|array|min:1',
            'gravesite_ids.*' => 'exists:gravesites,id',
        ]);

        $deed->update($validated);

        // Sync gravesites
        if ($request->has('gravesite_ids')) {
            $deed->gravesites()->sync($request->gravesite_ids);
        } else {
            $deed->gravesites()->sync([]);
        }

        return redirect()
            ->route('deeds.show', $deed)
            ->with('success', 'Deed updated successfully.');
    }

    /**
     * Remove the specified deed.
     */
    public function destroy(Deed $deed)
    {
        // Check if deed has interments
        if ($deed->interments()->count() > 0) {
            return back()->with('error', 'Cannot delete deed with existing interments.');
        }

        $deed->delete();

        return redirect()
            ->route('deeds.index')
            ->with('success', 'Deed deleted successfully.');
    }

    /**
     * Create an invoice for the deed.
     */
    public function createInvoice(Request $request, Deed $deed)
    {
        $validated = $request->validate([
            'invoice_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:invoice_date',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'send_method' => 'required|in:email,print,both,none',
            'recipient_email' => 'required_if:send_method,email,both|email',
            'recipient_name' => 'required_if:send_method,email,both,print|string',
        ]);

        // Create the invoice
        $invoice = new Invoice([
            'member_id' => $deed->member_id,
            'invoice_number' => Invoice::generateInvoiceNumber(),
            'invoice_date' => $validated['invoice_date'],
            'due_date' => $validated['due_date'],
            'status' => 'open',
            'tax_amount' => $validated['tax_amount'] ?? 0,
            'notes' => $validated['notes'] ?? null,
        ]);

        $invoice->invoiceable()->associate($deed);
        $invoice->save();

        // Create invoice items
        $subtotal = 0;
        foreach ($validated['items'] as $index => $item) {
            $total = $item['quantity'] * $item['unit_price'];
            $subtotal += $total;

            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'description' => $item['description'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'total' => $total,
                'sort_order' => $index,
            ]);
        }

        // Update invoice totals
        $invoice->subtotal = $subtotal;
        $invoice->total = $subtotal + $invoice->tax_amount;
        $invoice->save();

        // Handle sending invoice
        $sendMethod = $validated['send_method'];
        $flashData = [
            'success' => 'Invoice created successfully.',
            'invoice' => $invoice->load('items')->toArray(),
        ];

        if (in_array($sendMethod, ['email', 'both'])) {
            try {
                Mail::to($validated['recipient_email'])
                    ->send(new InvoiceMail($invoice, $validated['recipient_name']));
                $flashData['email_sent'] = true;
            } catch (\Exception $e) {
                $flashData['email_error'] = 'Failed to send email: '.$e->getMessage();
            }
        }

        if (in_array($sendMethod, ['print', 'both'])) {
            $flashData['print_url'] = route('deeds.invoice.print', [$deed, $invoice]);
        }

        return redirect()->route('deeds.show', $deed)->with($flashData);
    }

    /**
     * Show a printable version of the deed invoice.
     */
    public function printInvoice(Deed $deed, Invoice $invoice)
    {
        $invoice->load(['items', 'member', 'invoiceable']);

        return view('deeds.print-invoice', [
            'deed' => $deed,
            'invoice' => $invoice,
        ]);
    }
}
