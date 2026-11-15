<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClassDefinition;
use App\Models\ClassGrade;
use App\Models\Exam;
use App\Models\ExamGrade;
use App\Models\Student;
use App\Models\SubjectGrade;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Grade entry organized the way teachers work: a class's roster with its class and subject grades,
 * and an exam's score sheet. A student is enrolled in a class by having a class grade row for it,
 * which is also how the member portal lists a child's classes.
 */
class GradebookController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/school/gradebook/index', [
            'classes' => ClassDefinition::with('teacher:id,first_name,last_name')
                ->withCount(['classGrades as students_count', 'subjects'])
                ->orderBy('name')
                ->get(['id', 'name', 'teacher_id'])
                ->map(fn ($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'teacher_name' => $c->teacher ? trim("{$c->teacher->first_name} {$c->teacher->last_name}") : null,
                    'students_count' => $c->students_count,
                    'subjects_count' => $c->subjects_count,
                ]),
            'exams' => Exam::with('subject:id,name')
                ->withCount('examgrades as graded_count')
                ->orderByDesc('start_date')
                ->orderBy('name')
                ->get()
                ->map(fn ($e) => [
                    'id' => $e->id,
                    'name' => $e->name,
                    'subject_name' => $e->subject?->name,
                    'start_date' => $e->start_date,
                    'graded_count' => $e->graded_count,
                ]),
        ]);
    }

    public function classBook(int $id): Response
    {
        $class = ClassDefinition::with('teacher:id,first_name,last_name')->findOrFail($id);
        $subjects = $class->subjects()->orderBy('name')->get(['id', 'name', 'subject_code']);
        $enrollments = ClassGrade::with('student:id,first_name,last_name')->where('class_definition_id', $class->id)->get();
        $studentIds = $enrollments->pluck('student_id');

        $subjectGrades = SubjectGrade::whereIn('subject_id', $subjects->pluck('id'))
            ->whereIn('student_id', $studentIds)
            ->get()
            ->groupBy('student_id');

        $rows = $enrollments
            ->filter(fn ($e) => $e->student)
            ->map(fn ($e) => [
                'student_id' => $e->student_id,
                'name' => $this->studentName($e->student),
                'grade' => $e->grade,
                'subjects' => (object) ($subjectGrades->get($e->student_id) ?? collect())->pluck('grade', 'subject_id')->all(),
            ])
            ->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)
            ->values();

        return Inertia::render('admin/school/gradebook/class', [
            'schoolClass' => [
                'id' => $class->id,
                'name' => $class->name,
                'teacher_name' => $class->teacher ? trim("{$class->teacher->first_name} {$class->teacher->last_name}") : null,
            ],
            'subjects' => $subjects,
            'rows' => $rows,
            'students' => $this->allStudents(),
        ]);
    }

    /**
     * Saves every row: class grades (enrolling any student added on the page) and subject grades.
     * A cleared subject grade is removed; a cleared class grade keeps the student enrolled.
     */
    public function saveClass(Request $request, int $id): RedirectResponse
    {
        $class = ClassDefinition::findOrFail($id);
        $subjectIds = $class->subjects()->pluck('id')->map(fn ($v) => (string) $v)->all();

        $validated = $request->validate([
            'rows' => ['present', 'array'],
            'rows.*.student_id' => ['required', 'integer', 'distinct', 'exists:students,id'],
            'rows.*.grade' => ['nullable', 'string', 'max:50'],
            'rows.*.subjects' => ['nullable', 'array'],
            'rows.*.subjects.*' => ['nullable', 'string', 'max:50'],
        ]);

        DB::transaction(function () use ($validated, $class, $subjectIds) {
            foreach ($validated['rows'] as $row) {
                ClassGrade::updateOrCreate(
                    ['class_definition_id' => $class->id, 'student_id' => $row['student_id']],
                    ['grade' => $row['grade'] ?? null],
                );

                foreach ($row['subjects'] ?? [] as $subjectId => $grade) {
                    if (! in_array((string) $subjectId, $subjectIds, true)) {
                        continue; // not one of this class's subjects
                    }

                    $this->saveOrClear(
                        SubjectGrade::class,
                        ['subject_id' => $subjectId, 'student_id' => $row['student_id']],
                        ['grade' => $grade],
                    );
                }
            }
        });

        return back()->with('success', 'Grades saved.');
    }

    /**
     * Takes a student off the class roster. Their subject grades stay, as a record of the work.
     */
    public function unenroll(int $id, int $student): RedirectResponse
    {
        ClassGrade::where('class_definition_id', $id)->where('student_id', $student)->delete();

        return back()->with('success', 'Student removed from the class.');
    }

    /**
     * The exam's sheet lists the students in its subject's class, plus anyone already graded on it.
     */
    public function examBook(int $id): Response
    {
        $exam = Exam::with('subject.classDefinition:id,name')->findOrFail($id);
        $classId = $exam->subject?->class_id;
        $grades = ExamGrade::where('exam_id', $exam->id)->get()->keyBy('student_id');

        $enrolledIds = $classId
            ? ClassGrade::where('class_definition_id', $classId)->pluck('student_id')
            : collect();

        $rows = Student::whereIn('id', $enrolledIds->merge($grades->keys())->unique())
            ->get(['id', 'first_name', 'last_name'])
            ->map(fn ($s) => [
                'student_id' => $s->id,
                'name' => $this->studentName($s),
                'score' => $grades->get($s->id)?->score,
                'grade' => $grades->get($s->id)?->grade,
                'in_class' => $enrolledIds->contains($s->id),
            ])
            ->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)
            ->values();

        return Inertia::render('admin/school/gradebook/exam', [
            'exam' => [
                'id' => $exam->id,
                'name' => $exam->name,
                'start_date' => $exam->start_date,
                'end_date' => $exam->end_date,
                'subject_id' => $exam->subject_id,
                'subject_name' => $exam->subject?->name,
                'class_id' => $classId,
                'class_name' => $exam->subject?->classDefinition?->name,
            ],
            'rows' => $rows,
            'students' => $this->allStudents(),
        ]);
    }

    /**
     * Saves every row of the exam sheet. A row with neither score nor grade removes that student's result.
     */
    public function saveExam(Request $request, int $id): RedirectResponse
    {
        $exam = Exam::findOrFail($id);

        $validated = $request->validate([
            'rows' => ['present', 'array'],
            'rows.*.student_id' => ['required', 'integer', 'distinct', 'exists:students,id'],
            'rows.*.score' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'rows.*.grade' => ['nullable', 'string', 'max:50'],
        ]);

        DB::transaction(function () use ($validated, $exam) {
            foreach ($validated['rows'] as $row) {
                $this->saveOrClear(
                    ExamGrade::class,
                    ['exam_id' => $exam->id, 'student_id' => $row['student_id']],
                    ['score' => $row['score'] ?? null, 'grade' => $row['grade'] ?? null],
                );
            }
        });

        return back()->with('success', 'Grades saved.');
    }

    /**
     * Upserts a grade row, or deletes it when every value is blank.
     *
     * @param  class-string<Model>  $model
     */
    private function saveOrClear(string $model, array $keys, array $values): void
    {
        $blank = collect($values)->every(fn ($v) => $v === null || trim((string) $v) === '');

        if ($blank) {
            $model::where($keys)->delete();
        } else {
            $model::updateOrCreate($keys, $values);
        }
    }

    private function allStudents(): Collection
    {
        return Student::orderBy('last_name')->orderBy('first_name')->get(['id', 'first_name', 'last_name'])
            ->map(fn ($s) => ['id' => $s->id, 'name' => $this->studentName($s)]);
    }

    private function studentName(Student $student): string
    {
        return trim("{$student->last_name}, {$student->first_name}", ', ');
    }
}
