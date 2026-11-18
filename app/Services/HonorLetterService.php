<?php

namespace App\Services;

use App\Models\GabbaiAssignment;
use App\Models\PdfTemplate;

/**
 * Renders Torah honor letters and emails from the "Torah Honor Letter" PDF template, so admins
 * can change their wording and look under PDF Templates. The same template serves the first
 * notice and the reminder; is_notice / is_reminder let it word each one differently.
 */
class HonorLetterService
{
    public const TEMPLATE_SLUG = 'torah-honor-letter';

    private const ALIYAH_NAMES = [
        '1' => 'Kohen', '2' => 'Levi', '3' => 'Shlishi', '4' => "Revi'i",
        '5' => 'Chamishi', '6' => 'Shishi', '7' => "Shevi'i",
    ];

    public function __construct(
        protected SettingsService $settings,
        protected HebrewCalendarService $hebrewCalendar,
    ) {}

    /**
     * Field definitions stored on the template, shown to admins in the template editor.
     */
    public static function availableFields(): array
    {
        $field = fn (string $name, string $label, string $description) => [
            'name' => $name, 'label' => $label, 'type' => 'text', 'description' => $description, 'required' => false,
        ];

        return [
            $field('organization_name', 'Organization Name', 'The synagogue name from Settings'),
            $field('letter_date', 'Letter Date', "Today's date, e.g. November 14, 2026"),
            $field('member_first_name', 'Recipient First Name', 'First name of the honoree'),
            $field('member_last_name', 'Recipient Last Name', 'Last name of the honoree'),
            $field('member_full_name', 'Recipient Full Name', 'Full name of the honoree'),
            $field('honor_name', 'Honor', 'e.g. Aliyah 3 (Shlishi) or Maftir'),
            $field('service_date', 'Service Date', 'e.g. Saturday, November 21, 2026'),
            $field('hebrew_date', 'Hebrew Date', 'e.g. 10 Kislev 5787'),
            $field('portion', 'Torah Portion', 'The parsha or holiday reading, when known'),
            $field('reading', 'Reading', 'The verses for this honor, e.g. Genesis 28:10-28:22'),
            $field('is_notice', 'Is First Notice', 'Has a value only in the letter sent when the honor is assigned'),
            $field('is_reminder', 'Is Reminder', 'Has a value only in the reminder letter'),
        ];
    }

    public static function defaultHtml(): string
    {
        return file_get_contents(resource_path('views/gabbai/templates/honor-letter.html'));
    }

    /**
     * A readable name for a stored honor key: the honors page saves "1"–"7" and "M".
     */
    public static function honorName(string $honor): string
    {
        if (isset(self::ALIYAH_NAMES[$honor])) {
            return "Aliyah {$honor} (".self::ALIYAH_NAMES[$honor].')';
        }

        if (ctype_digit($honor)) {
            return "Aliyah {$honor}";
        }

        return $honor === 'M' ? 'Maftir' : $honor;
    }

    /**
     * One letter's HTML. Falls back to the built-in design if the template was deleted or deactivated.
     */
    public function render(GabbaiAssignment $assignment, bool $reminder): string
    {
        $template = PdfTemplate::where('slug', self::TEMPLATE_SLUG)->where('is_active', true)->first()
            ?? new PdfTemplate(['html_content' => self::defaultHtml()]);

        return $template->renderWithFields($this->fields($assignment, $reminder));
    }

    /**
     * Placeholder values, HTML-escaped since the template is HTML.
     */
    public function fields(GabbaiAssignment $assignment, bool $reminder): array
    {
        $member = $assignment->member;
        $hebrew = $this->hebrewCalendar->gregorianToHebrew($assignment->date->toDateString());

        $values = [
            'organization_name' => $this->settings->organizationName(),
            'letter_date' => now()->format('F j, Y'),
            'member_first_name' => $member?->first_name,
            'member_last_name' => $member?->last_name,
            'member_full_name' => $member ? trim("{$member->first_name} {$member->last_name}") : '',
            'honor_name' => self::honorName($assignment->honor),
            'service_date' => $assignment->date->format('l, F j, Y'),
            'hebrew_date' => $hebrew['formatted'] ?? trim("{$hebrew['day']} {$hebrew['month']} {$hebrew['year']}"),
            'portion' => $assignment->portion,
            'reading' => $assignment->reading,
            'is_notice' => $reminder ? '' : '1',
            'is_reminder' => $reminder ? '1' : '',
        ];

        return array_map(fn ($value) => e((string) $value), $values);
    }
}
