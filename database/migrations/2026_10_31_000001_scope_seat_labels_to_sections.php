<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Seat labels only need to be unique within a section, so A1 can exist in
     * both Left and Balcony. Unsectioned seats are checked by the editor, since
     * the index treats NULL sections as distinct.
     */
    public function up(): void
    {
        Schema::table('seats', function (Blueprint $table) {
            // Add the new index first: MySQL needs one leading with seating_chart_id for the foreign key.
            $table->unique(['seating_chart_id', 'seating_section_id', 'label']);
            $table->dropUnique(['seating_chart_id', 'label']);
        });
    }

    public function down(): void
    {
        Schema::table('seats', function (Blueprint $table) {
            $table->unique(['seating_chart_id', 'label']);
            $table->dropUnique(['seating_chart_id', 'seating_section_id', 'label']);
        });
    }
};
