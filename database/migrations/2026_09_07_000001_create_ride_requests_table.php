<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ride_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requester_id')->constrained('members')->cascadeOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained('members')->nullOnDelete();
            $table->dateTime('service_at');
            $table->string('pickup_location');
            $table->unsignedTinyInteger('passenger_count')->default(1);
            $table->text('notes')->nullable();
            $table->timestamp('claimed_at')->nullable();
            $table->timestamps();

            $table->index(['service_at', 'driver_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ride_requests');
    }
};