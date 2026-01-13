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
        Schema::table('event_r_s_v_p_s', function (Blueprint $table) {
            $table->foreignId('event_id')->after('id')->constrained('event')->onDelete('cascade');
            $table->string('name')->after('member_id');
            $table->string('email')->after('name');
            $table->string('phone')->nullable()->after('email');
            $table->integer('guests')->default(0)->after('phone');
            $table->string('status')->default('pending')->after('guests');
            $table->text('notes')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_r_s_v_p_s', function (Blueprint $table) {
            $table->dropForeign(['event_id']);
            $table->dropColumn(['event_id', 'name', 'email', 'phone', 'guests', 'status', 'notes']);
        });
    }
};
