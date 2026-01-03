<?php

namespace App\Exports;

use App\Models\Invoice;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class FinancialSummaryExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $startDate;
    protected $endDate;

    public function __construct($startDate, $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        return Invoice::with('member')
            ->whereBetween('invoice_date', [$this->startDate, $this->endDate])
            ->orderBy('invoice_date', 'desc')
            ->get();
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
            'Tax',
            'Total',
            'Aging Category',
            'Days Since Invoice',
        ];
    }

    public function map($invoice): array
    {
        $daysOld = now()->diffInDays($invoice->invoice_date);
        $agingCategory = 'Current';
        
        if ($invoice->status !== 'paid' && $invoice->due_date && $invoice->due_date->isPast()) {
            $daysOverdue = now()->diffInDays($invoice->due_date);
            if ($daysOverdue <= 30) {
                $agingCategory = '1-30 days';
            } elseif ($daysOverdue <= 60) {
                $agingCategory = '31-60 days';
            } elseif ($daysOverdue <= 90) {
                $agingCategory = '61-90 days';
            } else {
                $agingCategory = '90+ days';
            }
        }

        return [
            $invoice->invoice_number,
            $invoice->member ? $invoice->member->first_name . ' ' . $invoice->member->last_name : '',
            $invoice->invoice_date ? $invoice->invoice_date->format('Y-m-d') : '',
            $invoice->due_date ? $invoice->due_date->format('Y-m-d') : '',
            $invoice->status,
            $invoice->subtotal,
            $invoice->tax_amount,
            $invoice->total,
            $agingCategory,
            $daysOld,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
