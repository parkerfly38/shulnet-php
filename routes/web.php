<?php

use App\Http\Controllers\MemberController;
use App\Http\Controllers\MembershipPeriodController;
use App\Http\Controllers\MembershipTierController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\YahrzeitController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\EventTicketTypeController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\PdfTemplateController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GravesiteController;
use App\Http\Controllers\DeedController;
use App\Http\Controllers\IntermentController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\Admin\GabbaiController;
use App\Http\Controllers\ReportsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Admin-only routes
    Route::middleware(['role:admin'])->group(function () {
        Route::get('admin/users', [UserController::class, 'index'])->name('admin.users');
        
        // Member management routes
        Route::resource('admin/members', MemberController::class, [
            'names' => [
                'index' => 'members.index',
                'create' => 'members.create',
                'store' => 'members.store',
                'show' => 'members.show',
                'edit' => 'members.edit',
                'update' => 'members.update',
                'destroy' => 'members.destroy',
            ]
        ]);
        
        // Member import routes
        Route::post('admin/members/import', [MemberController::class, 'import'])->name('members.import');
        Route::get('admin/members/template/download', [MemberController::class, 'downloadTemplate'])->name('members.template.download');

        // Membership period management routes (nested under members)
        Route::resource('admin/members.membership-periods', MembershipPeriodController::class, [
            'names' => [
                'create' => 'members.membership-periods.create',
                'store' => 'members.membership-periods.store',
                'edit' => 'members.membership-periods.edit',
                'update' => 'members.membership-periods.update',
                'destroy' => 'members.membership-periods.destroy',
            ]
        ])->except(['index', 'show']);
        
        // Yahrzeit management routes
        Route::resource('admin/yahrzeits', YahrzeitController::class, [
            'names' => [
                'index' => 'yahrzeits.index',
                'create' => 'yahrzeits.create',
                'store' => 'yahrzeits.store',
                'show' => 'yahrzeits.show',
                'edit' => 'yahrzeits.edit',
                'update' => 'yahrzeits.update',
                'destroy' => 'yahrzeits.destroy',
            ]
        ]);
        
        // Calendar management routes
        Route::resource('admin/calendars', CalendarController::class, [
            'names' => [
                'index' => 'calendars.index',
                'create' => 'calendars.create',
                'store' => 'calendars.store',
                'show' => 'calendars.show',
                'edit' => 'calendars.edit',
                'update' => 'calendars.update',
                'destroy' => 'calendars.destroy',
            ]
        ]);
        
        // Event management routes
        Route::resource('admin/events', EventController::class, [
            'names' => [
                'index' => 'events.index',
                'create' => 'events.create',
                'store' => 'events.store',
                'show' => 'events.show',
                'edit' => 'events.edit',
                'update' => 'events.update',
                'destroy' => 'events.destroy',
            ]
        ]);

        // Event ticket type routes
        Route::resource('admin/events.ticket-types', EventTicketTypeController::class, [
            'names' => [
                'index' => 'events.ticket-types.index',
                'create' => 'events.ticket-types.create',
                'store' => 'events.ticket-types.store',
                'edit' => 'events.ticket-types.edit',
                'update' => 'events.ticket-types.update',
                'destroy' => 'events.ticket-types.destroy',
            ]
        ])->except(['show']);

        Route::resource('admin/notes', NoteController::class, [
            'names' => [
                'index' => 'notes.index',
                'create' => 'notes.create',
                'store' => 'notes.store',
                'show' => 'notes.show',
                'edit' => 'notes.edit',
                'update' => 'notes.update',
                'destroy' => 'notes.destroy',
            ]
        ]);

        // Invoice management routes
        Route::resource('admin/invoices', InvoiceController::class, [
            'names' => [
                'index' => 'invoices.index',
                'create' => 'invoices.create',
                'store' => 'invoices.store',
                'show' => 'invoices.show',
                'edit' => 'invoices.edit',
                'update' => 'invoices.update',
                'destroy' => 'invoices.destroy',
            ]
        ]);
        
        // Generate next recurring invoice
        Route::post('admin/invoices/{invoice}/generate-next', [InvoiceController::class, 'generateNext'])->name('invoices.generate-next');
        
        // Membership Tier management routes
        Route::resource('admin/membership-tiers', MembershipTierController::class, [
            'names' => [
                'index' => 'membership-tiers.index',
                'create' => 'membership-tiers.create',
                'store' => 'membership-tiers.store',
                'show' => 'membership-tiers.show',
                'edit' => 'membership-tiers.edit',
                'update' => 'membership-tiers.update',
                'destroy' => 'membership-tiers.destroy',
            ]
        ]);
        
        // PDF Template management routes
        Route::resource('admin/pdf-templates', PdfTemplateController::class, [
            'names' => [
                'index' => 'pdf-templates.index',
                'create' => 'pdf-templates.create',
                'store' => 'pdf-templates.store',
                'show' => 'pdf-templates.show',
                'edit' => 'pdf-templates.edit',
                'update' => 'pdf-templates.update',
                'destroy' => 'pdf-templates.destroy',
            ]
        ]);
        
        // PDF Template preview and generation
        Route::post('admin/pdf-templates/{pdfTemplate}/preview', [PdfTemplateController::class, 'preview'])->name('pdf-templates.preview');
        Route::post('admin/pdf-templates/{pdfTemplate}/generate', [PdfTemplateController::class, 'generate'])->name('pdf-templates.generate');
        
        // Gravesite management routes
        Route::resource('admin/gravesites', GravesiteController::class, [
            'names' => [
                'index' => 'gravesites.index',
                'create' => 'gravesites.create',
                'store' => 'gravesites.store',
                'show' => 'gravesites.show',
                'edit' => 'gravesites.edit',
                'update' => 'gravesites.update',
                'destroy' => 'gravesites.destroy',
            ]
        ]);
        
        // Deed management routes
        Route::resource('admin/deeds', DeedController::class, [
            'names' => [
                'index' => 'deeds.index',
                'create' => 'deeds.create',
                'store' => 'deeds.store',
                'show' => 'deeds.show',
                'edit' => 'deeds.edit',
                'update' => 'deeds.update',
                'destroy' => 'deeds.destroy',
            ]
        ]);
        
        // Interment management routes
        Route::resource('admin/interments', IntermentController::class, [
            'names' => [
                'index' => 'interments.index',
                'create' => 'interments.create',
                'store' => 'interments.store',
                'show' => 'interments.show',
                'edit' => 'interments.edit',
                'update' => 'interments.update',
                'destroy' => 'interments.destroy',
            ]
        ]);
        
        // Settings routes
        Route::get('admin/settings', [SettingController::class, 'index'])->name('settings.index');
        Route::put('admin/settings', [SettingController::class, 'update'])->name('settings.update');

        // Reports routes
        Route::get('admin/reports', [ReportsController::class, 'index'])->name('reports.index');
        Route::post('admin/reports/export/members', [ReportsController::class, 'exportMembers'])->name('reports.export.members');
        Route::post('admin/reports/export/invoices', [ReportsController::class, 'exportInvoices'])->name('reports.export.invoices');
        Route::post('admin/reports/export/students', [ReportsController::class, 'exportStudents'])->name('reports.export.students');
        Route::post('admin/reports/export/financial-summary', [ReportsController::class, 'exportFinancialSummary'])->name('reports.export.financial-summary');
        Route::post('admin/reports/export/yahrzeit', [ReportsController::class, 'exportYahrzeit'])->name('reports.export.yahrzeit');

        // Gabbai UI pages (Inertia)
        Route::get('admin/gabbai', function () {
            return Inertia::render('admin/gabbai/dashboard');
        })->name('admin.gabbai.dashboard');

        Route::get('admin/gabbai/anniversaries', function () {
            return Inertia::render('admin/gabbai/anniversaries');
        })->name('admin.gabbai.anniversaries');

        Route::get('admin/gabbai/honors', function () {
            return Inertia::render('admin/gabbai/honors');
        })->name('admin.gabbai.honors');

        // School Management UI pages
        Route::get('admin/school', function () {
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
        
        Route::get('admin/school/class-definitions', function () { return Inertia::render('admin/school/class-definitions/index'); })->name('admin.school.class-definitions.index');
        Route::get('admin/school/class-definitions/create', function () { 
            return Inertia::render('admin/school/class-definitions/create', [
                'teachers' => \App\Models\Teacher::select('id', 'first_name', 'last_name')->orderBy('last_name')->get()
            ]); 
        })->name('admin.school.class-definitions.create');
        Route::get('admin/school/class-definitions/{id}', function ($id) { 
            $model = \App\Models\ClassDefinition::with('teacher')->findOrFail($id);
            return Inertia::render('admin/school/class-definitions/show', ['item' => $model]); 
        })->name('admin.school.class-definitions.show');
        Route::get('admin/school/class-definitions/{id}/edit', function ($id) { 
            $model = \App\Models\ClassDefinition::with('teacher')->findOrFail($id);
            return Inertia::render('admin/school/class-definitions/edit', [
                'item' => $model,
                'teachers' => \App\Models\Teacher::select('id', 'first_name', 'last_name')->orderBy('last_name')->get()
            ]); 
        })->name('admin.school.class-definitions.edit');
        Route::get('admin/school/class-grades', function () { return Inertia::render('admin/school/class-grades'); })->name('admin.school.class-grades');
        
        // Exams routes
        Route::get('admin/school/exams', function () { return Inertia::render('admin/school/exams/index'); })->name('admin.school.exams.index');
        Route::get('admin/school/exams/create', function () { return Inertia::render('admin/school/exams/create'); })->name('admin.school.exams.create');
        Route::get('admin/school/exams/{id}', function ($id) { 
            $model = \App\Models\Exam::with('subject')->findOrFail($id);
            return Inertia::render('admin/school/exams/show', ['item' => $model]); 
        })->name('admin.school.exams.show');
        Route::get('admin/school/exams/{id}/edit', function ($id) { 
            $model = \App\Models\Exam::with('subject')->findOrFail($id);
            return Inertia::render('admin/school/exams/edit', ['item' => $model]); 
        })->name('admin.school.exams.edit');
        
        Route::get('admin/school/exam-grades', function () { return Inertia::render('admin/school/exam-grades'); })->name('admin.school.exam-grades');
        
        // Parents routes
        Route::get('admin/school/parents', function () { return Inertia::render('admin/school/parents/index'); })->name('admin.school.parents.index');
        Route::get('admin/school/parents/create', function () { return Inertia::render('admin/school/parents/create'); })->name('admin.school.parents.create');
        Route::get('admin/school/parents/{id}', function ($id) { 
            $model = \App\Models\ParentModel::findOrFail($id);
            return Inertia::render('admin/school/parents/show', ['item' => $model]); 
        })->name('admin.school.parents.show');
        Route::get('admin/school/parents/{id}/edit', function ($id) { 
            $model = \App\Models\ParentModel::findOrFail($id);
            return Inertia::render('admin/school/parents/edit', ['item' => $model]); 
        })->name('admin.school.parents.edit');
        
        // Students routes
        Route::get('admin/school/students', function () { return Inertia::render('admin/school/students/index'); })->name('admin.school.students.index');
        Route::get('admin/school/students/create', function () { return Inertia::render('admin/school/students/create'); })->name('admin.school.students.create');
        Route::get('admin/school/students/{id}', function ($id) { 
            $model = \App\Models\Student::with('parent')->findOrFail($id);
            return Inertia::render('admin/school/students/show', ['item' => $model]); 
        })->name('admin.school.students.show');
        Route::get('admin/school/students/{id}/edit', function ($id) { 
            $model = \App\Models\Student::with('parent')->findOrFail($id);
            return Inertia::render('admin/school/students/edit', ['item' => $model]); 
        })->name('admin.school.students.edit');
        
        // Attendance routes
        Route::get('admin/school/attendance', function () { return Inertia::render('admin/school/attendance/index'); })->name('admin.school.attendance.index');
        Route::get('admin/school/attendance/mark', function () { 
            $students = \App\Models\Student::select('id', 'first_name', 'last_name')->orderBy('last_name')->get();
            $classes = \App\Models\ClassDefinition::with('teacher')->select('id', 'class_name', 'teacher_id')->get();
            return Inertia::render('admin/school/attendance/mark', ['students' => $students, 'classes' => $classes]); 
        })->name('admin.school.attendance.mark');
        
        // Subjects routes
        Route::get('admin/school/subjects', function () { return Inertia::render('admin/school/subjects'); })->name('admin.school.subjects.index');
        Route::get('admin/school/subjects/create', function () { return Inertia::render('admin/school/subjects/create'); })->name('admin.school.subjects.create');
        Route::get('admin/school/subjects/{id}', function ($id) { 
            $model = \App\Models\Subject::findOrFail($id);
            return Inertia::render('admin/school/subjects/show', ['item' => $model]); 
        })->name('admin.school.subjects.show');
        Route::get('admin/school/subjects/{id}/edit', function ($id) { 
            $model = \App\Models\Subject::findOrFail($id);
            return Inertia::render('admin/school/subjects/edit', ['item' => $model]); 
        })->name('admin.school.subjects.edit');
        
        Route::get('admin/school/subject-grades', function () { return Inertia::render('admin/school/subject-grades'); })->name('admin.school.subject-grades');
        
        // Teachers routes
        Route::get('admin/school/teachers', function () { return Inertia::render('admin/school/teachers/index'); })->name('admin.school.teachers.index');
        Route::get('admin/school/teachers/create', function () { return Inertia::render('admin/school/teachers/create'); })->name('admin.school.teachers.create');
        Route::get('admin/school/teachers/{id}', function ($id) { 
            $model = \App\Models\Teacher::findOrFail($id);
            return Inertia::render('admin/school/teachers/show', ['item' => $model]); 
        })->name('admin.school.teachers.show');
        Route::get('admin/school/teachers/{id}/edit', function ($id) { 
            $model = \App\Models\Teacher::findOrFail($id);
            return Inertia::render('admin/school/teachers/edit', ['item' => $model]); 
        })->name('admin.school.teachers.edit');
        
        // Mark all user notifications as seen
        Route::post('admin/notifications/mark-seen', [NoteController::class, 'markAllSeen'])->name('notifications.mark-seen');
    });
});

