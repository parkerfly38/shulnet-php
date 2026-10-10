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
        Schema::table('students', function (Blueprint $table) {
            $table->string('hebrew_name')->nullable();
            $table->string('pronouns')->nullable();
            $table->string('preferred_name')->nullable();
            $table->string('allergies')->nullable();
            $table->string('special_accomodations')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn('hebrew_name');
            $table->dropColumn('pronouns');
            $table->dropColumn('preferred_name');
            $table->dropColumn('allergies');
            $table->dropColumn('special_accomodations');
        });
    }
};
