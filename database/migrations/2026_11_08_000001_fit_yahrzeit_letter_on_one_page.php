<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The default yahrzeit letter ran an inch past one page, so its signature spilled onto a sheet of its own.
 * Tighten its spacing, but only where an admin hasn't edited those lines.
 */
return new class extends Migration
{
    private const CHANGES = [
        'margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #333;' => 'margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #333;',
        '.yz-letter .date { text-align: right; margin-bottom: 30px; }' => '.yz-letter .date { text-align: right; margin-bottom: 20px; }',
        '.yz-letter .signature { margin-top: 50px; }' => '.yz-letter .signature { margin-top: 28px; }',
        '<p style="margin-top: 50px;">_______________________</p>' => '<p style="margin-top: 36px;">_______________________</p>',
    ];

    public function up(): void
    {
        $this->swap(self::CHANGES);
    }

    public function down(): void
    {
        $this->swap(array_flip(self::CHANGES));
    }

    private function swap(array $changes): void
    {
        $template = DB::table('pdf_templates')->where('slug', 'yahrzeit-reminder-letter')->first();

        if (! $template || collect(array_keys($changes))->contains(fn ($old) => ! str_contains($template->html_content, $old))) {
            return; // missing or customised: leave it as the admin made it
        }

        DB::table('pdf_templates')->where('id', $template->id)->update([
            'html_content' => strtr($template->html_content, $changes),
            'updated_at' => now(),
        ]);
    }
};
