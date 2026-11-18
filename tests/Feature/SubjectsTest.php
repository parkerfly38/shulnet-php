<?php

namespace Tests\Feature;

use App\Models\ClassDefinition;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubjectsTest extends TestCase
{
    use RefreshDatabase;

    private function fields(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Hebrew Reading',
            'subject_code' => 'HEB-101',
            'description' => 'Decoding and reading prayers',
            'books' => "Shalom Uvrachah\nSiddur Sim Shalom",
            'class_id' => ClassDefinition::create(['name' => 'Aleph Class'])->id,
            'teacher_id' => Teacher::create(['first_name' => 'Miriam', 'last_name' => 'Katz'])->id,
        ], $overrides);
    }

    // The forms used to send these fields and lose all but the name.
    public function test_creating_from_the_form_keeps_every_field_and_opens_the_subject(): void
    {
        $response = $this->actingAs(User::factory()->admin()->create())
            ->withHeader('X-Inertia', 'true')
            ->post('/api/admin/subjects', $this->fields());

        $subject = Subject::sole();
        $response->assertRedirect(route('admin.school.subjects.show', $subject->id));
        $this->assertSame('HEB-101', $subject->subject_code);
        $this->assertSame('Decoding and reading prayers', $subject->description);
        $this->assertStringContainsString('Siddur Sim Shalom', $subject->books);
        $this->assertNotNull($subject->class_id);
        $this->assertNotNull($subject->teacher_id);
    }

    public function test_editing_from_the_form_updates_and_clears_fields(): void
    {
        $subject = Subject::create($this->fields());

        $this->actingAs(User::factory()->admin()->create())
            ->withHeader('X-Inertia', 'true')
            ->put("/api/admin/subjects/{$subject->id}", $this->fields(['subject_code' => 'HEB-102', 'class_id' => '', 'teacher_id' => '']))
            ->assertRedirect(route('admin.school.subjects.show', $subject->id));

        $subject->refresh();
        $this->assertSame('HEB-102', $subject->subject_code);
        $this->assertNull($subject->class_id);
        $this->assertNull($subject->teacher_id);
    }

    public function test_an_unknown_teacher_is_rejected(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->postJson('/api/admin/subjects', $this->fields(['teacher_id' => 9999]))
            ->assertJsonValidationErrors('teacher_id');
    }

    // The list and show pages display names, not ids.
    public function test_list_and_show_pages_get_class_and_teacher_names(): void
    {
        $subject = Subject::create($this->fields());
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->getJson('/api/admin/subjects')
            ->assertJsonPath('data.0.class_name', 'Aleph Class')
            ->assertJsonPath('data.0.teacher_name', 'Miriam Katz');

        $this->actingAs($admin)->get("/admin/school/subjects/{$subject->id}")
            ->assertInertia(fn ($page) => $page
                ->component('admin/school/subjects/show')
                ->where('item.subject_code', 'HEB-101')
                ->where('item.class_name', 'Aleph Class')
                ->where('item.teacher_name', 'Miriam Katz'));
    }

    public function test_the_forms_get_classes_and_teachers_to_choose_from(): void
    {
        $subject = Subject::create($this->fields());
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get('/admin/school/subjects/create')
            ->assertInertia(fn ($page) => $page->component('admin/school/subjects/create')->has('classes', 1)->has('teachers', 1));

        $this->actingAs($admin)->get("/admin/school/subjects/{$subject->id}/edit")
            ->assertInertia(fn ($page) => $page->component('admin/school/subjects/edit')->has('classes', 1)->has('teachers', 1));
    }

    public function test_removing_a_teacher_leaves_the_subject_without_one(): void
    {
        $subject = Subject::create($this->fields());

        Teacher::findOrFail($subject->teacher_id)->delete();

        $this->assertNull($subject->fresh()->teacher_id);
    }
}
