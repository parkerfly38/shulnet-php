<?php

namespace App\Ai\Tools;

use App\Actions\Invoices\GetInvoiceStats;
use App\Actions\Invoices\ListInvoices;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Tools\Request;
use Stringable;

class SearchInvoices extends AdminTool
{
    public function __construct(
        protected ListInvoices $listInvoices,
        protected GetInvoiceStats $getInvoiceStats,
    ) {}

    public function description(): Stringable|string
    {
        return 'Search invoices by number, notes or member name, optionally filtered by status or member. '
            .'Also returns overall invoice totals by status (draft, open, paid, overdue, unpaid).';
    }

    protected function execute(Request $request): array
    {
        $results = $this->listInvoices->handle(
            $request['search'] ?? null,
            $request['status'] ?? null,
            $request['member_id'] ?? null,
            $this->limit($request),
        );

        return [
            'total' => $results->total(),
            'invoices' => $results->getCollection()->map(fn ($i) => [
                'id' => $i->id,
                'invoice_number' => $i->invoice_number,
                'member' => $i->member ? trim("{$i->member->first_name} {$i->member->last_name}") : null,
                'status' => $i->status,
                'invoice_date' => $i->invoice_date,
                'total' => $i->total,
            ])->values(),
            'overall_stats' => $this->getInvoiceStats->handle(),
        ];
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'search' => $schema->string()->description('Invoice number, notes, or member name.'),
            'status' => $schema->string()->enum(['draft', 'open', 'paid', 'overdue'])->description('Invoice status.'),
            'member_id' => $schema->integer()->description('Restrict to one member id.'),
            'limit' => $schema->integer()->description('Max results (default 10, max 25).'),
        ];
    }
}
