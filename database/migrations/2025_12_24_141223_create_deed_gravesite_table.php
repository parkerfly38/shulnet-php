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
        Schema::create('deed_gravesite', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deed_id')->constrained('deeds')->onDelete('cascade');
            $table->foreignId('gravesite_id')->constrained('gravesites')->onDelete('cascade');
            $table->timestamps();

            // Prevent duplicate associations
            $table->unique(['deed_id', 'gravesite_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deed_gravesite');
    }
};
