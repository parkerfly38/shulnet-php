<?php

namespace Tests\Unit\Services;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Member;
use App\Models\Payment;
use App\Models\Student;
use App\Services\FinancialReportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinancialReportServiceTest extends TestCase
{
    use RefreshDatabase;

    private function service(): FinancialReportService
    {
        return app(FinancialReportService::class);
    }

    /** @param array<int, array{0: string, 1: float|int, 2?: int}> $items [description, unit price, quantity] */
    private function invoice(array $items, array $attrs = []): Invoice
    {
        $total = array_sum(array_map(fn ($i) => $i[1] * ($i[2] ?? 1), $items));

        $invoice = Invoice::create(array_merge([
            'invoice_number' => Invoice::generateInvoiceNumber(),
            'member_id' => Member::factory()->create()->id,
            'invoice_date' => '2026-03-15',
            'due_date' => '2026-04-15',
            'status' => 'open',
            'subtotal' => $total,
            'tax_amount' => 0,
            'total' => $total,
            'amount_paid' => 0,
        ], $attrs));

        foreach ($items as $item) {
            [$description, $price] = $item;
            $qty = $item[2] ?? 1;

            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'description' => $description,
                'quantity' => $qty,
                'unit_price' => $price,
                'total' => $price * $qty,
            ]);
        }

        return $invoice;
    }

    public function test_income_summary_categorizes_items_and_respects_status_and_dates(): void
    {
        $this->invoice([['Family Membership Dues', 360], ['Hebrew School Tuition', 500], ['Gala Event Ticket', 100, 2], ['Building Donation', 50], ['Kiddush Sponsor', 25]]);
        $this->invoice([['Membership', 1000]], ['status' => 'draft']);
        $this->invoice([['Membership', 1000]], ['status' => 'cancelled']);
        $this->invoice([['Membership', 1000]], ['invoice_date' => '2025-01-01']);

        $r = $this->service()->getIncomeSummary('2026-01-01', '2026-12-31');

        $this->assertEquals(360, $r['categories']['membership_dues']);
        $this->assertEquals(500, $r['categories']['tuition']);
        $this->assertEquals(200, $r['categories']['event_revenue']);
        $this->assertEquals(50, $r['categories']['donations']);
        $this->assertEquals(25, $r['categories']['other_income']);
        $this->assertEquals(1135, $r['total_revenue']);
        $this->assertSame(1, $r['invoice_count']);
    }

    public function test_income_summary_is_zero_when_there_is_no_data(): void
    {
        $r = $this->service()->getIncomeSummary('2026-01-01', '2026-12-31');

        $this->assertEquals(0, $r['total_revenue']);
        $this->assertSame(0, $r['invoice_count']);
    }

    public function test_revenue_by_source_computes_percentages_sorted_descending(): void
    {
        $this->invoice([['Membership Dues', 300], ['Donation', 100]]);

        $r = $this->service()->getRevenueBySource('2026-01-01', '2026-12-31');

        $this->assertEquals(400, $r['total_revenue']);
        $this->assertSame('Membership Dues', $r['breakdown'][0]['category']);
        $this->assertEquals(75, $r['breakdown'][0]['percentage']);
        $this->assertEquals(25, $r['breakdown'][1]['percentage']);
    }

    public function test_revenue_by_source_handles_zero_revenue(): void
    {
        $r = $this->service()->getRevenueBySource('2026-01-01', '2026-12-31');

        $this->assertEquals(0, $r['total_revenue']);
        $this->assertEquals(0, $r['breakdown'][0]['percentage']);
    }

    public function test_outstanding_balances_group_by_member_and_exclude_paid_and_cancelled(): void
    {
        $member = Member::factory()->create(['first_name' => 'Ruth', 'last_name' => 'Cohen']);
        $this->invoice([['Dues', 200]], ['member_id' => $member->id, 'amount_paid' => 50, 'invoice_date' => '2026-02-01']);
        $this->invoice([['Dues', 100]], ['member_id' => $member->id, 'invoice_date' => '2026-01-01']);
        $other = Member::factory()->create();
        $this->invoice([['Dues', 40]], ['member_id' => $other->id]);
        $this->invoice([['Dues', 999]], ['status' => 'paid', 'amount_paid' => 999]);
        $this->invoice([['Dues', 999]], ['status' => 'cancelled']);

        $r = $this->service()->getOutstandingBalances();

        $this->assertSame(2, $r['member_count']);
        $this->assertEquals(290, $r['total_outstanding']);
        $this->assertSame('Ruth Cohen', $r['balances'][0]['member_name']);
        $this->assertEquals(250, $r['balances'][0]['total_owed']);
        $this->assertSame(2, $r['balances'][0]['invoice_count']);
        $this->assertSame('2026-01-01', $r['balances'][0]['oldest_invoice_date']);
    }

    public function test_outstanding_balances_min_balance_filters_small_invoices(): void
    {
        $this->invoice([['Dues', 10]]);
        $this->invoice([['Dues', 500]]);

        $r = $this->service()->getOutstandingBalances(100);

        $this->assertSame(1, $r['member_count']);
        $this->assertEquals(500, $r['total_outstanding']);
    }

    public function test_aging_report_places_invoices_in_buckets_by_days_past_due(): void
    {
        $due = fn (int $daysAgo) => now()->subDays($daysAgo)->toDateString();
        $this->invoice([['Dues', 10]], ['due_date' => now()->addDays(5)->toDateString()]);
        $this->invoice([['Dues', 20]], ['due_date' => $due(20)]);
        $this->invoice([['Dues', 30]], ['due_date' => $due(45)]);
        $this->invoice([['Dues', 40]], ['due_date' => $due(75)]);
        $this->invoice([['Dues', 50]], ['due_date' => $due(120)]);
        $this->invoice([['Dues', 999]], ['status' => 'paid', 'amount_paid' => 999, 'due_date' => $due(200)]);

        $r = $this->service()->getAgingReport();
        $b = $r['aging_buckets'];

        $this->assertSame(2, $b['current']['count']);
        $this->assertEquals(30, $b['current']['total']);
        $this->assertEquals(30, $b['31_60']['total']);
        $this->assertEquals(40, $b['61_90']['total']);
        $this->assertEquals(50, $b['over_90']['total']);
        $this->assertEquals(150, $r['total_outstanding']);
    }

    public function test_event_revenue_aggregates_ticket_items(): void
    {
        $this->invoice([['Gala Ticket - Member', 75, 2], ['Gala Ticket - Guest', 100], ['Dues', 360]]);
        $this->invoice([['Gala Ticket - Member', 75]]);

        $r = $this->service()->getEventRevenue('2026-01-01', '2026-12-31');

        $this->assertEquals(325, $r['total_revenue']);
        $this->assertEquals(4, $r['total_attendees']);
        $this->assertSame(2, $r['event_count']);
        $this->assertEquals(162.5, $r['average_revenue_per_event']);
        $this->assertSame('Gala Ticket - Member', $r['events'][0]['event_name']);
        $this->assertEquals(225, $r['events'][0]['revenue']);
        $this->assertEquals(75, $r['events'][0]['average_ticket_price']);
    }

    public function test_event_revenue_with_no_events_is_empty(): void
    {
        $r = $this->service()->getEventRevenue('2026-01-01', '2026-12-31');

        $this->assertSame(0, $r['event_count']);
        $this->assertEquals(0, $r['average_revenue_per_event']);
    }

    public function test_member_growth_counts_new_members_and_growth_rate(): void
    {
        Member::factory()->count(4)->create(['member_type' => 'member', 'created_at' => '2025-06-01']);
        Member::factory()->count(2)->create(['member_type' => 'member', 'created_at' => '2026-03-01']);
        Member::factory()->create(['member_type' => 'contact', 'created_at' => '2026-03-01']);

        $r = $this->service()->getMemberGrowth('2026-01-01', '2026-12-31');

        $this->assertSame(4, $r['starting_members']);
        $this->assertSame(2, $r['new_members']);
        $this->assertSame(6, $r['current_total']);
        $this->assertSame(2, $r['net_change']);
        $this->assertSame(0, $r['members_lost']);
        $this->assertEquals(50, $r['growth_rate']);
        $this->assertSame(6, $r['by_type']['member']);
    }

    public function test_member_growth_from_zero_starting_members(): void
    {
        Member::factory()->create(['member_type' => 'member', 'created_at' => '2026-03-01']);

        $this->assertEquals(100, $this->service()->getMemberGrowth('2026-01-01', '2026-12-31')['growth_rate']);
        $this->assertEquals(0, $this->service()->getMemberGrowth('2025-01-01', '2025-12-31')['starting_members']);
    }

    public function test_tuition_revenue_reports_collection_rate(): void
    {
        Student::create(['first_name' => 'A', 'last_name' => 'B']);
        $this->invoice([['Hebrew School Tuition', 1000]], ['amount_paid' => 250]);
        $this->invoice([['Dues', 5000]]);

        $r = $this->service()->getTuitionRevenue();

        $this->assertSame(1, $r['total_students']);
        $this->assertEquals(1000, $r['projected_revenue']);
        $this->assertEquals(250, $r['collected_revenue']);
        $this->assertEquals(750, $r['outstanding_revenue']);
        $this->assertEquals(25, $r['collection_rate']);
    }

    public function test_tuition_revenue_with_no_invoices_has_zero_collection_rate(): void
    {
        $this->assertEquals(0, $this->service()->getTuitionRevenue()['collection_rate']);
    }

    public function test_payment_method_analysis_only_counts_completed_payments_in_range(): void
    {
        $invoice = $this->invoice([['Dues', 1000]]);
        $pay = fn (float $amount, string $method, string $status = 'completed', string $paidAt = '2026-03-20') => Payment::create([
            'invoice_id' => $invoice->id,
            'member_id' => $invoice->member_id,
            'amount' => $amount,
            'payment_method' => $method,
            'status' => $status,
            'paid_at' => $paidAt,
        ]);
        $pay(300, 'credit_card');
        $pay(100, 'credit_card');
        $pay(100, 'check');
        $pay(999, 'check', 'failed');
        $pay(999, 'check', 'completed', '2025-01-01');

        $r = $this->service()->getPaymentMethodAnalysis('2026-01-01', '2026-12-31');

        $this->assertEquals(500, $r['total_revenue']);
        $this->assertSame(3, $r['total_transactions']);
        $card = collect($r['breakdown'])->firstWhere('method', 'Credit Card');
        $this->assertSame(2, $card['count']);
        $this->assertEquals(80, $card['percentage_of_revenue']);
        $this->assertEquals(200, $card['average_transaction']);
    }

    public function test_budget_vs_actual_computes_variance(): void
    {
        $this->invoice([['Membership Dues', 800]]);

        $r = $this->service()->getBudgetVsActual(['membership_dues' => 1000, 'donations' => 0], '2026-01-01', '2026-12-31');

        $dues = $r['comparison'][0];
        $this->assertEquals(-200, $dues['variance']);
        $this->assertEquals(80, $dues['percent_of_budget']);
        $this->assertEquals(0, $r['comparison'][1]['percent_of_budget']);
        $this->assertEquals(1000, $r['total_budget']);
        $this->assertEquals(800, $r['total_actual']);
    }
}
