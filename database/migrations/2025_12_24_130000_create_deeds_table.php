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
        Schema::create('deeds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->onDelete('cascade');
            $table->string('deed_number')->unique();
            $table->string('plot_location');
            $table->string('section')->nullable();
            $table->string('row')->nullable();
            $table->string('plot_number');
            $table->enum('plot_type', ['single', 'double', 'family'])->default('single');
            $table->date('purchase_date');
            $table->decimal('purchase_price', 10, 2)->nullable();
            $table->integer('capacity')->default(1);
            $table->integer('occupied')->default(0);
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deeds');
    }
};
