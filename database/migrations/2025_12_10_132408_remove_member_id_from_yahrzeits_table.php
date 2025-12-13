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
            $table->dropForeign(['member_id']);
            $table->dropColumn(['member_id', 'relationship']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('yahrzeit', function (Blueprint $table) {
            $table->foreignId('member_id')->nullable()->constrained();
            $table->string('relationship')->nullable();
        });
    }
};
