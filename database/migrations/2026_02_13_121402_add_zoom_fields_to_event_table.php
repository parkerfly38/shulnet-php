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
        Schema::table('event', function (Blueprint $table) {
            $table->string('zoom_meeting_id')->nullable()->after('online_url');
            $table->string('zoom_join_url')->nullable()->after('zoom_meeting_id');
            $table->string('zoom_start_url')->nullable()->after('zoom_join_url');
            $table->string('zoom_password')->nullable()->after('zoom_start_url');
            $table->string('zoom_registration_url')->nullable()->after('zoom_password');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event', function (Blueprint $table) {
            $table->dropColumn([
                'zoom_meeting_id',
                'zoom_join_url',
                'zoom_start_url',
                'zoom_password',
                'zoom_registration_url',
            ]);
        });
    }
};