// API routes for admin functionality
Route::middleware(['auth:web', 'role:admin'])->prefix('api/admin')->group(function () {
    Route::put('users/{user}/roles', [UserController::class, 'updateRoles'])->name('api.admin.users.roles.update');
    
    // Member search API endpoint
    Route::get('members/search', [MemberController::class, 'search'])->name('api.admin.members.search');
    
    // Yahrzeit search API endpoint
    Route::get('yahrzeits/search', [YahrzeitController::class, 'search'])->name('api.admin.yahrzeits.search');

    // Gabbai endpoints
    Route::get('gabbai/anniversaries', [GabbaiController::class, 'anniversaries'])->name('api.admin.gabbai.anniversaries');
    Route::get('gabbai/pledges', [GabbaiController::class, 'pledges'])->name('api.admin.gabbai.pledges');
    Route::get('gabbai/assignments', [GabbaiController::class, 'assignments'])->name('api.admin.gabbai.assignments');
    Route::post('gabbai/assignments', [GabbaiController::class, 'saveAssignments'])->name('api.admin.gabbai.assignments.save');
    Route::get('gabbai/config', [GabbaiController::class, 'config'])->name('api.admin.gabbai.config');

    // School resources
    Route::apiResource('attendances', \App\Http\Controllers\AttendanceController::class);
    Route::apiResource('class-definitions', \App\Http\Controllers\ClassDefinitionController::class);
    Route::apiResource('class-grades', \App\Http\Controllers\ClassGradeController::class);
    Route::apiResource('exams', \App\Http\Controllers\ExamController::class);
    Route::apiResource('exam-grades', \App\Http\Controllers\ExamGradeController::class);
    Route::apiResource('parents', \App\Http\Controllers\ParentModelController::class);
    Route::apiResource('students', \App\Http\Controllers\StudentController::class);
    Route::apiResource('subjects', \App\Http\Controllers\SubjectController::class);
    Route::apiResource('subject-grades', \App\Http\Controllers\SubjectGradeController::class);
    Route::apiResource('teachers', \App\Http\Controllers\TeacherController::class);
});

require __DIR__.'/settings.php';
