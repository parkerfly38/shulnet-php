<?php

use App\Http\Controllers\Admin\GabbaiController;
use App\Http\Controllers\Api\TokenController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\CommitteeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeviceTokenController;
use App\Http\Controllers\EmailRecordController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\EventRSVPController;
use App\Http\Controllers\HtmlPageController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\Member\MemberDashboardController;
use App\Http\Controllers\MeetingController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\YahrzeitController;
use Illuminate\Support\Facades\Route;

// Login/Logout (no auth required for login)
Route::post('login', [TokenController::class, 'login'])->name('api.login');
Route::post('logout', [TokenController::class, 'logout'])->middleware('auth:sanctum')->name('api.logout');

// Token Management
Route::post('tokens/create', [TokenController::class, 'create'])->name('api.tokens.create');
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('tokens', [TokenController::class, 'index'])->name('api.tokens.index');
    Route::delete('tokens/{tokenId}', [TokenController::class, 'destroy'])->name('api.tokens.destroy');
    Route::delete('tokens', [TokenController::class, 'destroyAll'])->name('api.tokens.destroy-all');
});

// Device Token Management (authenticated users)
Route::middleware(['auth:sanctum'])->prefix('device-tokens')->group(function () {
    Route::get('/', [DeviceTokenController::class, 'index'])->name('api.device-tokens.index');
    Route::post('/register', [DeviceTokenController::class, 'register'])->name('api.device-tokens.register');
    Route::post('/unregister', [DeviceTokenController::class, 'unregister'])->name('api.device-tokens.unregister');
});

// Member Portal API (authenticated users)
Route::middleware(['auth:sanctum'])->prefix('member')->group(function () {
    Route::get('dashboard', [MemberDashboardController::class, 'apiDashboard'])->name('api.member.dashboard');
    Route::get('profile', [MemberDashboardController::class, 'apiProfile'])->name('api.member.profile');
    Route::put('profile', [MemberDashboardController::class, 'apiUpdateProfile'])->name('api.member.profile.update');
    Route::get('invoices', [MemberDashboardController::class, 'apiInvoices'])->name('api.member.invoices');
    Route::get('invoices/{id}', [MemberDashboardController::class, 'apiShowInvoice'])->name('api.member.invoices.show');
    Route::post('invoices/{id}/pay', [MemberDashboardController::class, 'apiPayInvoice'])->name('api.member.invoices.pay');
    Route::get('students', [MemberDashboardController::class, 'apiStudents'])->name('api.member.students');
    Route::get('yahrzeits', [MemberDashboardController::class, 'apiYahrzeits'])->name('api.member.yahrzeits');
    
    // Banner API routes for members
    Route::get('banners', [BannerController::class, 'apiGetActiveBanners'])->name('api.member.banners');
    Route::post('banners/{banner}/viewed', [BannerController::class, 'apiMarkAsViewed'])->name('api.member.banners.viewed');
    Route::post('banners/{banner}/dismissed', [BannerController::class, 'apiMarkAsDismissed'])->name('api.member.banners.dismissed');
    Route::post('banners/{banner}/clicked', [BannerController::class, 'apiMarkAsClicked'])->name('api.member.banners.clicked');
});

