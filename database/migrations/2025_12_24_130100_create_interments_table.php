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
        Schema::create('interments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deed_id')->constrained('deeds')->onDelete('cascade');
            $table->foreignId('member_id')->nullable()->constrained('members')->onDelete('set null');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('hebrew_name')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->date('date_of_death');
            $table->date('interment_date');
            $table->string('cause_of_death')->nullable();
            $table->string('funeral_home')->nullable();
            $table->string('rabbi_officiating')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interments');
    }
};
