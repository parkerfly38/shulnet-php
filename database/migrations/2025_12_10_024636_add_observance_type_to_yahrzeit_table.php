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
        Schema::table('yahrzeit', function (Blueprint $table) {
            $table->string('observance_type')->default('standard')->after('relationship');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('yahrzeit', function (Blueprint $table) {
            $table->dropColumn('observance_type');
        });
    }
};
