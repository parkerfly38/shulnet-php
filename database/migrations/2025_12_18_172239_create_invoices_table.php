<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->onDelete('cascade');
            $table->string('invoice_number')->unique();
            $table->date('invoice_date');
            $table->date('due_date');
            $table->enum('status', ['draft', 'open', 'paid', 'overdue', 'cancelled'])->default('draft');
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('total', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->boolean('recurring')->default(false);
            $table->enum('recurring_interval', ['daily', 'weekly', 'monthly', 'yearly'])->nullable();
            $table->integer('recurring_interval_count')->default(1);
            $table->date('next_invoice_date')->nullable();
            $table->date('last_invoice_date')->nullable();
            $table->date('recurring_end_date')->nullable();
            $table->foreignId('parent_invoice_id')->nullable()->constrained('invoices')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
