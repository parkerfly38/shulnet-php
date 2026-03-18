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
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('message');
            $table->string('type')->default('info'); // info, warning, success, error
            $table->string('target_audience')->default('members'); // members, students, parents, all
            $table->dateTime('start_date');
            $table->dateTime('end_date')->nullable();
            $table->integer('display_duration_seconds')->default(10); // How long to show the banner
            $table->boolean('is_active')->default(true);
            $table->boolean('is_dismissible')->default(true);
            $table->boolean('show_on_login')->default(true);
            $table->boolean('show_on_dashboard')->default(true);
            
            // Push notification fields
            $table->boolean('send_as_push_notification')->default(false);
            $table->dateTime('push_notification_sent_at')->nullable();
            $table->json('push_notification_data')->nullable(); // Additional data for push notifications
            
            // Link and action fields
            $table->string('action_url')->nullable();
            $table->string('action_text')->nullable();
            
            // Tracking
            $table->integer('view_count')->default(0);
            $table->integer('click_count')->default(0);
            $table->integer('dismiss_count')->default(0);
            
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['is_active', 'start_date', 'end_date']);
            $table->index('target_audience');
        });

        // User banner interactions table (track who has seen/dismissed each banner)
        Schema::create('banner_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('banner_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->boolean('viewed')->default(false);
            $table->boolean('dismissed')->default(false);
            $table->boolean('clicked')->default(false);
            $table->timestamp('viewed_at')->nullable();
            $table->timestamp('dismissed_at')->nullable();
            $table->timestamp('clicked_at')->nullable();
            $table->timestamps();
            
            // Ensure a user can only have one interaction record per banner
            $table->unique(['banner_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banner_user');
        Schema::dropIfExists('banners');
    }
};
