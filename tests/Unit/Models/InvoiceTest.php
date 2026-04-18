<?php

namespace Tests\Unit\Models;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Member;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_balance_attribute_calculates_correctly()
    {
        $invoice = Invoice::factory()->create([
            'total' => 100.00,
            'amount_paid' => 30.00,
        ]);

        $this->assertEquals(70.00, $invoice->balance);
    }

    public function test_balance_is_zero_when_fully_paid()
    {
        $invoice = Invoice::factory()->create([
            'total' => 100.00,
            'amount_paid' => 100.00,
        ]);

        $this->assertEquals(0.00, $invoice->balance);
    }

    public function test_is_fully_paid_returns_true_when_balance_is_zero()
    {
        $invoice = Invoice::factory()->create([
            'total' => 100.00,
            'amount_paid' => 100.00,
        ]);

        $this->assertTrue($invoice->isFullyPaid());
    }

    public function test_is_fully_paid_returns_true_when_overpaid()
    {
        $invoice = Invoice::factory()->create([
            'total' => 100.00,
            'amount_paid' => 110.00,
        ]);

        $this->assertTrue($invoice->isFullyPaid());
    }

    public function test_is_fully_paid_returns_false_when_balance_exists()
    {
        $invoice = Invoice::factory()->create([
            'total' => 100.00,
            'amount_paid' => 50.00,
        ]);

        $this->assertFalse($invoice->isFullyPaid());
    }

    public function test_has_partial_payment_returns_true_when_partially_paid()
    {
        $invoice = Invoice::factory()->create([
            'total' => 100.00,
            'amount_paid' => 30.00,
        ]);

        $this->assertTrue($invoice->hasPartialPayment());
    }

    public function test_has_partial_payment_returns_false_when_not_paid()
    {
        $invoice = Invoice::factory()->create([
            'total' => 100.00,
            'amount_paid' => 0.00,
        ]);

        $this->assertFalse($invoice->hasPartialPayment());
    }

    public function test_has_partial_payment_returns_false_when_fully_paid()
    {
        $invoice = Invoice::factory()->create([
            'total' => 100.00,
            'amount_paid' => 100.00,
        ]);

        $this->assertFalse($invoice->hasPartialPayment());
    }

    public function test_is_overdue_returns_true_when_past_due_date_and_unpaid()
    {
        $invoice = Invoice::factory()->create([
            'due_date' => now()->subDays(5),
            'status' => 'open',
        ]);

        $this->assertTrue($invoice->isOverdue());
    }

    public function test_is_overdue_returns_false_when_paid()
    {
        $invoice = Invoice::factory()->create([
            'due_date' => now()->subDays(5),
            'status' => 'paid',
        ]);

        $this->assertFalse($invoice->isOverdue());
    }

    public function test_is_overdue_returns_false_when_not_past_due()
    {
        $invoice = Invoice::factory()->create([
            'due_date' => now()->addDays(5),
            'status' => 'open',
        ]);

        $this->assertFalse($invoice->isOverdue());
    }

    public function test_calculate_totals_sums_items_correctly()
    {
        $invoice = Invoice::factory()->create([
            'subtotal' => 0,
            'tax_amount' => 10.00,
            'total' => 0,
        ]);

        InvoiceItem::factory()->create([
            'invoice_id' => $invoice->id,
            'total' => 50.00,
        ]);

        InvoiceItem::factory()->create([
            'invoice_id' => $invoice->id,
            'total' => 30.00,
        ]);

        $invoice->refresh();
        $invoice->calculateTotals();

        $this->assertEquals(80.00, $invoice->subtotal);
        $this->assertEquals(90.00, $invoice->total); // subtotal + tax
    }

    public function test_generate_invoice_number_creates_first_number()
    {
        $number = Invoice::generateInvoiceNumber();

        $this->assertEquals('INV-000001', $number);
    }

    public function test_generate_invoice_number_increments_correctly()
    {
        Invoice::factory()->create(['invoice_number' => 'INV-000005']);

        $number = Invoice::generateInvoiceNumber();

        $this->assertEquals('INV-000006', $number);
    }

    public function test_generate_invoice_number_handles_large_numbers()
    {
        Invoice::factory()->create(['invoice_number' => 'INV-099999']);

        $number = Invoice::generateInvoiceNumber();

        $this->assertEquals('INV-100000', $number);
    }

    public function test_invoice_relationships_load_correctly()
    {
        $member = Member::factory()->create();
        $invoice = Invoice::factory()->create(['member_id' => $member->id]);
        
        InvoiceItem::factory()->count(3)->create(['invoice_id' => $invoice->id]);
        Payment::factory()->count(2)->create(['invoice_id' => $invoice->id]);

        $invoice->load(['member', 'items', 'payments']);

        $this->assertInstanceOf(Member::class, $invoice->member);
        $this->assertCount(3, $invoice->items);
        $this->assertCount(2, $invoice->payments);
    }

    public function test_recurring_invoice_does_not_create_when_not_recurring()
    {
        $invoice = Invoice::factory()->create([
            'recurring' => false,
        ]);

        $nextInvoice = $invoice->createNextRecurringInvoice();

        $this->assertNull($nextInvoice);
    }

    public function test_recurring_invoice_does_not_create_when_past_end_date()
    {
        $invoice = Invoice::factory()->create([
            'recurring' => true,
            'next_invoice_date' => now()->addMonth(),
            'recurring_end_date' => now()->subMonth(),
        ]);

        $nextInvoice = $invoice->createNextRecurringInvoice();

        $this->assertNull($nextInvoice);
    }
}
