<?php

namespace Tests\Feature;

use App\Models\Exam;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExamsTest extends TestCase
{
    use RefreshDatabase;

    private function fields(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Midterm',
            'subject_id' => Subject::create(['name' => 'Hebrew Reading'])->id,
            'start_date' => '2026-12-06',
            'end_date' => '2026-12-07',
        ], $overrides);
    }

    // The create form sends these; the API used to keep only the name.
    public function test_creating_from_the_form_keeps_subject_and_dates(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->withHeader('X-Inertia', 'true')
            ->post('/api/admin/exams', $this->fields())
            ->assertRedirect(route('admin.school.exams.index'));

        $exam = Exam::sole();
        $this->assertSame('Hebrew Reading', $exam->subject->name);
        $this->assertSame('2026-12-06', $exam->start_date);
        $this->assertSame('2026-12-07', $exam->end_date);
    }

    public function test_editing_from_the_form_updates_subject_and_dates(): void
    {
        $exam = Exam::create($this->fields());

        $this->actingAs(User::factory()->admin()->create())
            ->withHeader('X-Inertia', 'true')
            ->put("/api/admin/exams/{$exam->id}", $this->fields(['name' => 'Final', 'end_date' => '2026-12-10']))
            ->assertRedirect(route('admin.school.exams.show', $exam->id));

        $this->assertSame('Final', $exam->fresh()->name);
        $this->assertSame('2026-12-10', $exam->fresh()->end_date);
    }

    public function test_end_date_cannot_be_before_start_date(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->postJson('/api/admin/exams', $this->fields(['end_date' => '2026-12-01']))
            ->assertJsonValidationErrors('end_date');
    }

    // The list shows the subject's name and searches by exam or subject name (it used to search a missing column).
    public function test_list_shows_subject_names_and_searches(): void
    {
        Exam::create($this->fields());
        Exam::create(['name' => 'Quiz 1']);
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->getJson('/api/admin/exams?q=Midterm')
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.subject_name', 'Hebrew Reading');

        $this->actingAs($admin)->getJson('/api/admin/exams?q=Hebrew')->assertJsonPath('total', 1);
    }

    public function test_an_exam_can_be_deleted(): void
    {
        $exam = Exam::create($this->fields());

        $this->actingAs(User::factory()->admin()->create())
            ->deleteJson("/api/admin/exams/{$exam->id}")
            ->assertNoContent();

        $this->assertModelMissing($exam);
    }
}
