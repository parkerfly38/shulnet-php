<?php

use App\Services\YahrzeitLetterService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Yahrzeit reminder letters and emails render from this template, so admins
     * can change them under PDF Templates.
     */
    public function up(): void
    {
        if (DB::table('pdf_templates')->where('slug', YahrzeitLetterService::TEMPLATE_SLUG)->exists()) {
            return;
        }

        DB::table('pdf_templates')->insert([
            'name' => 'Yahrzeit Reminder Letter',
            'slug' => YahrzeitLetterService::TEMPLATE_SLUG,
            'description' => 'Used for printed yahrzeit reminder letters (single and monthly) and yahrzeit reminder emails. Use {{#if field}}...{{/if}} to show a part only when that field has a value.',
            'html_content' => YahrzeitLetterService::defaultHtml(),
            'available_fields' => json_encode(YahrzeitLetterService::availableFields()),
            'category' => 'letter',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('pdf_templates')->where('slug', YahrzeitLetterService::TEMPLATE_SLUG)->delete();
    }
};
