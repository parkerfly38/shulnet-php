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
        Schema::create('yahrzeit', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->string('name');
            $table->string('hebrew_name')->nullable();
            $table->date('date_of_death');
            $table->integer('hebrew_day_of_death')->nullable();
            $table->integer('hebrew_month_of_death')->nullable();
            $table->integer('hebrew_year_of_death')->nullable();
            $table->string('relationship')->nullable(); // son, daughter, father, mother, etc.
            $table->string('observance_type')->default('standard'); // standard, kaddish, memorial_candle, other
            $table->text('notes')->nullable();
            $table->foreignId('member_id')->nullable()->constrained()->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('yahrzeit');
    }
};
