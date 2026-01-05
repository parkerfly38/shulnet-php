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
        Schema::create('event', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->string('name');
            $table->string('tagline')->nullable();
            $table->dateTime('event_start');
            $table->dateTime('event_end')->nullable();
            $table->boolean('registration_required')->default(false);
            $table->dateTime('registration_starts')->nullable();
            $table->dateTime('registration_ends')->nullable();
            $table->boolean('earlybird')->default(false);
            $table->dateTime('earlybird_starts')->nullable();
            $table->dateTime('earlybird_ends')->nullable();
            $table->dateTime('registration_closed')->nullable();
            $table->integer('maxrsvp')->nullable();
            $table->boolean('members_only')->default(false);
            $table->boolean('allow_guests')->default(false);
            $table->integer('max_guests')->nullable();
            $table->text('description')->nullable();
            $table->text('rsvp_message')->nullable();
            $table->boolean('online')->default(false);
            $table->string('online_url')->nullable();
            $table->boolean('all_day')->default(false);
            $table->boolean('public')->default(true);
            $table->foreignId('calendar_id')->constrained()->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event');
    }
};
