<?php

namespace App\Http\Controllers;

use App\Mail\InvoiceMail;
use App\Models\Invoice;
use App\Models\Member;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    /**
     * Display a listing of invoices.
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $status = $request->get('status');
        $memberId = $request->get('member');
        $perPage = $request->get('per_page', 15);

        $query = Invoice::query()
            ->with(['member'])
            ->orderBy('invoice_date', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhereHas('member', function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                    });
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($memberId) {
            $query->where('member_id', $memberId);
        }

        $invoices = $query->paginate($perPage);

        $members = Member::select('id', 'first_name', 'last_name')
            ->where('member_type', 'member')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        // Calculate invoice statistics
        $stats = [
            'total_count' => Invoice::count(),
            'total_amount' => Invoice::sum('total'),
            'draft_count' => Invoice::where('status', 'draft')->count(),
            'draft_amount' => Invoice::where('status', 'draft')->sum('total'),
            'open_count' => Invoice::where('status', 'open')->count(),
            'open_amount' => Invoice::where('status', 'open')->sum('total'),
            'paid_count' => Invoice::where('status', 'paid')->count(),
            'paid_amount' => Invoice::where('status', 'paid')->sum('total'),
            'overdue_count' => Invoice::where('status', 'overdue')->count(),
            'overdue_amount' => Invoice::where('status', 'overdue')->sum('total'),
            'unpaid_count' => Invoice::whereIn('status', ['open', 'overdue'])->count(),
            'unpaid_amount' => Invoice::whereIn('status', ['open', 'overdue'])->sum('total'),
        ];

        return Inertia::render('invoices/index', [
            'invoices' => $invoices,
            'members' => $members,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'member' => $memberId,
            ],
        ]);
    }

    /**
     * Show the form for creating a new invoice.
     */
    public function create(Request $request)
    {
        $members = Member::select('id', 'first_name', 'last_name', 'email')
            ->where('member_type', 'member')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        return Inertia::render('invoices/create', [
            'members' => $members,
            'selectedMember' => $request->get('member'),
        ]);
    }

    /**
     * Store a newly created invoice.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
            'invoice_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:invoice_date',
            'status' => 'required|in:draft,open,paid,overdue,cancelled',
            'tax_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'recurring' => 'boolean',
            'recurring_interval' => 'nullable|required_if:recurring,true|in:daily,weekly,monthly,yearly',
            'recurring_interval_count' => 'nullable|integer|min:1',
            'recurring_end_date' => 'nullable|date|after:invoice_date',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        // Generate invoice number
        $validated['invoice_number'] = Invoice::generateInvoiceNumber();

        // Calculate next invoice date if recurring
        if ($validated['recurring'] ?? false) {
            $invoiceDate = \Carbon\Carbon::parse($validated['invoice_date']);
            $validated['next_invoice_date'] = $this->calculateNextDate(
                $invoiceDate,
                $validated['recurring_interval'],
                $validated['recurring_interval_count'] ?? 1
            );
        }

        $invoice = Invoice::create($validated);

        // Create items
        $subtotal = 0;
        foreach ($validated['items'] as $index => $itemData) {
            $total = $itemData['quantity'] * $itemData['unit_price'];
            $invoice->items()->create([
                'description' => $itemData['description'],
                'quantity' => $itemData['quantity'],
                'unit_price' => $itemData['unit_price'],
                'total' => $total,
                'sort_order' => $index,
            ]);
            $subtotal += $total;
        }

        // Update totals
        $invoice->subtotal = $subtotal;
        $invoice->total = $subtotal + ($validated['tax_amount'] ?? 0);
        $invoice->save();

        // Generate and email PDF if requested
        if ($request->boolean('send_email')) {
            $this->generateAndEmailInvoice($invoice);
        }

        return redirect()->route('invoices.index')
            ->with('success', 'Invoice created successfully.'.($request->boolean('send_email') ? ' PDF emailed to member.' : ''));
    }

    /**
     * Display the specified invoice.
     */
    public function show(Invoice $invoice)
    {
        $invoice->load(['member', 'items']);

        return Inertia::render('invoices/show', [
            'invoice' => $invoice,
        ]);
    }

    /**
     * Show the form for editing the specified invoice.
     */
    public function edit(Invoice $invoice)
    {
        $invoice->load(['member', 'items']);

        $members = Member::select('id', 'first_name', 'last_name', 'email')
            ->where('member_type', 'member')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        return Inertia::render('invoices/edit', [
            'invoice' => $invoice,
            'members' => $members,
        ]);
    }

    /**
     * Update the specified invoice.
     */
    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
            'invoice_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:invoice_date',
            'status' => 'required|in:draft,open,paid,overdue,cancelled',
            'tax_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'recurring' => 'boolean',
            'recurring_interval' => 'nullable|required_if:recurring,true|in:daily,weekly,monthly,yearly',
            'recurring_interval_count' => 'nullable|integer|min:1',
            'recurring_end_date' => 'nullable|date|after:invoice_date',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        // Calculate next invoice date if recurring changed
        if ($validated['recurring'] ?? false) {
            if (! $invoice->next_invoice_date || $request->get('recalculate_next_date')) {
                $invoiceDate = \Carbon\Carbon::parse($validated['invoice_date']);
                $validated['next_invoice_date'] = $this->calculateNextDate(
                    $invoiceDate,
                    $validated['recurring_interval'],
                    $validated['recurring_interval_count'] ?? 1
                );
            }
        } else {
            $validated['next_invoice_date'] = null;
        }

        $invoice->update($validated);

        // Delete old items and create new ones
        $invoice->items()->delete();

        $subtotal = 0;
        foreach ($validated['items'] as $index => $itemData) {
            $total = $itemData['quantity'] * $itemData['unit_price'];
            $invoice->items()->create([
                'description' => $itemData['description'],
                'quantity' => $itemData['quantity'],
                'unit_price' => $itemData['unit_price'],
                'total' => $total,
                'sort_order' => $index,
            ]);
            $subtotal += $total;
        }

        // Generate and email PDF if requested
        if ($request->boolean('send_email')) {
            $this->generateAndEmailInvoice($invoice);
        }

        return redirect()->route('invoices.index')
            ->with('success', 'Invoice updated successfully.'.($request->boolean('send_email') ? ' PDF emailed to member.' : ''));
    }

    /**
     * Remove the specified invoice.
     */
    public function destroy(Invoice $invoice)
    {
        $invoice->delete();

        return redirect()->route('invoices.index')
            ->with('success', 'Invoice deleted successfully.');
    }

    /**
     * Generate next recurring invoice manually.
     */
    public function generateNext(Invoice $invoice)
    {
        if (! $invoice->recurring) {
            return back()->with('error', 'This invoice is not set up for recurring.');
        }

        $newInvoice = $invoice->createNextRecurringInvoice();

        if (! $newInvoice) {
            return back()->with('error', 'Could not generate next invoice. Check if recurring period has ended.');
        }

        return redirect()->route('invoices.show', $newInvoice)
            ->with('success', 'Next recurring invoice generated successfully.');
    }

    /**
     * Calculate next date helper
     */
    protected function calculateNextDate($fromDate, $interval, $count)
    {
        $date = \Carbon\Carbon::parse($fromDate);

        switch ($interval) {
            case 'daily':
                return $date->addDays($count);
            case 'weekly':
                return $date->addWeeks($count);
            case 'monthly':
                return $date->addMonths($count);
            case 'yearly':
                return $date->addYears($count);
            default:
                return $date;
        }
    }

    /**
     * Generate invoice PDF and email it to the member
     */
    protected function generateAndEmailInvoice(Invoice $invoice)
    {
        $invoice->load(['member', 'items']);

        // Generate PDF HTML
        $html = view('invoices.pdf', ['invoice' => $invoice])->render();
        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper('letter', 'portrait');

        // Save PDF to temporary file
        $filename = 'invoice-'.$invoice->invoice_number.'.pdf';
        $tempPath = storage_path('app/temp/'.$filename);

        // Ensure temp directory exists
        if (! file_exists(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0755, true);
        }

        $pdf->save($tempPath);

        // Send email with PDF attachment
        try {
            Mail::to($invoice->member->email)
                ->send(new InvoiceMail($invoice, $tempPath));
        } finally {
            // Clean up temporary file
            if (file_exists($tempPath)) {
                unlink($tempPath);
            }
        }
    }

    /**
     * Display a printable invoice view.
     */
    public function print(Invoice $invoice)
    {
        $invoice->load(['member', 'items']);

        return view('invoices.print', [
            'invoice' => $invoice,
            'member' => $invoice->member,
        ]);
    }

    // ==================== API Methods ====================

    /**
     * API: List all invoices with pagination
     *
     * @group Invoices
     *
     * @authenticated
     */
    public function apiIndex(Request $request)
    {
        $search = $request->get('search');
        $status = $request->get('status');
        $memberId = $request->get('member');
        $perPage = $request->get('per_page', 15);

        $query = Invoice::query()
            ->with(['member', 'items'])
            ->orderBy('invoice_date', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhereHas('member', function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                    });
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($memberId) {
            $query->where('member_id', $memberId);
        }

        $invoices = $query->paginate($perPage);

        return response()->json($invoices);
    }

    /**
     * API: Get a single invoice
     *
     * @group Invoices
     *
     * @authenticated
     */
    public function apiShow(Invoice $invoice)
    {
        $invoice->load(['member', 'items', 'payments']);

        return response()->json([
            'data' => $invoice,
        ]);
    }

    /**
     * API: Create a new invoice
     *
     * @group Invoices
     *
     * @authenticated
     */
    public function apiStore(Request $request)
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
            'invoice_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:invoice_date',
            'status' => 'required|in:draft,open,paid,overdue,cancelled',
            'tax_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'recurring' => 'boolean',
            'recurring_interval' => 'nullable|required_if:recurring,true|in:daily,weekly,monthly,yearly',
            'recurring_interval_count' => 'nullable|integer|min:1',
            'recurring_end_date' => 'nullable|date|after:invoice_date',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        // Generate invoice number
        $validated['invoice_number'] = Invoice::generateInvoiceNumber();

        // Calculate next invoice date if recurring
        if ($validated['recurring'] ?? false) {
            $invoiceDate = \Carbon\Carbon::parse($validated['invoice_date']);
            $validated['next_invoice_date'] = $this->calculateNextDate(
                $invoiceDate,
                $validated['recurring_interval'],
                $validated['recurring_interval_count'] ?? 1
            );
        }

        $invoice = Invoice::create($validated);

        // Create items
        $subtotal = 0;
        foreach ($validated['items'] as $index => $itemData) {
            $total = $itemData['quantity'] * $itemData['unit_price'];
            $invoice->items()->create([
                'description' => $itemData['description'],
                'quantity' => $itemData['quantity'],
                'unit_price' => $itemData['unit_price'],
                'total' => $total,
                'sort_order' => $index,
            ]);
            $subtotal += $total;
        }

        // Update totals
        $invoice->subtotal = $subtotal;
        $invoice->total = $subtotal + ($validated['tax_amount'] ?? 0);
        $invoice->save();

        return response()->json([
            'message' => 'Invoice created successfully',
            'data' => $invoice->load(['member', 'items']),
        ], 201);
    }

    /**
     * API: Update an existing invoice
     *
     * @group Invoices
     *
     * @authenticated
     */
    public function apiUpdate(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'member_id' => 'sometimes|required|exists:members,id',
            'invoice_date' => 'sometimes|required|date',
            'due_date' => 'sometimes|required|date|after_or_equal:invoice_date',
            'status' => 'sometimes|required|in:draft,open,paid,overdue,cancelled',
            'tax_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'recurring' => 'sometimes|boolean',
            'recurring_interval' => 'nullable|required_if:recurring,true|in:daily,weekly,monthly,yearly',
            'recurring_interval_count' => 'nullable|integer|min:1',
            'recurring_end_date' => 'nullable|date|after:invoice_date',
            'items' => 'sometimes|required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        // Calculate next invoice date if recurring changed
        if (isset($validated['recurring']) && $validated['recurring']) {
            if (! $invoice->next_invoice_date || $request->get('recalculate_next_date')) {
                $invoiceDate = \Carbon\Carbon::parse($validated['invoice_date'] ?? $invoice->invoice_date);
                $validated['next_invoice_date'] = $this->calculateNextDate(
                    $invoiceDate,
                    $validated['recurring_interval'] ?? $invoice->recurring_interval,
                    $validated['recurring_interval_count'] ?? $invoice->recurring_interval_count ?? 1
                );
            }
        } elseif (isset($validated['recurring']) && ! $validated['recurring']) {
            $validated['next_invoice_date'] = null;
        }

        $invoice->update($validated);

        // Update items if provided
        if (isset($validated['items'])) {
            $invoice->items()->delete();

            $subtotal = 0;
            foreach ($validated['items'] as $index => $itemData) {
                $total = $itemData['quantity'] * $itemData['unit_price'];
                $invoice->items()->create([
                    'description' => $itemData['description'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'total' => $total,
                    'sort_order' => $index,
                ]);
                $subtotal += $total;
            }

            // Update totals
            $invoice->subtotal = $subtotal;
            $invoice->total = $subtotal + ($validated['tax_amount'] ?? $invoice->tax_amount ?? 0);
            $invoice->save();
        }

        return response()->json([
            'message' => 'Invoice updated successfully',
            'data' => $invoice->fresh(['member', 'items']),
        ]);
    }

    /**
     * API: Delete an invoice
     *
     * @group Invoices
     *
     * @authenticated
     */
    public function apiDestroy(Invoice $invoice)
    {
        $invoiceNumber = $invoice->invoice_number;
        $invoice->delete();

        return response()->json([
            'message' => "Invoice '{$invoiceNumber}' deleted successfully",
        ]);
    }
}
