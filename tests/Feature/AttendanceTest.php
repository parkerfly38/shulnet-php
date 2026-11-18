<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\ClassDefinition;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceTest extends TestCase
{
    use RefreshDatabase;

    private function mark(User $admin, Student $student, string $status, ?int $classId = null)
    {
        return $this->actingAs($admin)->postJson('/api/admin/attendances', ['attendances' => [[
            'student_id' => $student->id, 'class_definition_id' => $classId,
            'attendance_date' => '2026-11-15', 'status' => $status, 'notes' => '',
        ]]]);
    }

    // The attendance page lists the day's records by filtering on the date it was marked for.
    public function test_marked_attendance_shows_up_for_its_date(): void
    {
        $admin = User::factory()->admin()->create();
        $student = Student::create(['first_name' => 'Noah', 'last_name' => 'Morgan']);

        $this->mark($admin, $student, 'present')->assertCreated();

        $this->actingAs($admin)->getJson('/api/admin/attendances?date=2026-11-15')
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.status', 'present');
    }

    public function test_marking_again_updates_the_days_record(): void
    {
        $admin = User::factory()->admin()->create();
        $student = Student::create(['first_name' => 'Noah', 'last_name' => 'Morgan']);
        $class = ClassDefinition::create(['name' => 'Aleph Class']);

        $this->mark($admin, $student, 'present', $class->id)->assertCreated();
        $this->mark($admin, $student, 'tardy', $class->id)->assertCreated();

        $this->assertSame('tardy', Attendance::sole()->status);
    }

    // General attendance has no class; a second save that day still updates rather than duplicates.
    public function test_general_attendance_is_updated_not_duplicated(): void
    {
        $admin = User::factory()->admin()->create();
        $student = Student::create(['first_name' => 'Noah', 'last_name' => 'Morgan']);

        $this->mark($admin, $student, 'present')->assertCreated();
        $this->mark($admin, $student, 'absent')->assertCreated();

        $this->assertSame('absent', Attendance::sole()->status);
    }

    public function test_migration_cleans_up_saved_dates_and_duplicates(): void
    {
        $student = Student::create(['first_name' => 'Noah', 'last_name' => 'Morgan']);
        $row = fn (string $status, string $updated) => \DB::table('attendances')->insertGetId([
            'student_id' => $student->id, 'class_definition_id' => null, 'attendance_date' => '2026-11-15 00:00:00',
            'status' => $status, 'created_at' => $updated, 'updated_at' => $updated,
        ]);
        $row('present', '2026-11-15 09:00:00');
        $latest = $row('tardy', '2026-11-15 09:30:00');

        (require database_path('migrations/2026_11_15_000001_normalize_attendance_dates.php'))->up();

        $this->assertSame($latest, Attendance::sole()->id);
        $this->assertSame('2026-11-15', \DB::table('attendances')->value('attendance_date'));
    }
}
