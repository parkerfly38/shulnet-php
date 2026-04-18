<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// All routes in this file are prefixed with 'admin/school' and require admin role
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin/school')->group(function () {
    
    // School Dashboard
    Route::get('/', function () {
        return Inertia::render('admin/school/index', [
            'stats' => [
                'students' => \App\Models\Student::count(),
                'teachers' => \App\Models\Teacher::count(),
                'classes' => \App\Models\ClassDefinition::count(),
                'subjects' => \App\Models\Subject::count(),
                'exams' => \App\Models\Exam::count(),
                'parents' => \App\Models\ParentModel::count(),
            ],
            'recentStudents' => \App\Models\Student::with('parent')->latest()->take(5)->get(),
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
    Route::get('class-grades', fn() => Inertia::render('admin/school/class-grades'))->name('admin.school.class-grades');

    // Exams
    Route::get('exams', fn() => Inertia::render('admin/school/exams/index'))->name('admin.school.exams.index');
    Route::get('exams/create', fn() => Inertia::render('admin/school/exams/create'))->name('admin.school.exams.create');
    Route::get('exams/{id}', function ($id) {
        $model = \App\Models\Exam::with('subject')->findOrFail($id);
        return Inertia::render('admin/school/exams/show', ['item' => $model]);
    })->name('admin.school.exams.show');
    Route::get('exams/{id}/edit', function ($id) {
        $model = \App\Models\Exam::with('subject')->findOrFail($id);
        return Inertia::render('admin/school/exams/edit', ['item' => $model]);
    })->name('admin.school.exams.edit');

    // Exam Grades
    Route::get('exam-grades', fn() => Inertia::render('admin/school/exam-grades'))->name('admin.school.exam-grades');

    // Parents
    Route::get('parents', fn() => Inertia::render('admin/school/parents/index'))->name('admin.school.parents.index');
    Route::get('parents/create', fn() => Inertia::render('admin/school/parents/create'))->name('admin.school.parents.create');
    Route::get('parents/{id}', function ($id) {
        $model = \App\Models\ParentModel::findOrFail($id);
        return Inertia::render('admin/school/parents/show', ['item' => $model]);
    })->name('admin.school.parents.show');
    Route::get('parents/{id}/edit', function ($id) {
        $model = \App\Models\ParentModel::findOrFail($id);
        return Inertia::render('admin/school/parents/edit', ['item' => $model]);
    })->name('admin.school.parents.edit');

    // Students
    Route::get('students', fn() => Inertia::render('admin/school/students/index'))->name('admin.school.students.index');
    Route::get('students/create', fn() => Inertia::render('admin/school/students/create'))->name('admin.school.students.create');
    Route::get('students/{id}', function ($id) {
        $model = \App\Models\Student::with('parent')->findOrFail($id);
        return Inertia::render('admin/school/students/show', ['item' => $model]);
    })->name('admin.school.students.show');
    Route::get('students/{id}/edit', function ($id) {
        $model = \App\Models\Student::with('parent')->findOrFail($id);
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
    Route::get('subjects/create', fn() => Inertia::render('admin/school/subjects/create'))->name('admin.school.subjects.create');
    Route::get('subjects/{id}', function ($id) {
        $model = \App\Models\Subject::findOrFail($id);
        return Inertia::render('admin/school/subjects/show', ['item' => $model]);
    })->name('admin.school.subjects.show');
    Route::get('subjects/{id}/edit', function ($id) {
        $model = \App\Models\Subject::findOrFail($id);
        return Inertia::render('admin/school/subjects/edit', ['item' => $model]);
    })->name('admin.school.subjects.edit');

    // Subject Grades
    Route::get('subject-grades', fn() => Inertia::render('admin/school/subject-grades'))->name('admin.school.subject-grades');

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
