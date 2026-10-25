<?php

namespace App\Ai\Tools;

use App\Services\FinancialReportService;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Carbon;
use Laravel\Ai\Tools\Request;
use Stringable;

class FinancialReport extends AdminTool
{
    private const DATE_REPORTS = [
        'income_summary', 'revenue_by_source', 'payment_methods', 'event_revenue', 'member_growth',
    ];

    public function __construct(protected FinancialReportService $reports) {}

    public function description(): Stringable|string
    {
        return 'Run a financial report. Reports: income_summary (revenue by category), revenue_by_source, '
            .'payment_methods, event_revenue and member_growth (these need start_date and end_date), '
            .'outstanding_balances (who owes money, optional min_balance), aging (unpaid invoices by age), '
            .'and tuition_revenue (dates optional). Today is '.now()->toDateString().'.';
    }

    protected function execute(Request $request): array
    {
        $report = $request['report'] ?? null;
        $start = $request['start_date'] ?? null;
        $end = $request['end_date'] ?? null;

        if (in_array($report, self::DATE_REPORTS, true)) {
            if (! $this->validDate($start) || ! $this->validDate($end) || Carbon::parse($end)->lt(Carbon::parse($start))) {
                return ['error' => "The {$report} report needs valid start_date and end_date (YYYY-MM-DD), with end on or after start."];
            }
        }

        $result = match ($report) {
            'income_summary' => $this->reports->getIncomeSummary($start, $end),
            'revenue_by_source' => $this->reports->getRevenueBySource($start, $end),
            'payment_methods' => $this->reports->getPaymentMethodAnalysis($start, $end),
            'event_revenue' => $this->reports->getEventRevenue($start, $end),
            'member_growth' => $this->reports->getMemberGrowth($start, $end),
            'outstanding_balances' => $this->reports->getOutstandingBalances((float) ($request['min_balance'] ?? 0)),
            'aging' => $this->reports->getAgingReport(),
            'tuition_revenue' => $this->reports->getTuitionRevenue(
                $this->validDate($start) ? $start : null,
                $this->validDate($end) ? $end : null,
            ),
            default => null,
        };

        if ($result === null) {
            return ['error' => 'Unknown report. Valid reports: income_summary, revenue_by_source, payment_methods, '
                .'event_revenue, member_growth, outstanding_balances, aging, tuition_revenue.'];
        }

        return $this->truncateLists($result);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'report' => $schema->string()->required()->enum([
                'income_summary', 'revenue_by_source', 'payment_methods', 'event_revenue',
                'member_growth', 'outstanding_balances', 'aging', 'tuition_revenue',
            ])->description('Which report to run.'),
            'start_date' => $schema->string()->description('Start date, YYYY-MM-DD.'),
            'end_date' => $schema->string()->description('End date, YYYY-MM-DD.'),
            'min_balance' => $schema->number()->description('outstanding_balances only: ignore balances below this amount.'),
        ];
    }

    private function validDate(mixed $value): bool
    {
        if (! is_string($value) || ! preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            return false;
        }

        try {
            return Carbon::createFromFormat('Y-m-d', $value)->format('Y-m-d') === $value;
        } catch (\Throwable) {
            return false;
        }
    }

    /**
     * Keep the model's context small: cap any list of rows at 25 and note how many were dropped.
     */
    private function truncateLists(array $data): array
    {
        foreach ($data as $key => $value) {
            if (is_array($value) && array_is_list($value) && count($value) > 25) {
                $data[$key] = array_slice($value, 0, 25);
                $data["{$key}_truncated"] = 'Showing 25 of '.count($value);
            } elseif (is_array($value) && ! array_is_list($value)) {
                $data[$key] = $this->truncateLists($value);
            }
        }

        return $data;
    }
}
