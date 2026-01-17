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
        Schema::create('gravesites', function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            // Location Information
            $table->string('cemetery_name')->nullable();
            $table->string('section')->nullable();
            $table->string('row')->nullable();
            $table->string('plot_number');
            $table->string('block')->nullable();

            // Site Details
            $table->enum('status', ['available', 'reserved', 'occupied'])->default('available');
            $table->enum('gravesite_type', ['single', 'double', 'family', 'cremation'])->default('single');
            $table->decimal('size_length', 8, 2)->nullable()->comment('Length in feet');
            $table->decimal('size_width', 8, 2)->nullable()->comment('Width in feet');

            // Ownership & Purchase
            $table->foreignId('member_id')->nullable()->constrained('members')->onDelete('set null');
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_price', 10, 2)->nullable();
            $table->date('reserved_date')->nullable();
            $table->string('reserved_by')->nullable();

            // Occupancy Information
            $table->string('deceased_name')->nullable();
            $table->string('deceased_hebrew_name')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->date('date_of_death')->nullable();
            $table->date('burial_date')->nullable();

            // Additional Details
            $table->text('notes')->nullable();
            $table->string('gps_coordinates')->nullable();
            $table->boolean('perpetual_care')->default(false);
            $table->text('monument_inscription')->nullable();

            // Indexes
            $table->index(['section', 'row', 'plot_number']);
            $table->index('status');
            $table->index('member_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gravesites');
    }
};
