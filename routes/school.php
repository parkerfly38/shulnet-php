<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// All routes in this file are prefixed with 'admin/school' and require admin role
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin/school')->group(function () {
    
    // Data the student onboarding dialog needs on any school page that opens it
    $studentOnboardingProps = fn () => [
        'schoolTuitionTiers' => \App\Models\SchoolTuitionTier::active()->ordered()
            ->get(['id', 'name', 'slug', 'description', 'price', 'billing_period', 'features']),
        'parents' => \App\Models\ParentModel::select('id', 'first_name', 'last_name', 'email')
            ->orderBy('last_name')->orderBy('first_name')->get(),
        'members' => \App\Models\Member::select('id', 'first_name', 'last_name', 'email')
            ->orderBy('last_name')->orderBy('first_name')->get(),
    ];

    // School Dashboard
    Route::get('/', function () use ($studentOnboardingProps) {
        return Inertia::render('admin/school/index', $studentOnboardingProps() + [
            'stats' => [
                'students' => \App\Models\Student::count(),
                'teachers' => \App\Models\Teacher::count(),
                'classes' => \App\Models\ClassDefinition::count(),
                'subjects' => \App\Models\Subject::count(),
                'exams' => \App\Models\Exam::count(),
                'parents' => \App\Models\ParentModel::count(),
            ],
            'recentStudents' => \App\Models\Student::with('parents')->latest()->take(5)->get(),
            'upcomingExams' => \App\Models\Exam::with('subject')
                ->where('start_date', '>=', now())
                ->orderBy('start_date')
                ->take(5)
                ->get(),
            'activeClasses' => \App\Models\ClassDefinition::with('teacher')->take(5)->get(),
        ]);
    })->name('admin.school.dashboard');

    // Class Definitions
    Route::get('class-definitions', fn() => Inertia::render('admin/school/class-definitions/index'))->name('admin.school.class-definitions.index');
    Route::get('class-definitions/create', function () {
        return Inertia::render('admin/school/class-definitions/create', [
            'teachers' => \App\Models\Teacher::select('id', 'first_name', 'last_name')->orderBy('last_name')->get(),
        ]);
    })->name('admin.school.class-definitions.create');
    Route::get('class-definitions/{id}', function ($id) {
        $model = \App\Models\ClassDefinition::with('teacher')->findOrFail($id);
        return Inertia::render('admin/school/class-definitions/show', ['item' => $model]);
    })->name('admin.school.class-definitions.show');
    Route::get('class-definitions/{id}/edit', function ($id) {
        $model = \App\Models\ClassDefinition::with('teacher')->findOrFail($id);
        return Inertia::render('admin/school/class-definitions/edit', [
            'item' => $model,
            'teachers' => \App\Models\Teacher::select('id', 'first_name', 'last_name')->orderBy('last_name')->get(),
        ]);
    })->name('admin.school.class-definitions.edit');

    // Class Grades
    // Gradebook: grades are entered per class (roster, class and subject grades) and per exam.
    Route::get('gradebook', [\App\Http\Controllers\Admin\GradebookController::class, 'index'])->name('admin.school.gradebook.index');
    Route::get('class-definitions/{id}/gradebook', [\App\Http\Controllers\Admin\GradebookController::class, 'classBook'])->whereNumber('id')->name('admin.school.gradebook.class');
    Route::put('class-definitions/{id}/gradebook', [\App\Http\Controllers\Admin\GradebookController::class, 'saveClass'])->whereNumber('id')->name('admin.school.gradebook.class.save');
    Route::delete('class-definitions/{id}/gradebook/students/{student}', [\App\Http\Controllers\Admin\GradebookController::class, 'unenroll'])->whereNumber(['id', 'student'])->name('admin.school.gradebook.class.unenroll');
    Route::get('exams/{id}/grades', [\App\Http\Controllers\Admin\GradebookController::class, 'examBook'])->whereNumber('id')->name('admin.school.gradebook.exam');
    Route::put('exams/{id}/grades', [\App\Http\Controllers\Admin\GradebookController::class, 'saveExam'])->whereNumber('id')->name('admin.school.gradebook.exam.save');

    // The old one-row-at-a-time grade screens
    Route::redirect('class-grades', '/admin/school/gradebook')->name('admin.school.class-grades');

    // Exams
    Route::get('exams', fn() => Inertia::render('admin/school/exams/index'))->name('admin.school.exams.index');
    $examSubjects = fn () => ['subjects' => \App\Models\Subject::select('id', 'name')->orderBy('name')->get()];
    Route::get('exams/create', fn () => Inertia::render('admin/school/exams/create', $examSubjects()))->name('admin.school.exams.create');
    Route::get('exams/{id}', function ($id) {
        $model = \App\Models\Exam::with('subject')->findOrFail($id);
        return Inertia::render('admin/school/exams/show', ['item' => $model]);
    })->name('admin.school.exams.show');
    Route::get('exams/{id}/edit', function ($id) use ($examSubjects) {
        $model = \App\Models\Exam::with('subject')->findOrFail($id);
        return Inertia::render('admin/school/exams/edit', ['item' => $model] + $examSubjects());
    })->name('admin.school.exams.edit');

    // Exam Grades
    Route::redirect('exam-grades', '/admin/school/gradebook')->name('admin.school.exam-grades');

    // Parents
    Route::get('parents', fn() => Inertia::render('admin/school/parents/index'))->name('admin.school.parents.index');
    Route::get('parents/create', fn() => Inertia::render('admin/school/parents/create'))->name('admin.school.parents.create');
    Route::get('parents/{id}', function ($id) {
        $model = \App\Models\ParentModel::with('students')->findOrFail($id);
        return Inertia::render('admin/school/parents/show', ['item' => $model]);
    })->name('admin.school.parents.show');
    Route::get('parents/{id}/edit', function ($id) {
        $model = \App\Models\ParentModel::with('students')->findOrFail($id);
        return Inertia::render('admin/school/parents/edit', ['item' => $model]);
    })->name('admin.school.parents.edit');

    // Students
    Route::get('students', fn() => Inertia::render('admin/school/students/index', $studentOnboardingProps()))->name('admin.school.students.index');
    Route::get('students/create', fn() => Inertia::render('admin/school/students/create'))->name('admin.school.students.create');
    Route::get('students/{id}', function ($id) {
        $model = \App\Models\Student::with([
            'parents',
            'classGrades.classDefinition:id,name',
            'subjectGrades.subject:id,name',
            'examGrades.exam:id,name,start_date',
        ])->findOrFail($id);
        return Inertia::render('admin/school/students/show', ['item' => $model]);
    })->name('admin.school.students.show');
    Route::get('students/{id}/edit', function ($id) {
        $model = \App\Models\Student::with('parents')->findOrFail($id);
        return Inertia::render('admin/school/students/edit', ['item' => $model]);
    })->name('admin.school.students.edit');
    Route::post('students/import', [\App\Http\Controllers\StudentController::class, 'import'])->name('admin.school.students.import');
    Route::get('students/template/download', [\App\Http\Controllers\StudentController::class, 'downloadTemplate'])->name('admin.school.students.template.download');

    // Attendance
    Route::get('attendance', fn() => Inertia::render('admin/school/attendance/index'))->name('admin.school.attendance.index');
    Route::get('attendance/mark', function () {
        $students = \App\Models\Student::select('id', 'first_name', 'last_name')->orderBy('last_name')->get();
        $classes = \App\Models\ClassDefinition::with('teacher')->select('id', 'name', 'teacher_id')->get();
        return Inertia::render('admin/school/attendance/mark', ['students' => $students, 'classes' => $classes]);
    })->name('admin.school.attendance.mark');

    // Subjects
    Route::get('subjects', fn() => Inertia::render('admin/school/subjects'))->name('admin.school.subjects.index');
    // Classes and teachers to pick from on the subject forms
    $subjectFormOptions = fn () => [
        'classes' => \App\Models\ClassDefinition::select('id', 'name')->orderBy('name')->get(),
        'teachers' => \App\Models\Teacher::select('id', 'first_name', 'last_name')->orderBy('last_name')->orderBy('first_name')->get(),
    ];
    Route::get('subjects/create', fn () => Inertia::render('admin/school/subjects/create', $subjectFormOptions()))->name('admin.school.subjects.create');
    Route::get('subjects/{id}', function ($id) {
        $model = \App\Models\Subject::with(['classDefinition', 'teacher'])->findOrFail($id);
        return Inertia::render('admin/school/subjects/show', ['item' => $model]);
    })->name('admin.school.subjects.show');
    Route::get('subjects/{id}/edit', function ($id) use ($subjectFormOptions) {
        $model = \App\Models\Subject::findOrFail($id);
        return Inertia::render('admin/school/subjects/edit', ['item' => $model] + $subjectFormOptions());
    })->name('admin.school.subjects.edit');

    // Subject Grades
    Route::redirect('subject-grades', '/admin/school/gradebook')->name('admin.school.subject-grades');

    // Teachers
    Route::get('teachers', fn() => Inertia::render('admin/school/teachers/index'))->name('admin.school.teachers.index');
    Route::get('teachers/create', fn() => Inertia::render('admin/school/teachers/create'))->name('admin.school.teachers.create');
    Route::get('teachers/{id}', function ($id) {
        $model = \App\Models\Teacher::findOrFail($id);
        return Inertia::render('admin/school/teachers/show', ['item' => $model]);
    })->name('admin.school.teachers.show');
    Route::get('teachers/{id}/edit', function ($id) {
        $model = \App\Models\Teacher::findOrFail($id);
        return Inertia::render('admin/school/teachers/edit', ['item' => $model]);
    })->name('admin.school.teachers.edit');
});
