<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For SQLite, we need to recreate the table with the new enum values
        // First, update any existing 'sent' records to 'open' using raw SQL
        DB::statement("UPDATE invoices SET status = 'open' WHERE status = 'sent'");

        // Note: The main migration file has already been updated with the correct enum values
        // This migration just handles updating existing data
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert changes
        DB::statement("UPDATE invoices SET status = 'sent' WHERE status = 'open'");
    }
};
