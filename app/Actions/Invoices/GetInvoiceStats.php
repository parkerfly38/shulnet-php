<?php

namespace App\Actions\Invoices;

use App\Models\Invoice;

class GetInvoiceStats
{
    public function handle(): array
    {
        return [
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
    }
}
