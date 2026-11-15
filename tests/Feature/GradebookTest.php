<?php

namespace Tests\Feature;

use App\Models\ClassDefinition;
use App\Models\ClassGrade;
use App\Models\Exam;
use App\Models\ExamGrade;
use App\Models\Student;
use App\Models\Subject;
use App\Models\SubjectGrade;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GradebookTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private ClassDefinition $class;

    private Subject $hebrew;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
        $this->class = ClassDefinition::create(['name' => 'Aleph Class']);
        $this->hebrew = Subject::create(['name' => 'Hebrew Reading', 'class_id' => $this->class->id]);
    }

    private function student(string $first): Student
    {
        return Student::create(['first_name' => $first, 'last_name' => 'Morgan']);
    }

    private function saveClass(array $rows)
    {
        return $this->actingAs($this->admin)->put("/admin/school/class-definitions/{$this->class->id}/gradebook", ['rows' => $rows]);
    }

    public function test_class_gradebook_lists_the_roster_with_class_and_subject_grades(): void
    {
        $noah = $this->student('Noah');
        ClassGrade::create(['class_definition_id' => $this->class->id, 'student_id' => $noah->id, 'grade' => 'A']);
        SubjectGrade::create(['subject_id' => $this->hebrew->id, 'student_id' => $noah->id, 'grade' => 'B+']);
        Subject::create(['name' => 'Another Class Subject']); // not linked, so not a column

        $this->actingAs($this->admin)->get("/admin/school/class-definitions/{$this->class->id}/gradebook")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/school/gradebook/class')
                ->has('subjects', 1)
                ->where('rows.0.name', 'Morgan, Noah')
                ->where('rows.0.grade', 'A')
                ->where("rows.0.subjects.{$this->hebrew->id}", 'B+'));
    }

    // Adding a student on the page and saving enrolls them; that's what the member portal reads.
    public function test_saving_enrolls_new_students_and_records_grades(): void
    {
        $ava = $this->student('Ava');

        $this->saveClass([['student_id' => $ava->id, 'grade' => 'A-', 'subjects' => [$this->hebrew->id => 'A']]])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $this->assertSame('A-', ClassGrade::where('class_definition_id', $this->class->id)->sole()->grade);
        $this->assertSame('A', SubjectGrade::sole()->grade);
        $this->assertSame(['Aleph Class'], $ava->fresh()->classGrades()->with('classDefinition')->get()->pluck('classDefinition.name')->all());
    }

    public function test_saving_again_updates_without_duplicates_and_clearing_a_subject_grade_removes_it(): void
    {
        $ava = $this->student('Ava');
        $this->saveClass([['student_id' => $ava->id, 'grade' => 'B', 'subjects' => [$this->hebrew->id => 'B']]]);

        $this->saveClass([['student_id' => $ava->id, 'grade' => '', 'subjects' => [$this->hebrew->id => '']]])
            ->assertSessionHasNoErrors();

        $enrollment = ClassGrade::sole();
        $this->assertNull($enrollment->grade); // still enrolled, just ungraded
        $this->assertSame(0, SubjectGrade::count());
    }

    public function test_subjects_from_other_classes_are_ignored(): void
    {
        $ava = $this->student('Ava');
        $other = Subject::create(['name' => 'Talmud', 'class_id' => ClassDefinition::create(['name' => 'Bet Class'])->id]);

        $this->saveClass([['student_id' => $ava->id, 'grade' => 'A', 'subjects' => [$other->id => 'A']]])->assertSessionHasNoErrors();

        $this->assertSame(0, SubjectGrade::count());
    }

    public function test_removing_a_student_unenrolls_but_keeps_subject_grades(): void
    {
        $ava = $this->student('Ava');
        $this->saveClass([['student_id' => $ava->id, 'grade' => 'A', 'subjects' => [$this->hebrew->id => 'A']]]);

        $this->actingAs($this->admin)
            ->delete("/admin/school/class-definitions/{$this->class->id}/gradebook/students/{$ava->id}")
            ->assertSessionHas('success');

        $this->assertSame(0, ClassGrade::count());
        $this->assertSame(1, SubjectGrade::count());
    }

    public function test_exam_sheet_lists_the_subjects_class_and_saves_scores(): void
    {
        $noah = $this->student('Noah');
        $ava = $this->student('Ava');
        ClassGrade::create(['class_definition_id' => $this->class->id, 'student_id' => $noah->id]);
        ClassGrade::create(['class_definition_id' => $this->class->id, 'student_id' => $ava->id]);
        $exam = Exam::create(['name' => 'Midterm', 'subject_id' => $this->hebrew->id, 'start_date' => '2026-12-06']);

        $this->actingAs($this->admin)->get("/admin/school/exams/{$exam->id}/grades")
            ->assertInertia(fn ($page) => $page
                ->component('admin/school/gradebook/exam')
                ->where('exam.class_name', 'Aleph Class')
                ->has('rows', 2)
                ->where('rows.0.name', 'Morgan, Ava'));

        $this->actingAs($this->admin)->put("/admin/school/exams/{$exam->id}/grades", ['rows' => [
            ['student_id' => $noah->id, 'score' => 92, 'grade' => 'A-'],
            ['student_id' => $ava->id, 'score' => null, 'grade' => ''],
        ]])->assertSessionHasNoErrors();

        $this->assertSame(92, ExamGrade::sole()->score);
        $this->assertSame($noah->id, ExamGrade::sole()->student_id);
    }

    public function test_clearing_an_exam_result_removes_it_and_bad_scores_are_rejected(): void
    {
        $noah = $this->student('Noah');
        $exam = Exam::create(['name' => 'Quiz']);
        ExamGrade::create(['exam_id' => $exam->id, 'student_id' => $noah->id, 'score' => 80]);

        $this->actingAs($this->admin)->put("/admin/school/exams/{$exam->id}/grades", ['rows' => [
            ['student_id' => $noah->id, 'score' => -5, 'grade' => null],
        ]])->assertSessionHasErrors('rows.0.score');

        $this->actingAs($this->admin)->put("/admin/school/exams/{$exam->id}/grades", ['rows' => [
            ['student_id' => $noah->id, 'score' => null, 'grade' => null],
        ]])->assertSessionHasNoErrors();

        $this->assertSame(0, ExamGrade::count());
    }

    public function test_overview_student_page_and_old_screens(): void
    {
        $noah = $this->student('Noah');
        $this->saveClass([['student_id' => $noah->id, 'grade' => 'A', 'subjects' => [$this->hebrew->id => 'B']]]);

        $this->actingAs($this->admin)->get('/admin/school/gradebook')
            ->assertInertia(fn ($page) => $page
                ->component('admin/school/gradebook/index')
                ->where('classes.0.students_count', 1)
                ->where('classes.0.subjects_count', 1));

        $this->actingAs($this->admin)->get("/admin/school/students/{$noah->id}")
            ->assertInertia(fn ($page) => $page
                ->where('item.class_grades.0.class_definition.name', 'Aleph Class')
                ->where('item.subject_grades.0.subject.name', 'Hebrew Reading'));

        foreach (['class-grades', 'subject-grades', 'exam-grades'] as $old) {
            $this->actingAs($this->admin)->get("/admin/school/{$old}")->assertRedirect('/admin/school/gradebook');
        }
    }

    public function test_the_migration_removes_duplicate_grades(): void
    {
        $migration = require database_path('migrations/2026_11_15_000003_make_grades_unique_per_student.php');
        $migration->down();
        $noah = $this->student('Noah');
        ClassGrade::create(['class_definition_id' => $this->class->id, 'student_id' => $noah->id, 'grade' => 'old']);
        $this->travel(1)->minutes();
        ClassGrade::create(['class_definition_id' => $this->class->id, 'student_id' => $noah->id, 'grade' => 'new']);

        $migration->up();

        $this->assertSame('new', ClassGrade::sole()->grade);
    }
}
