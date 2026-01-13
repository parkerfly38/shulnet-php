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
        Schema::table('event_r_s_v_p_s', function (Blueprint $table) {
            $table->foreignId('event_ticket_type_id')->nullable()->after('event_id')->constrained('event_ticket_types')->onDelete('set null');
            $table->foreignId('invoice_id')->nullable()->after('member_id')->constrained('invoices')->onDelete('set null');
            $table->integer('quantity')->default(1)->after('guests');
            $table->decimal('ticket_price', 10, 2)->nullable()->after('quantity');
            $table->decimal('total_amount', 10, 2)->nullable()->after('ticket_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_r_s_v_p_s', function (Blueprint $table) {
            $table->dropForeign(['event_ticket_type_id']);
            $table->dropForeign(['invoice_id']);
            $table->dropColumn(['event_ticket_type_id', 'invoice_id', 'quantity', 'ticket_price', 'total_amount']);
        });
    }
};
