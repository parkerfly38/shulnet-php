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
        Schema::table('deeds', function (Blueprint $table) {
            $table->dropColumn(['plot_location', 'section', 'row', 'plot_number', 'plot_type', 'capacity']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('deeds', function (Blueprint $table) {
            $table->string('plot_location')->nullable();
            $table->string('section')->nullable();
            $table->string('row')->nullable();
            $table->string('plot_number')->nullable();
            $table->enum('plot_type', ['single', 'double', 'family'])->nullable();
            $table->integer('capacity')->nullable();
        });
    }
};
