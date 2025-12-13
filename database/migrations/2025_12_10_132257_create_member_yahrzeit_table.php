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
        Schema::create('member_yahrzeit', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->onDelete('cascade');
            $table->foreignId('yahrzeit_id')->constrained()->onDelete('cascade');
            $table->string('relationship')->nullable(); // e.g., 'Father', 'Mother', 'Spouse', 'Child', etc.
            $table->timestamps();
            
            $table->unique(['member_id', 'yahrzeit_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('member_yahrzeit');
    }
};