// Admin API Routes
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'apiAdminDashboard'])->name('api.admin.dashboard');

    // User Management
    Route::put('users/{user}/roles', [UserController::class, 'updateRoles'])->name('api.admin.users.roles.update');
    Route::post('users/{user}/set-default-admin', [UserController::class, 'setDefaultAdmin'])->name('api.admin.users.set-default-admin');

    // Members CRUD
    Route::get('members', [MemberController::class, 'apiIndex'])->name('api.admin.members.index');
    Route::post('members', [MemberController::class, 'apiStore'])->name('api.admin.members.store');
    Route::get('members/search', [MemberController::class, 'search'])->name('api.admin.members.search');
    Route::get('members/email/{email}', [MemberController::class, 'findByEmail'])->name('api.members.find-by-email');
    Route::get('members/{member}', [MemberController::class, 'apiShow'])->name('api.admin.members.show');
    Route::put('members/{member}', [MemberController::class, 'apiUpdate'])->name('api.admin.members.update');
    Route::patch('members/{member}', [MemberController::class, 'apiUpdate'])->name('api.admin.members.patch');
    Route::delete('members/{member}', [MemberController::class, 'apiDestroy'])->name('api.admin.members.destroy');

    // Invoices CRUD
    Route::get('invoices', [InvoiceController::class, 'apiIndex'])->name('api.admin.invoices.index');
    Route::post('invoices', [InvoiceController::class, 'apiStore'])->name('api.admin.invoices.store');
    Route::get('invoices/{invoice}', [InvoiceController::class, 'apiShow'])->name('api.admin.invoices.show');
    Route::put('invoices/{invoice}', [InvoiceController::class, 'apiUpdate'])->name('api.admin.invoices.update');
    Route::patch('invoices/{invoice}', [InvoiceController::class, 'apiUpdate'])->name('api.admin.invoices.patch');
    Route::delete('invoices/{invoice}', [InvoiceController::class, 'apiDestroy'])->name('api.admin.invoices.destroy');

    // Notes CRUD
    Route::get('notes', [NoteController::class, 'apiIndex'])->name('api.admin.notes.index');
    Route::post('notes', [NoteController::class, 'apiStore'])->name('api.admin.notes.store');
    Route::get('notes/{note}', [NoteController::class, 'apiShow'])->name('api.admin.notes.show');
    Route::put('notes/{note}', [NoteController::class, 'apiUpdate'])->name('api.admin.notes.update');
    Route::patch('notes/{note}', [NoteController::class, 'apiUpdate'])->name('api.admin.notes.patch');
    Route::delete('notes/{note}', [NoteController::class, 'apiDestroy'])->name('api.admin.notes.destroy');

    // HTML Pages CRUD
    Route::get('html-pages', [HtmlPageController::class, 'apiIndex'])->name('api.admin.html-pages.index');
    Route::post('html-pages', [HtmlPageController::class, 'apiStore'])->name('api.admin.html-pages.store');
    Route::get('html-pages/{htmlPage}', [HtmlPageController::class, 'apiShow'])->name('api.admin.html-pages.show');
    Route::put('html-pages/{htmlPage}', [HtmlPageController::class, 'apiUpdate'])->name('api.admin.html-pages.update');
    Route::patch('html-pages/{htmlPage}', [HtmlPageController::class, 'apiUpdate'])->name('api.admin.html-pages.patch');
    Route::delete('html-pages/{htmlPage}', [HtmlPageController::class, 'apiDestroy'])->name('api.admin.html-pages.destroy');

    // Calendars CRUD
    Route::get('calendars', [CalendarController::class, 'apiIndex'])->name('api.admin.calendars.index');
    Route::post('calendars', [CalendarController::class, 'apiStore'])->name('api.admin.calendars.store');
    Route::get('calendars/{calendar}', [CalendarController::class, 'apiShow'])->name('api.admin.calendars.show');
    Route::put('calendars/{calendar}', [CalendarController::class, 'apiUpdate'])->name('api.admin.calendars.update');
    Route::patch('calendars/{calendar}', [CalendarController::class, 'apiUpdate'])->name('api.admin.calendars.patch');
    Route::delete('calendars/{calendar}', [CalendarController::class, 'apiDestroy'])->name('api.admin.calendars.destroy');

    // Events CRUD
    Route::get('events', [EventController::class, 'apiIndex'])->name('api.admin.events.index');
    Route::post('events', [EventController::class, 'apiStore'])->name('api.admin.events.store');
    Route::get('events/upcoming', [EventController::class, 'upcoming'])->name('api.events.upcoming');
    Route::get('events/{event}', [EventController::class, 'apiShow'])->name('api.admin.events.show');
    Route::put('events/{event}', [EventController::class, 'apiUpdate'])->name('api.admin.events.update');
    Route::patch('events/{event}', [EventController::class, 'apiUpdate'])->name('api.admin.events.patch');
    Route::delete('events/{event}', [EventController::class, 'apiDestroy'])->name('api.admin.events.destroy');

    // Event RSVPs
    Route::apiResource('event-rsvps', EventRSVPController::class);

    // Yahrzeits
    Route::get('yahrzeits/search', [YahrzeitController::class, 'search'])->name('api.admin.yahrzeits.search');

    // Gabbai
    Route::get('gabbai/anniversaries', [GabbaiController::class, 'anniversaries'])->name('api.admin.gabbai.anniversaries');
    Route::get('gabbai/pledges', [GabbaiController::class, 'pledges'])->name('api.admin.gabbai.pledges');
    Route::get('gabbai/assignments', [GabbaiController::class, 'assignments'])->name('api.admin.gabbai.assignments');
    Route::post('gabbai/assignments', [GabbaiController::class, 'saveAssignments'])->name('api.admin.gabbai.assignments.save');
    Route::get('gabbai/config', [GabbaiController::class, 'config'])->name('api.admin.gabbai.config');

    // School Resources
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

    // Leadership Management
    Route::apiResource('boards', BoardController::class)->names([
        'index' => 'api.boards.index',
        'store' => 'api.boards.store',
        'show' => 'api.boards.show',
        'update' => 'api.boards.update',
        'destroy' => 'api.boards.destroy',
    ]);
    Route::apiResource('committees', CommitteeController::class)->names([
        'index' => 'api.committees.index',
        'store' => 'api.committees.store',
        'show' => 'api.committees.show',
        'update' => 'api.committees.update',
        'destroy' => 'api.committees.destroy',
    ]);
    Route::apiResource('meetings', MeetingController::class)->names([
        'index' => 'api.meetings.index',
        'store' => 'api.meetings.store',
        'show' => 'api.meetings.show',
        'update' => 'api.meetings.update',
        'destroy' => 'api.meetings.destroy',
    ]);

    // Banner Management
    Route::get('banners/push-notifications', [BannerController::class, 'apiGetPushNotificationBanners'])->name('api.banners.push-notifications');
    Route::post('banners/{banner}/push-notification-sent', [BannerController::class, 'apiMarkPushNotificationSent'])->name('api.banners.push-notification-sent');
    Route::get('banners/{banner}/statistics', [BannerController::class, 'apiGetStatistics'])->name('api.banners.statistics');

    // Email Records
    Route::post('emails/record', [EmailRecordController::class, 'store'])->name('api.emails.record');
});

