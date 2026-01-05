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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_definition_id')->nullable()->constrained()->onDelete('set null');
            $table->date('attendance_date');
            $table->enum('status', ['present', 'absent', 'tardy', 'excused']);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->unique(['student_id', 'attendance_date', 'class_definition_id'], 'attendances_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
