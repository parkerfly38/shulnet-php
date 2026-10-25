<?php

namespace App\Actions\Invoices;

use App\Models\Invoice;
use Illuminate\Pagination\LengthAwarePaginator;

class ListInvoices
{
    public function handle(
        ?string $search = null,
        ?string $status = null,
        int|string|null $memberId = null,
        int $perPage = 15,
    ): LengthAwarePaginator {
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

        return $query->paginate($perPage);
    }
}