// School Dashboard API (admin and teacher roles)
Route::middleware(['auth:sanctum', 'role:admin,teacher'])->prefix('school')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'apiSchoolDashboard'])->name('api.school.dashboard');

    // Students
    Route::get('students', [\App\Http\Controllers\StudentController::class, 'index'])->name('api.school.students.index');
    Route::post('students', [\App\Http\Controllers\StudentController::class, 'store'])->name('api.school.students.store');
    Route::get('students/{id}', [\App\Http\Controllers\StudentController::class, 'show'])->name('api.school.students.show');
    Route::put('students/{id}', [\App\Http\Controllers\StudentController::class, 'update'])->name('api.school.students.update');
    Route::delete('students/{id}', [\App\Http\Controllers\StudentController::class, 'destroy'])->name('api.school.students.destroy');
    
    // Attendance
    Route::get('attendance', [\App\Http\Controllers\AttendanceController::class, 'index'])->name('api.school.attendance.index');
    Route::post('attendance', [\App\Http\Controllers\AttendanceController::class, 'store'])->name('api.school.attendance.store');
    Route::get('attendance/{id}', [\App\Http\Controllers\AttendanceController::class, 'show'])->name('api.school.attendance.show');
    Route::put('attendance/{id}', [\App\Http\Controllers\AttendanceController::class, 'update'])->name('api.school.attendance.update');
    Route::delete('attendance/{id}', [\App\Http\Controllers\AttendanceController::class, 'destroy'])->name('api.school.attendance.destroy');
    
    // Classes
    Route::get('classes', [\App\Http\Controllers\ClassDefinitionController::class, 'index'])->name('api.school.classes.index');
    Route::post('classes', [\App\Http\Controllers\ClassDefinitionController::class, 'store'])->name('api.school.classes.store');
    Route::get('classes/{id}', [\App\Http\Controllers\ClassDefinitionController::class, 'show'])->name('api.school.classes.show');
    Route::put('classes/{id}', [\App\Http\Controllers\ClassDefinitionController::class, 'update'])->name('api.school.classes.update');
    Route::delete('classes/{id}', [\App\Http\Controllers\ClassDefinitionController::class, 'destroy'])->name('api.school.classes.destroy');
    
    // Class Grades
    Route::get('class-grades', [\App\Http\Controllers\ClassGradeController::class, 'index'])->name('api.school.class-grades.index');
    Route::post('class-grades', [\App\Http\Controllers\ClassGradeController::class, 'store'])->name('api.school.class-grades.store');
    Route::get('class-grades/{id}', [\App\Http\Controllers\ClassGradeController::class, 'show'])->name('api.school.class-grades.show');
    Route::put('class-grades/{id}', [\App\Http\Controllers\ClassGradeController::class, 'update'])->name('api.school.class-grades.update');
    Route::delete('class-grades/{id}', [\App\Http\Controllers\ClassGradeController::class, 'destroy'])->name('api.school.class-grades.destroy');
    
    // Exams
    Route::get('exams', [\App\Http\Controllers\ExamController::class, 'index'])->name('api.school.exams.index');
    Route::post('exams', [\App\Http\Controllers\ExamController::class, 'store'])->name('api.school.exams.store');
    Route::get('exams/{id}', [\App\Http\Controllers\ExamController::class, 'show'])->name('api.school.exams.show');
    Route::put('exams/{id}', [\App\Http\Controllers\ExamController::class, 'update'])->name('api.school.exams.update');
    Route::delete('exams/{id}', [\App\Http\Controllers\ExamController::class, 'destroy'])->name('api.school.exams.destroy');
    
    // Exam Grades
    Route::get('exam-grades', [\App\Http\Controllers\ExamGradeController::class, 'index'])->name('api.school.exam-grades.index');
    Route::post('exam-grades', [\App\Http\Controllers\ExamGradeController::class, 'store'])->name('api.school.exam-grades.store');
    Route::get('exam-grades/{id}', [\App\Http\Controllers\ExamGradeController::class, 'show'])->name('api.school.exam-grades.show');
    Route::put('exam-grades/{id}', [\App\Http\Controllers\ExamGradeController::class, 'update'])->name('api.school.exam-grades.update');
    Route::delete('exam-grades/{id}', [\App\Http\Controllers\ExamGradeController::class, 'destroy'])->name('api.school.exam-grades.destroy');
    
    // Subjects
    Route::get('subjects', [\App\Http\Controllers\SubjectController::class, 'index'])->name('api.school.subjects.index');
    Route::post('subjects', [\App\Http\Controllers\SubjectController::class, 'store'])->name('api.school.subjects.store');
    Route::get('subjects/{id}', [\App\Http\Controllers\SubjectController::class, 'show'])->name('api.school.subjects.show');
    Route::put('subjects/{id}', [\App\Http\Controllers\SubjectController::class, 'update'])->name('api.school.subjects.update');
    Route::delete('subjects/{id}', [\App\Http\Controllers\SubjectController::class, 'destroy'])->name('api.school.subjects.destroy');
    
    // Subject Grades
    Route::get('subject-grades', [\App\Http\Controllers\SubjectGradeController::class, 'index'])->name('api.school.subject-grades.index');
    Route::post('subject-grades', [\App\Http\Controllers\SubjectGradeController::class, 'store'])->name('api.school.subject-grades.store');
    Route::get('subject-grades/{id}', [\App\Http\Controllers\SubjectGradeController::class, 'show'])->name('api.school.subject-grades.show');
    Route::put('subject-grades/{id}', [\App\Http\Controllers\SubjectGradeController::class, 'update'])->name('api.school.subject-grades.update');
    Route::delete('subject-grades/{id}', [\App\Http\Controllers\SubjectGradeController::class, 'destroy'])->name('api.school.subject-grades.destroy');
    
    // Teachers
    Route::get('teachers', [\App\Http\Controllers\TeacherController::class, 'index'])->name('api.school.teachers.index');
    Route::post('teachers', [\App\Http\Controllers\TeacherController::class, 'store'])->name('api.school.teachers.store');
    Route::get('teachers/{id}', [\App\Http\Controllers\TeacherController::class, 'show'])->name('api.school.teachers.show');
    Route::put('teachers/{id}', [\App\Http\Controllers\TeacherController::class, 'update'])->name('api.school.teachers.update');
    Route::delete('teachers/{id}', [\App\Http\Controllers\TeacherController::class, 'destroy'])->name('api.school.teachers.destroy');
    
    // Parents
    Route::get('parents', [\App\Http\Controllers\ParentModelController::class, 'index'])->name('api.school.parents.index');
    Route::post('parents', [\App\Http\Controllers\ParentModelController::class, 'store'])->name('api.school.parents.store');
    Route::get('parents/{id}', [\App\Http\Controllers\ParentModelController::class, 'show'])->name('api.school.parents.show');
    Route::put('parents/{id}', [\App\Http\Controllers\ParentModelController::class, 'update'])->name('api.school.parents.update');
    Route::delete('parents/{id}', [\App\Http\Controllers\ParentModelController::class, 'destroy'])->name('api.school.parents.destroy');
});

// Public API (no authentication required)
Route::get('public/banners', [BannerController::class, 'apiPublicBanners'])->name('api.public.banners');
