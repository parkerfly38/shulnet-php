<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Only run on MySQL/MariaDB - SQLite doesn't support ALTER COLUMN and fresh installs already have 'partial' in the create table migration
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE invoices MODIFY COLUMN status ENUM('draft', 'open', 'partial', 'paid', 'overdue', 'cancelled') DEFAULT 'draft'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Only run on MySQL/MariaDB
        if (DB::getDriverName() === 'mysql') {
            // Remove 'partial' status - first update any partial invoices to 'open'
            DB::statement("UPDATE invoices SET status = 'open' WHERE status = 'partial'");
            DB::statement("ALTER TABLE invoices MODIFY COLUMN status ENUM('draft', 'open', 'paid', 'overdue', 'cancelled') DEFAULT 'draft'");
        }
    }
};
