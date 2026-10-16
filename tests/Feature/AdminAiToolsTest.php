<?php

namespace Tests\Feature;

use App\Ai\Tools\EventRsvps;
use App\Ai\Tools\HebrewCalendar;
use App\Ai\Tools\MemberDetail;
use App\Models\EventRSVP;
use App\Ai\Tools\SearchEvents;
use App\Ai\Tools\SearchInvoices;
use App\Ai\Tools\SearchStudents;
use App\Ai\Tools\SearchYahrzeits;
use App\Ai\Tools\StudentDetail;
use App\Models\Attendance;
use App\Models\ClassDefinition;
use App\Models\Student;
use App\Ai\Tools\UpcomingYahrzeits;
use App\Models\Calendar;
use App\Models\Event;
use App\Models\Invoice;
use App\Models\Member;
use App\Models\User;
use App\Models\Yahrzeit;
use App\Services\HebrewCalendarService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class AdminAiToolsTest extends TestCase
{
    use RefreshDatabase;

    private function yahrzeitOn(string $name, string $gregorianDate): Yahrzeit
    {
        $hebrew = app(HebrewCalendarService::class)->gregorianToHebrew($gregorianDate);

        return Yahrzeit::factory()->create([
            'name' => $name,
            'hebrew_day_of_death' => $hebrew['day'],
            'hebrew_month_of_death' => $hebrew['month'],
            'hebrew_year_of_death' => $hebrew['year'] - 10,
        ]);
    }

    private function runTool(object $tool, array $args = []): array
    {
        return json_decode((string) $tool->handle(new Request($args)), true);
    }

    public function test_upcoming_yahrzeits_returns_only_those_within_the_window_soonest_first(): void
    {
        $this->actingAs(User::factory()->create(['roles' => ['admin']]));

        $this->yahrzeitOn('Later Person', now()->addDays(5)->toDateString());
        $this->yahrzeitOn('Sooner Person', now()->addDays(2)->toDateString());
        $this->yahrzeitOn('Far Person', now()->addMonths(5)->toDateString());

        $result = $this->runTool(app(UpcomingYahrzeits::class), ['days' => 7]);

        $this->assertSame(['Sooner Person', 'Later Person'], array_column($result['yahrzeits'], 'name'));
        $this->assertSame(2, $result['count']);
        $this->assertSame(now()->toDateString(), $result['from']);
        $this->assertSame(now()->addDays(7)->toDateString(), $result['to']);
    }

    public function test_upcoming_yahrzeits_clamps_the_day_window(): void
    {
        $this->actingAs(User::factory()->create(['roles' => ['admin']]));

        $this->assertSame(now()->addDays(60)->toDateString(), $this->runTool(app(UpcomingYahrzeits::class), ['days' => 500])['to']);
        $this->assertSame(now()->addDay()->toDateString(), $this->runTool(app(UpcomingYahrzeits::class), ['days' => 0])['to']);
    }

    public function test_upcoming_yahrzeits_requires_an_admin(): void
    {
        $this->actingAs(User::factory()->create(['roles' => ['member']]));

        $this->assertArrayHasKey('error', $this->runTool(app(UpcomingYahrzeits::class)));
    }

    public function test_hebrew_calendar_converts_a_given_date(): void
    {
        $this->actingAs(User::factory()->create(['roles' => ['admin']]));

        $result = $this->runTool(app(HebrewCalendar::class), ['date' => '2023-09-25']);

        $this->assertSame('Tishrei', $result['month']);
        $this->assertSame(5784, $result['year']);
        $this->assertSame('2023-09-25', $result['gregorian_date']);
    }

    public function test_hebrew_calendar_defaults_to_today(): void
    {
        $this->actingAs(User::factory()->create(['roles' => ['admin']]));

        $this->assertSame(now()->toDateString(), $this->runTool(app(HebrewCalendar::class))['gregorian_date']);
    }

    public function test_hebrew_calendar_rejects_invalid_dates(): void
    {
        $this->actingAs(User::factory()->create(['roles' => ['admin']]));

        foreach (['tomorrow', '2023-02-30', '09/25/2023'] as $bad) {
            $this->assertArrayHasKey('error', $this->runTool(app(HebrewCalendar::class), ['date' => $bad]), $bad);
        }
    }

    public function test_hebrew_calendar_requires_an_admin(): void
    {
        $this->actingAs(User::factory()->create(['roles' => ['member']]));

        $this->assertArrayHasKey('error', $this->runTool(app(HebrewCalendar::class)));
    }

    public function test_search_yahrzeits_filters_by_name_and_limits_results(): void
    {
        $this->actingAs(User::factory()->create(['roles' => ['admin']]));
        Yahrzeit::factory()->create(['name' => 'Moshe Goldberg']);
        Yahrzeit::factory()->count(3)->create(['name' => 'Other Person']);

        $result = $this->runTool(app(SearchYahrzeits::class), ['search' => 'Goldberg']);
        $this->assertSame(1, $result['total']);
        $this->assertSame('Moshe Goldberg', $result['yahrzeits'][0]['name']);

        $this->assertCount(2, $this->runTool(app(SearchYahrzeits::class), ['search' => 'Other', 'limit' => 2])['yahrzeits']);
    }

    public function test_search_yahrzeits_requires_an_admin(): void
    {
        $this->actingAs(User::factory()->create(['roles' => ['member']]));

        $this->assertArrayHasKey('error', $this->runTool(app(SearchYahrzeits::class)));
    }

    public function test_search_events_filters_by_text_and_calendar(): void
    {
        $this->actingAs(User::factory()->create(['roles' => ['admin']]));
        $holiday = Calendar::factory()->create(['name' => 'Holidays']);
        $classes = Calendar::factory()->create(['name' => 'Classes']);
        Event::factory()->create(['name' => 'Purim Party', 'calendar_id' => $holiday->id]);
        Event::factory()->create(['name' => 'Hebrew Class', 'calendar_id' => $classes->id]);

        $byText = $this->runTool(app(SearchEvents::class), ['search' => 'Purim']);
        $this->assertSame(1, $byText['total']);
        $this->assertSame('Holidays', $byText['events'][0]['calendar']);

        $byCalendar = $this->runTool(app(SearchEvents::class), ['calendar_id' => $classes->id]);
        $this->assertSame(['Hebrew Class'], array_column($byCalendar['events'], 'name'));
    }

    public function test_search_events_requires_an_admin(): void
    {
        $this->actingAs(User::factory()->create(['roles' => ['member']]));

        $this->assertArrayHasKey('error', $this->runTool(app(SearchEvents::class)));
    }

    public function test_search_invoices_filters_and_reports_overall_stats(): void
    {
        $this->actingAs(User::factory()->create(['roles' => ['admin']]));
        $member = Member::factory()->create(['first_name' => 'Rivka', 'last_name' => 'Shapiro']);
        Invoice::factory()->create(['member_id' => $member->id, 'status' => 'paid', 'subtotal' => 100, 'tax_amount' => 0, 'total' => 100]);
        Invoice::factory()->create(['member_id' => $member->id, 'status' => 'overdue', 'subtotal' => 50, 'tax_amount' => 0, 'total' => 50]);
        Invoice::factory()->create(['status' => 'draft', 'subtotal' => 10, 'tax_amount' => 0, 'total' => 10]);

        $byMember = $this->runTool(app(SearchInvoices::class), ['search' => 'Shapiro']);
        $this->assertSame(2, $byMember['total']);
        $this->assertSame('Rivka Shapiro', $byMember['invoices'][0]['member']);

        $overdue = $this->runTool(app(SearchInvoices::class), ['status' => 'overdue', 'member_id' => $member->id]);
        $this->assertSame(1, $overdue['total']);

        $this->assertSame(3, $overdue['overall_stats']['total_count']);
        $this->assertEquals(160, $overdue['overall_stats']['total_amount']);
        $this->assertEquals(50, $overdue['overall_stats']['overdue_amount']);
    }

    public function test_search_invoices_requires_an_admin(): void
    {
        $this->actingAs(User::factory()->create(['roles' => ['member']]));

        $this->assertArrayHasKey('error', $this->runTool(app(SearchInvoices::class)));
    }

    public function test_member_detail_returns_profile_and_unpaid_balance(): void
    {
        $this->actingAs(User::factory()->create(['roles' => ['admin']]));
        $member = Member::factory()->create(['first_name' => 'Ruth', 'last_name' => 'Cohen']);

        $result = $this->runTool(app(MemberDetail::class), ['member_id' => $member->id]);

        $this->assertSame($member->id, $result['id']);
        $this->assertStringContainsString('Ruth Cohen', $result['name']);
        $this->assertArrayHasKey('contribution', $result);
        $this->assertSame(0, $result['unpaid_invoice_count']);
    }

    public function test_member_detail_handles_missing_member_and_non_admins(): void
    {
        $this->actingAs(User::factory()->create(['roles' => ['admin']]));
        $this->assertArrayHasKey('error', $this->runTool(app(MemberDetail::class), ['member_id' => 99999]));

        $this->actingAs(User::factory()->create(['roles' => ['member']]));
        $this->assertArrayHasKey('error', $this->runTool(app(MemberDetail::class), ['member_id' => 1]));
    }

    public function test_event_rsvps_summarizes_by_status_and_filters(): void
    {
        $this->actingAs(User::factory()->create(['roles' => ['admin']]));
        $event = Event::factory()->create(['name' => 'Purim Feast']);
        EventRSVP::factory()->count(2)->create(['event_id' => $event->id, 'status' => 'confirmed', 'guests' => 1]);
        EventRSVP::factory()->create(['event_id' => $event->id, 'status' => 'cancelled']);

        $result = $this->runTool(app(EventRsvps::class), ['event_name' => 'Purim']);

        $this->assertSame($event->id, $result['event']['id']);
        $this->assertSame(3, $result['total_rsvps']);
        $this->assertSame(2, $result['totals_by_status']['confirmed']['rsvps']);
        $this->assertSame(2, $result['totals_by_status']['confirmed']['guests']);

        $filtered = $this->runTool(app(EventRsvps::class), ['event_id' => $event->id, 'status' => 'cancelled']);
        $this->assertCount(1, $filtered['rsvps']);
    }

    public function test_event_rsvps_errors_for_unknown_event_and_non_admins(): void
    {
        $this->actingAs(User::factory()->create(['roles' => ['admin']]));
        $this->assertArrayHasKey('error', $this->runTool(app(EventRsvps::class), ['event_id' => 99999]));

        $this->actingAs(User::factory()->create(['roles' => ['member']]));
        $this->assertArrayHasKey('error', $this->runTool(app(EventRsvps::class), ['event_id' => 1]));
    }

    public function test_search_students_matches_by_name(): void
    {
        $this->actingAs(User::factory()->create(['roles' => ['admin']]));
        Student::create(['first_name' => 'Noam', 'last_name' => 'Katz']);
        Student::create(['first_name' => 'Tamar', 'last_name' => 'Green']);

        $result = $this->runTool(app(SearchStudents::class), ['search' => 'Katz']);

        $this->assertSame(1, $result['total']);
        $this->assertSame('Noam Katz', $result['students'][0]['name']);
    }

    public function test_student_detail_summarizes_attendance(): void
    {
        $this->actingAs(User::factory()->create(['roles' => ['admin']]));
        $student = Student::create(['first_name' => 'Noam', 'last_name' => 'Katz', 'allergies' => 'peanuts']);
        $class = ClassDefinition::create(['name' => 'Hebrew 3']);
        foreach (['present', 'present', 'absent'] as $i => $status) {
            Attendance::create([
                'student_id' => $student->id,
                'class_definition_id' => $class->id,
                'attendance_date' => now()->subDays($i)->toDateString(),
                'status' => $status,
            ]);
        }

        $result = $this->runTool(app(StudentDetail::class), ['student_id' => $student->id]);

        $this->assertSame('peanuts', $result['allergies']);
        $this->assertSame(2, $result['attendance']['present']);
        $this->assertSame(1, $result['attendance']['absent']);
        $this->assertCount(1, $result['recent_absences_and_tardies']);
    }

    public function test_student_tools_reject_non_admins_and_unknown_ids(): void
    {
        $this->actingAs(User::factory()->create(['roles' => ['admin']]));
        $this->assertArrayHasKey('error', $this->runTool(app(StudentDetail::class), ['student_id' => 999]));

        $this->actingAs(User::factory()->create(['roles' => ['member']]));
        $this->assertArrayHasKey('error', $this->runTool(app(SearchStudents::class)));
        $this->assertArrayHasKey('error', $this->runTool(app(StudentDetail::class), ['student_id' => 1]));
    }
}
