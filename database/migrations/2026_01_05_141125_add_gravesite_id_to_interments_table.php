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
        Schema::table('interments', function (Blueprint $table) {
            $table->foreignId('gravesite_id')->nullable()->after('deed_id')->constrained('gravesites')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('interments', function (Blueprint $table) {
            $table->dropForeign(['gravesite_id']);
            $table->dropColumn('gravesite_id');
        });
    }
};
