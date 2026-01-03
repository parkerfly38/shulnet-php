<?php

namespace App\Exports;

use App\Models\Invoice;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class InvoicesExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Invoice::with('member');

        if (!empty($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }

        if (!empty($this->filters['start_date'])) {
            $query->where('invoice_date', '>=', $this->filters['start_date']);
        }

        if (!empty($this->filters['end_date'])) {
            $query->where('invoice_date', '<=', $this->filters['end_date']);
        }

        return $query->orderBy('invoice_date', 'desc')->get();
    }

    public function headings(): array
    {
        return [
            'Invoice Number',
            'Member Name',
            'Invoice Date',
            'Due Date',
            'Status',
            'Subtotal',
            'Tax Amount',
            'Total',
            'Recurring',
            'Notes',
            'Created At',
        ];
    }

    public function map($invoice): array
    {
        return [
            $invoice->invoice_number,
            $invoice->member ? $invoice->member->first_name . ' ' . $invoice->member->last_name : '',
            $invoice->invoice_date ? $invoice->invoice_date->format('Y-m-d') : '',
            $invoice->due_date ? $invoice->due_date->format('Y-m-d') : '',
            $invoice->status,
            $invoice->subtotal,
            $invoice->tax_amount,
            $invoice->total,
            $invoice->recurring ? 'Yes' : 'No',
            $invoice->notes,
            $invoice->created_at ? $invoice->created_at->format('Y-m-d H:i:s') : '',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
