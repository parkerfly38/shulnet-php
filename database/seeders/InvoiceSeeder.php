<?php

namespace Database\Seeders;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Member;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class InvoiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $members = Member::all();

        if ($members->isEmpty()) {
            $this->command->warn('No members found. Skipping invoice seeding.');

            return;
        }

        // Create a paid invoice
        $invoice1 = Invoice::create([
            'member_id' => $members->first()->id,
            'invoice_number' => 'INV-000001',
            'invoice_date' => Carbon::now()->subMonths(2),
            'due_date' => Carbon::now()->subMonths(1)->addDays(15),
            'status' => 'paid',
            'subtotal' => 500.00,
            'tax_amount' => 0.00,
            'total' => 500.00,
            'notes' => 'Annual membership dues',
            'recurring' => false,
        ]);

        InvoiceItem::create([
            'invoice_id' => $invoice1->id,
            'description' => 'Annual Membership',
            'quantity' => 1,
            'unit_price' => 500.00,
            'total' => 500.00,
            'sort_order' => 1,
        ]);

        // Create an open invoice
        $invoice2 = Invoice::create([
            'member_id' => $members->count() > 1 ? $members->get(1)->id : $members->first()->id,
            'invoice_number' => 'INV-000002',
            'invoice_date' => Carbon::now()->subDays(10),
            'due_date' => Carbon::now()->addDays(20),
            'status' => 'open',
            'subtotal' => 750.00,
            'tax_amount' => 0.00,
            'total' => 750.00,
            'notes' => 'School tuition and fees',
            'recurring' => false,
        ]);

        InvoiceItem::create([
            'invoice_id' => $invoice2->id,
            'description' => 'School Tuition - Fall Semester',
            'quantity' => 1,
            'unit_price' => 600.00,
            'total' => 600.00,
            'sort_order' => 1,
        ]);

        InvoiceItem::create([
            'invoice_id' => $invoice2->id,
            'description' => 'Registration Fee',
            'quantity' => 1,
            'unit_price' => 150.00,
            'total' => 150.00,
            'sort_order' => 2,
        ]);

        // Create an overdue invoice
        $invoice3 = Invoice::create([
            'member_id' => $members->count() > 2 ? $members->get(2)->id : $members->first()->id,
            'invoice_number' => 'INV-000003',
            'invoice_date' => Carbon::now()->subMonths(1),
            'due_date' => Carbon::now()->subDays(5),
            'status' => 'overdue',
            'subtotal' => 250.00,
            'tax_amount' => 0.00,
            'total' => 250.00,
            'notes' => 'Event ticket purchase',
            'recurring' => false,
        ]);

        InvoiceItem::create([
            'invoice_id' => $invoice3->id,
            'description' => 'Gala Dinner Tickets (x2)',
            'quantity' => 2,
            'unit_price' => 125.00,
            'total' => 250.00,
            'sort_order' => 1,
        ]);

        // Create a recurring invoice
        $invoice4 = Invoice::create([
            'member_id' => $members->count() > 3 ? $members->get(3)->id : $members->first()->id,
            'invoice_number' => 'INV-000004',
            'invoice_date' => Carbon::now(),
            'due_date' => Carbon::now()->addDays(30),
            'status' => 'open',
            'subtotal' => 100.00,
            'tax_amount' => 0.00,
            'total' => 100.00,
            'notes' => 'Monthly sustaining donation',
            'recurring' => true,
            'recurring_interval' => 'monthly',
            'recurring_interval_count' => 1,
            'next_invoice_date' => Carbon::now()->addMonth(),
            'last_invoice_date' => Carbon::now(),
            'recurring_end_date' => null,
        ]);

        InvoiceItem::create([
            'invoice_id' => $invoice4->id,
            'description' => 'Monthly Sustaining Donation',
            'quantity' => 1,
            'unit_price' => 100.00,
            'total' => 100.00,
            'sort_order' => 1,
        ]);

        // Create a draft invoice
        $invoice5 = Invoice::create([
            'member_id' => $members->count() > 4 ? $members->get(4)->id : $members->first()->id,
            'invoice_number' => 'INV-000005',
            'invoice_date' => Carbon::now()->subDays(3),
            'due_date' => Carbon::now()->addDays(27),
            'status' => 'draft',
            'subtotal' => 1200.00,
            'tax_amount' => 0.00,
            'total' => 1200.00,
            'notes' => 'High Holiday seating and membership',
            'recurring' => false,
        ]);

        InvoiceItem::create([
            'invoice_id' => $invoice5->id,
            'description' => 'High Holiday Seating',
            'quantity' => 2,
            'unit_price' => 350.00,
            'total' => 700.00,
            'sort_order' => 1,
        ]);

        InvoiceItem::create([
            'invoice_id' => $invoice5->id,
            'description' => 'Annual Membership',
            'quantity' => 1,
            'unit_price' => 500.00,
            'total' => 500.00,
            'sort_order' => 2,
        ]);

        $this->command->info('Created 5 invoices with items');
    }
}
