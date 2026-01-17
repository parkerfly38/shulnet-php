<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Show payment form for an invoice
     */
    public function create(Request $request, $invoiceId)
    {
        $user = $request->user();
        $member = $user->member;

        if (! $member) {
            abort(403, 'You must have a member profile to make payments.');
        }

        $invoice = Invoice::with('items')->findOrFail($invoiceId);

        // Verify the invoice belongs to this member
        if ($invoice->member_id !== $member->id) {
            abort(403, 'You do not have permission to pay this invoice.');
        }

        // Check if invoice is already paid
        if ($invoice->status === 'paid') {
            return redirect()->route('member.invoices.show', $invoice->id)
                ->with('error', 'This invoice has already been paid.');
        }

        $processor = $this->paymentService->getActiveProcessor();

        return Inertia::render('member/payment', [
            'invoice' => array_merge($invoice->toArray(), [
                'balance' => $invoice->balance,
            ]),
            'member' => $member,
            'processor' => $processor,
            'stripePublicKey' => config('services.stripe.public_key'),
        ]);
    }

    /**
     * Process the payment
     */
    public function store(Request $request, $invoiceId)
    {
        $user = $request->user();
        $member = $user->member;

        if (! $member) {
            abort(403, 'You must have a member profile to make payments.');
        }

        $invoice = Invoice::findOrFail($invoiceId);

        // Verify the invoice belongs to this member
        if ($invoice->member_id !== $member->id) {
            abort(403, 'You do not have permission to pay this invoice.');
        }

        // Check if invoice is already paid
        if ($invoice->status === 'paid') {
            return back()->with('error', 'This invoice has already been paid.');
        }

        // Validate payment amount
        $request->validate([
            'amount' => 'required|numeric|min:0.01|max:'.$invoice->balance,
        ]);

        $paymentAmount = (float) $request->amount;

        $processor = $this->paymentService->getActiveProcessor();

        // Prepare payment details based on processor
        $paymentDetails = [
            'invoice_id' => $invoice->id,
            'member_id' => $member->id,
            'description' => "Invoice #{$invoice->invoice_number}",
        ];

        // Add processor-specific details
        if ($processor === 'stripe') {
            $request->validate([
                'payment_method_id' => 'required|string',
            ]);
            $paymentDetails['payment_method_id'] = $request->payment_method_id;
        } elseif ($processor === 'authorize_net') {
            $request->validate([
                'card_number' => 'required|string',
                'expiration_date' => 'required|string',
                'cvv' => 'required|string',
            ]);
            $paymentDetails = array_merge($paymentDetails, [
                'card_number' => $request->card_number,
                'expiration_date' => $request->expiration_date,
                'cvv' => $request->cvv,
            ]);
        } elseif ($processor === 'paypal') {
            $request->validate([
                'order_id' => 'required|string',
            ]);
            $paymentDetails['order_id'] = $request->order_id;
        }

        // Process the payment
        $result = $this->paymentService->processPayment($paymentAmount, $paymentDetails);

        if ($result['success']) {
            // Create payment record
            $payment = Payment::create([
                'invoice_id' => $invoice->id,
                'member_id' => $member->id,
                'amount' => $paymentAmount,
                'payment_method' => $processor,
                'transaction_id' => $result['transaction_id'] ?? $result['order_id'] ?? null,
                'status' => 'completed',
                'payment_details' => $result['details'] ?? null,
                'paid_at' => now(),
            ]);

            // Update invoice amount_paid and status
            $newAmountPaid = $invoice->amount_paid + $paymentAmount;
            $newStatus = $newAmountPaid >= $invoice->total ? 'paid' : 'partial';

            $invoice->update([
                'amount_paid' => $newAmountPaid,
                'status' => $newStatus,
            ]);

            $message = $newStatus === 'paid'
                ? 'Payment processed successfully! Invoice is now fully paid.'
                : 'Partial payment processed successfully!';

            return redirect()->route('member.invoices.show', $invoice->id)
                ->with('success', $message);
        } else {
            // Create failed payment record
            Payment::create([
                'invoice_id' => $invoice->id,
                'member_id' => $member->id,
                'amount' => $paymentAmount,
                'payment_method' => $processor,
                'status' => 'failed',
                'payment_details' => ['error' => $result['error']],
            ]);

            return back()->with('error', 'Payment failed: '.($result['error'] ?? 'Unknown error'));
        }
    }

    /**
     * Get Stripe setup intent for payment method
     */
    public function setupIntent(Request $request)
    {
        if ($this->paymentService->getActiveProcessor() !== 'stripe') {
            abort(403, 'Stripe is not the active payment processor.');
        }

        \Stripe\Stripe::setApiKey(config('services.stripe.secret_key'));

        $intent = \Stripe\SetupIntent::create();

        return response()->json([
            'client_secret' => $intent->client_secret,
        ]);
    }
}
