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
        Schema::create('membership_periods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->onDelete('cascade');
            $table->date('begin_date');
            $table->date('end_date')->nullable();
            $table->string('membership_type')->nullable(); // e.g., 'annual', 'lifetime', 'student'
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Add index for queries
            $table->index(['member_id', 'begin_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('membership_periods');
    }
};
