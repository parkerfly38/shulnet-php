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
        Schema::create('membership_tiers', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Family Membership", "Student Membership"
            $table->string('slug')->unique(); // URL-friendly identifier
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0); // Annual price
            $table->enum('billing_period', ['annual', 'monthly', 'lifetime', 'custom'])->default('annual');
            $table->integer('max_members')->nullable(); // Max members in this tier (e.g., 2 for family)
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->json('features')->nullable(); // JSON array of features/benefits
            $table->timestamps();
            
            $table->index('slug');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('membership_tiers');
    }
};
