<?php

use App\Services\HonorLetterService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Torah honor emails and letters: track who has been told about their honor and reminded of it,
 * keep the reading each honor covers for the letter, and add the reminder setting and letter template.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('gabbai_assignments', function (Blueprint $table) {
            $table->string('portion')->nullable()->after('honor');
            $table->string('reading')->nullable()->after('portion');
            $table->timestamp('notified_at')->nullable()->after('reading');
            $table->timestamp('reminded_at')->nullable()->after('notified_at');
        });

        if (! DB::table('settings')->where('key', 'honor_reminder_days_before')->exists()) {
            DB::table('settings')->insert([
                'key' => 'honor_reminder_days_before',
                'value' => '5',
                'group' => 'jewish_calendar',
                'type' => 'text',
                'description' => 'Days before the service to email Torah honorees a reminder (0 turns automatic reminders off)',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        if (! DB::table('pdf_templates')->where('slug', HonorLetterService::TEMPLATE_SLUG)->exists()) {
            DB::table('pdf_templates')->insert([
                'name' => 'Torah Honor Letter',
                'slug' => HonorLetterService::TEMPLATE_SLUG,
                'description' => 'Used for Torah honor emails and printed letters, both when an honor is assigned and as a reminder. Use {{#if is_notice}}...{{/if}} for wording only in the first letter and {{#if is_reminder}}...{{/if}} for wording only in the reminder.',
                'html_content' => HonorLetterService::defaultHtml(),
                'available_fields' => json_encode(HonorLetterService::availableFields()),
                'category' => 'letter',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('pdf_templates')->where('slug', HonorLetterService::TEMPLATE_SLUG)->delete();
        DB::table('settings')->where('key', 'honor_reminder_days_before')->delete();

        Schema::table('gabbai_assignments', function (Blueprint $table) {
            $table->dropColumn(['portion', 'reading', 'notified_at', 'reminded_at']);
        });
    }
};
