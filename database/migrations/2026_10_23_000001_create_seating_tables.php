<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // A sanctuary floor plan. Reused from year to year.
        Schema::create('seating_charts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('image_path')->nullable();
            $table->unsignedInteger('image_width')->nullable();
            $table->unsignedInteger('image_height')->nullable();
            $table->timestamps();
        });

        Schema::create('seating_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seating_chart_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('color', 7)->default('#2563eb');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        // Positions are percentages of the chart image so the map scales to any screen.
        Schema::create('seats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seating_chart_id')->constrained()->cascadeOnDelete();
            $table->foreignId('seating_section_id')->nullable()->constrained()->nullOnDelete();
            $table->string('label', 20);
            $table->decimal('x', 6, 3);
            $table->decimal('y', 6, 3);
            $table->decimal('member_price', 10, 2)->default(0);
            $table->decimal('nonmember_price', 10, 2)->default(0);
            $table->boolean('is_accessible')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['seating_chart_id', 'label']);
        });

        // One High Holy Day season (e.g. 5787) sold against a chart.
        Schema::create('seating_seasons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seating_chart_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->date('first_service_date')->nullable();
            $table->boolean('member_sales_enabled')->default(false);
            $table->dateTime('sale_starts_at')->nullable();
            $table->dateTime('sale_ends_at')->nullable();
            $table->dateTime('renewal_ends_at')->nullable();
            $table->unsignedInteger('max_seats_per_member')->nullable();
            $table->foreignId('gl_account_id')->nullable()->constrained('chart_of_accounts')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('seat_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seating_season_id')->constrained()->cascadeOnDelete();
            $table->foreignId('seat_id')->constrained()->restrictOnDelete();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            // renewal: held for last season's holder until renewal_ends_at; reserved: sold to the member
            $table->string('status', 20);
            $table->string('pricing', 20)->default('member');
            $table->decimal('price', 10, 2)->default(0);
            $table->string('occupant_name')->nullable();
            $table->foreignId('invoice_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('invoice_item_id')->nullable()->constrained()->nullOnDelete();
            $table->string('source', 20)->default('admin');
            $table->timestamps();

            // Prevents double-booking even under concurrent checkouts.
            $table->unique(['seating_season_id', 'seat_id']);
            $table->index(['seating_season_id', 'member_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seat_assignments');
        Schema::dropIfExists('seating_seasons');
        Schema::dropIfExists('seats');
        Schema::dropIfExists('seating_sections');
        Schema::dropIfExists('seating_charts');
    }
};
