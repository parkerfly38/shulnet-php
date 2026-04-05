<?php

namespace App\Exports;

use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class GLBatchExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected $startDate;

    protected $endDate;

    protected $batchNumber;

    public function __construct($startDate, $endDate, $batchNumber = null)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->batchNumber = $batchNumber ?? now()->format('Ymd-His');
    }

    public function collection()
    {
        // Get all payments within date range with related invoice items and GL accounts
        $payments = Payment::with([
            'invoice.items.glAccount',
            'invoice.member',
            'member',
        ])
            ->whereBetween('paid_at', [$this->startDate, $this->endDate])
            ->where('status', 'completed')
            ->orderBy('paid_at')
            ->get();

        // Transform payments into GL transactions
        $transactions = new Collection();

        foreach ($payments as $payment) {
            if (! $payment->invoice) {
                continue;
            }

            // Each payment creates multiple GL entries based on invoice items
            foreach ($payment->invoice->items as $item) {
                if (! $item->glAccount) {
                    // Skip items without GL account assignment
                    continue;
                }

                // Calculate proportional amount for this item
                $itemTotal = (float) $item->total;
                $invoiceTotal = (float) $payment->invoice->total;
                $paymentAmount = (float) $payment->amount;

                // Proportional allocation of payment to this line item
                $allocatedAmount = $invoiceTotal > 0
                    ? ($itemTotal / $invoiceTotal) * $paymentAmount
                    : 0;

                $transactions->push([
                    'payment_id' => $payment->id,
                    'invoice_id' => $payment->invoice->id,
                    'invoice_number' => $payment->invoice->invoice_number,
                    'member_id' => $payment->member->id ?? null,
                    'member_name' => $payment->member
                        ? "{$payment->member->first_name} {$payment->member->last_name}"
                        : '',
                    'transaction_date' => $payment->paid_at,
                    'gl_account_code' => $item->glAccount->account_code,
                    'gl_account_name' => $item->glAccount->account_name,
                    'description' => $item->description,
                    'amount' => $allocatedAmount,
                    'payment_method' => $payment->payment_method,
                    'transaction_id' => $payment->transaction_id,
                ]);
            }
        }

        // Also get invoices with amount_paid but no payment records
        // These are invoices marked as paid without detailed payment tracking
        $invoicesWithDirectPayment = Invoice::with(['items.glAccount', 'member'])
            ->whereHas('items', function ($query) {
                $query->whereNotNull('gl_account_id');
            })
            ->whereBetween('invoice_date', [$this->startDate, $this->endDate])
            ->where(function ($query) {
                $query->where('amount_paid', '>', 0)
                    ->orWhereIn('status', ['paid']);
            })
            ->whereDoesntHave('payments')
            ->get();

        foreach ($invoicesWithDirectPayment as $invoice) {
            $amountPaid = (float) ($invoice->amount_paid ?? $invoice->total);

            foreach ($invoice->items as $item) {
                if (! $item->glAccount) {
                    continue;
                }

                // Calculate proportional amount for this item
                $itemTotal = (float) $item->total;
                $invoiceTotal = (float) $invoice->total;

                // Proportional allocation of payment to this line item
                $allocatedAmount = $invoiceTotal > 0
                    ? ($itemTotal / $invoiceTotal) * $amountPaid
                    : 0;

                $transactions->push([
                    'payment_id' => null,
                    'invoice_id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'member_id' => $invoice->member->id ?? null,
                    'member_name' => $invoice->member
                        ? "{$invoice->member->first_name} {$invoice->member->last_name}"
                        : '',
                    'transaction_date' => $invoice->invoice_date,
                    'gl_account_code' => $item->glAccount->account_code,
                    'gl_account_name' => $item->glAccount->account_name,
                    'description' => $item->description,
                    'amount' => $allocatedAmount,
                    'payment_method' => 'direct',
                    'transaction_id' => null,
                ]);
            }
        }

        return $transactions->sortBy('transaction_date')->values();
    }

    public function headings(): array
    {
        return [
            'Batch Number',
            'Transaction Date',
            'GL Account Code',
            'GL Account Name',
            'Description',
            'Debit Amount',
            'Credit Amount',
            'Reference (Invoice #)',
            'Member ID',
            'Member Name',
            'Payment Method',
            'Transaction ID',
        ];
    }

    public function map($transaction): array
    {
        // Determine if this is a debit or credit based on account type
        // For revenue accounts, incoming payments are credits
        // We're tracking revenue, so amounts go to credit column
        $debitAmount = 0;
        $creditAmount = abs($transaction['amount']);

        return [
            $this->batchNumber,
            $transaction['transaction_date']->format('Y-m-d'),
            $transaction['gl_account_code'],
            $transaction['gl_account_name'],
            $transaction['description'],
            number_format($debitAmount, 2, '.', ''),
            number_format($creditAmount, 2, '.', ''),
            $transaction['invoice_number'],
            $transaction['member_id'],
            $transaction['member_name'],
            ucfirst(str_replace('_', ' ', $transaction['payment_method'])),
            $transaction['transaction_id'] ?? '',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E0E0E0'],
                ],
            ],
        ];
    }

    public function title(): string
    {
        return 'GL Batch ' . $this->batchNumber;
    }
}
