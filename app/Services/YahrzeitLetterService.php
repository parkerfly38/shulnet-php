<?php

namespace App\Services;

use App\Models\Member;
use App\Models\PdfTemplate;
use App\Models\Yahrzeit;

/**
 * Renders yahrzeit reminder letters and emails from the "Yahrzeit Reminder Letter"
 * PDF template, so admins can change their wording and look under PDF Templates.
 */
class YahrzeitLetterService
{
    public const TEMPLATE_SLUG = 'yahrzeit-reminder-letter';

    /**
     * Field definitions stored on the template, shown to admins in the template editor.
     */
    public static function availableFields(): array
    {
        $field = fn (string $name, string $label, string $description) => [
            'name' => $name, 'label' => $label, 'type' => 'text', 'description' => $description, 'required' => false,
        ];

        return [
            $field('organization_name', 'Organization Name', 'The app name from settings'),
            $field('letter_date', 'Letter Date', "Today's date, e.g. November 7, 2026"),
            $field('member_first_name', 'Recipient First Name', 'First name of the family member'),
            $field('member_last_name', 'Recipient Last Name', 'Last name of the family member'),
            $field('member_full_name', 'Recipient Full Name', 'Full name of the family member'),
            $field('relationship', 'Relationship', 'How the deceased was related to the recipient, e.g. father'),
            $field('deceased_name', 'Deceased Name', 'Name of the person being remembered'),
            $field('deceased_hebrew_name', 'Deceased Hebrew Name', 'Hebrew name, if recorded'),
            $field('hebrew_date', 'Hebrew Date', 'Day and month of the yahrzeit, e.g. 1 Cheshvan'),
            $field('gregorian_date', 'Gregorian Date', "This year's observance date"),
            $field('date_of_death', 'Date of Passing', 'Gregorian date of death'),
            $field('observance_type', 'Observance Type', 'e.g. Kaddish, Candle'),
            $field('notes', 'Notes', 'Notes recorded on the yahrzeit'),
        ];
    }

    public static function defaultHtml(): string
    {
        return file_get_contents(resource_path('views/yahrzeits/templates/reminder-letter.html'));
    }

    /**
     * One letter's HTML. Falls back to the built-in design if the template was deleted or deactivated.
     */
    public function render(Yahrzeit $yahrzeit, ?string $gregorianDate, string $recipientName, ?Member $member = null): string
    {
        $template = PdfTemplate::where('slug', self::TEMPLATE_SLUG)->where('is_active', true)->first()
            ?? new PdfTemplate(['html_content' => self::defaultHtml()]);

        return $template->renderWithFields($this->fields($yahrzeit, $gregorianDate, $recipientName, $member));
    }

    /**
     * Placeholder values, HTML-escaped since the template is HTML.
     */
    public function fields(Yahrzeit $yahrzeit, ?string $gregorianDate, string $recipientName, ?Member $member = null): array
    {
        $values = [
            'organization_name' => config('app.name'),
            'letter_date' => now()->format('F j, Y'),
            'member_first_name' => $member->first_name ?? $recipientName,
            'member_last_name' => $member->last_name ?? '',
            'member_full_name' => $member ? trim("{$member->first_name} {$member->last_name}") : $recipientName,
            'relationship' => strtolower($member?->pivot?->relationship ?? ''),
            'deceased_name' => $yahrzeit->name,
            'deceased_hebrew_name' => $yahrzeit->hebrew_name,
            'hebrew_date' => trim("{$yahrzeit->hebrew_day_of_death} {$yahrzeit->hebrew_month_of_death}"),
            'gregorian_date' => $gregorianDate,
            'date_of_death' => $yahrzeit->date_of_death?->format('F j, Y'),
            'observance_type' => $yahrzeit->observance_type && $yahrzeit->observance_type !== 'none'
                ? ucfirst(str_replace('_', ' ', $yahrzeit->observance_type))
                : null,
        ];

        return array_map(fn ($value) => e((string) $value), $values) + [
            'notes' => nl2br(e((string) $yahrzeit->notes)),
        ];
    }
}
