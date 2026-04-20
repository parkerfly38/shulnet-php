<?php

use App\Http\Controllers\Admin\GabbaiController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\ChartOfAccountController;
use App\Http\Controllers\CommitteeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeedController;
use App\Http\Controllers\EmailCampaignController;
use App\Http\Controllers\EmailSettingController;
use App\Http\Controllers\EmailTemplateController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\EventTicketTypeController;
use App\Http\Controllers\FormController;
use App\Http\Controllers\GLBatchController;
use App\Http\Controllers\GravesiteController;
use App\Http\Controllers\HtmlAssetController;
use App\Http\Controllers\HtmlPageController;
use App\Http\Controllers\HtmlTemplateController;
use App\Http\Controllers\IntermentController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\LeadershipDashboardController;
use App\Http\Controllers\MeetingController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\MembershipPeriodController;
use App\Http\Controllers\MembershipTierController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\PdfTemplateController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\SchoolTuitionTierController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\YahrzeitController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// All routes in this file are prefixed with 'admin' and require admin role
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->group(function () {
    
    // User Management
    Route::get('users', [UserController::class, 'index'])->name('admin.users');

    // Global search
    Route::get('api/search', [SearchController::class, 'globalSearch'])->name('search.global');

    // Member Management
    Route::post('members/import', [MemberController::class, 'import'])->name('members.import');
    Route::get('members/template/download', [MemberController::class, 'downloadTemplate'])->name('members.template.download');
    Route::resource('members', MemberController::class)->names([
        'index' => 'members.index',
        'create' => 'members.create',
        'store' => 'members.store',
        'show' => 'members.show',
        'edit' => 'members.edit',
        'update' => 'members.update',
        'destroy' => 'members.destroy',
    ]);
    Route::post('members/{member}/create-user', [MemberController::class, 'createUser'])->name('members.create-user');
    Route::post('members/{member}/create-parent', [MemberController::class, 'createParentFromMember'])->name('members.create-parent');
    Route::post('members/{member}/convert-to-student', [MemberController::class, 'convertToStudent'])->name('members.convert-to-student');
    Route::post('members/{member}/family-members', [MemberController::class, 'storeFamilyMember'])->name('members.family-members.store');
    Route::post('members/{member}/relationships', [MemberController::class, 'addRelationship'])->name('members.relationships.add');
    Route::delete('members/{member}/relationships', [MemberController::class, 'removeRelationship'])->name('members.relationships.remove');

    // Membership Periods (nested under members)
    Route::resource('members.membership-periods', MembershipPeriodController::class)->except(['index', 'show'])->names([
        'create' => 'members.membership-periods.create',
        'store' => 'members.membership-periods.store',
        'edit' => 'members.membership-periods.edit',
        'update' => 'members.membership-periods.update',
        'destroy' => 'members.membership-periods.destroy',
    ]);

    // Leadership Dashboard
    Route::get('leadership', [LeadershipDashboardController::class, 'index'])->name('leadership.dashboard');

    // Committees
    Route::resource('committees', CommitteeController::class)->names([
        'index' => 'committees.index',
        'create' => 'committees.create',
        'store' => 'committees.store',
        'show' => 'committees.show',
        'edit' => 'committees.edit',
        'update' => 'committees.update',
        'destroy' => 'committees.destroy',
    ]);
    Route::post('committees/{committee}/members', [CommitteeController::class, 'attachMember'])->name('committees.members.attach');
    Route::delete('committees/{committee}/members/{member}', [CommitteeController::class, 'detachMember'])->name('committees.members.detach');

    // Boards
    Route::resource('boards', BoardController::class)->names([
        'index' => 'boards.index',
        'create' => 'boards.create',
        'store' => 'boards.store',
        'show' => 'boards.show',
        'edit' => 'boards.edit',
        'update' => 'boards.update',
        'destroy' => 'boards.destroy',
    ]);
    Route::post('boards/{board}/members', [BoardController::class, 'attachMember'])->name('boards.members.attach');
    Route::delete('boards/{board}/members/{member}', [BoardController::class, 'detachMember'])->name('boards.members.detach');

    // Meetings (for committees and boards)
    Route::prefix('meetings/{type}/{id}')->group(function () {
        Route::get('/', [MeetingController::class, 'index'])->name('meetings.index');
        Route::get('/create', [MeetingController::class, 'create'])->name('meetings.create');
        Route::post('/', [MeetingController::class, 'store'])->name('meetings.store');
        Route::get('/{meeting}', [MeetingController::class, 'show'])->name('meetings.show');
        Route::get('/{meeting}/edit', [MeetingController::class, 'edit'])->name('meetings.edit');
        Route::put('/{meeting}', [MeetingController::class, 'update'])->name('meetings.update');
        Route::delete('/{meeting}', [MeetingController::class, 'destroy'])->name('meetings.destroy');
        Route::post('/{meeting}/send-invitations', [MeetingController::class, 'sendInvitations'])->name('meetings.send-invitations');
    });

    // Reports (Data Exports and Analytics) - MUST come BEFORE wildcard routes
    Route::get('reports', [ReportsController::class, 'index'])->name('admin.reports.list');
    Route::get('reports/financial', fn() => Inertia::render('admin/reports/financial'))->name('admin.reports.financial');
    Route::post('reports/export/members', [ReportsController::class, 'exportMembers'])->name('admin.reports.export.members');
    Route::post('reports/export/invoices', [ReportsController::class, 'exportInvoices'])->name('admin.reports.export.invoices');
    Route::post('reports/export/students', [ReportsController::class, 'exportStudents'])->name('admin.reports.export.students');
    Route::post('reports/export/financial-summary', [ReportsController::class, 'exportFinancialSummary'])->name('admin.reports.export.financial-summary');
    Route::post('reports/export/yahrzeit', [ReportsController::class, 'exportYahrzeit'])->name('admin.reports.export.yahrzeit');
    
    // Financial Reports API
    Route::get('reports/income-summary', [ReportsController::class, 'getIncomeSummary'])->name('admin.reports.income-summary');
    Route::get('reports/outstanding-balances', [ReportsController::class, 'getOutstandingBalances'])->name('admin.reports.outstanding-balances');
    Route::get('reports/aging', [ReportsController::class, 'getAgingReport'])->name('admin.reports.aging');
    Route::get('reports/event-revenue', [ReportsController::class, 'getEventRevenue'])->name('admin.reports.event-revenue');
    Route::get('reports/revenue-by-source', [ReportsController::class, 'getRevenueBySource'])->name('admin.reports.revenue-by-source');
    Route::get('reports/member-growth', [ReportsController::class, 'getMemberGrowth'])->name('admin.reports.member-growth');
    Route::get('reports/tuition-revenue', [ReportsController::class, 'getTuitionRevenue'])->name('admin.reports.tuition-revenue');
    Route::get('reports/payment-methods', [ReportsController::class, 'getPaymentMethodAnalysis'])->name('admin.reports.payment-methods');
    Route::post('reports/budget-vs-actual', [ReportsController::class, 'getBudgetVsActual'])->name('admin.reports.budget-vs-actual');

    // Report management (for committees and boards) - wildcard route AFTER specific routes
    Route::prefix('reports/{type}/{id}')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/create', [ReportController::class, 'create'])->name('reports.create');
        Route::post('/', [ReportController::class, 'store'])->name('reports.store');
        Route::get('/{report}', [ReportController::class, 'show'])->name('reports.show');
        Route::get('/{report}/edit', [ReportController::class, 'edit'])->name('reports.edit');
        Route::put('/{report}', [ReportController::class, 'update'])->name('reports.update');
        Route::delete('/{report}', [ReportController::class, 'destroy'])->name('reports.destroy');
    });

    // Email Campaigns
    Route::resource('campaigns', EmailCampaignController::class)->names([
        'index' => 'campaigns.index',
        'create' => 'campaigns.create',
        'store' => 'campaigns.store',
        'show' => 'campaigns.show',
        'edit' => 'campaigns.edit',
        'update' => 'campaigns.update',
        'destroy' => 'campaigns.destroy',
    ]);
    Route::post('campaigns/{campaign}/subscribe', [EmailCampaignController::class, 'subscribe'])->name('campaigns.subscribe');
    Route::post('campaigns/{campaign}/bulk-subscribe', [EmailCampaignController::class, 'bulkSubscribe'])->name('campaigns.bulk-subscribe');
    Route::post('campaigns/{campaign}/unsubscribe', [EmailCampaignController::class, 'unsubscribe'])->name('campaigns.unsubscribe');
    Route::post('campaigns/{campaign}/send', [EmailCampaignController::class, 'send'])->name('campaigns.send');
    Route::get('campaigns/{campaign}/emails/create', [EmailCampaignController::class, 'createEmail'])->name('campaigns.emails.create');
    Route::post('campaigns/{campaign}/emails', [EmailCampaignController::class, 'storeEmail'])->name('campaigns.emails.store');
    Route::get('campaigns/{campaign}/emails/{email}/edit', [EmailCampaignController::class, 'editEmail'])->name('campaigns.emails.edit');
    Route::put('campaigns/{campaign}/emails/{email}', [EmailCampaignController::class, 'updateEmail'])->name('campaigns.emails.update');
    Route::delete('campaigns/{campaign}/emails/{email}', [EmailCampaignController::class, 'destroyEmail'])->name('campaigns.emails.destroy');

    // Email Templates & Settings
    Route::resource('templates', EmailTemplateController::class)->names([
        'index' => 'admin.templates.index',
        'create' => 'admin.templates.create',
        'store' => 'admin.templates.store',
        'show' => 'admin.templates.show',
        'edit' => 'admin.templates.edit',
        'update' => 'admin.templates.update',
        'destroy' => 'admin.templates.destroy',
    ]);
    Route::get('email-settings', [EmailSettingController::class, 'index'])->name('admin.email-settings.index');
    Route::post('email-settings', [EmailSettingController::class, 'update'])->name('admin.email-settings.update');
    Route::post('email-settings/test', [EmailSettingController::class, 'test'])->name('admin.email-settings.test');

    // Forms
    Route::resource('forms', FormController::class)->names([
        'index' => 'admin.forms.index',
        'create' => 'admin.forms.create',
        'store' => 'admin.forms.store',
        'show' => 'admin.forms.show',
        'edit' => 'admin.forms.edit',
        'update' => 'admin.forms.update',
        'destroy' => 'admin.forms.destroy',
    ]);
    Route::get('forms/{form}/preview', [FormController::class, 'preview'])->name('admin.forms.preview');
    Route::get('forms/{form}/submissions', [FormController::class, 'submissions'])->name('admin.forms.submissions');

    // HTML Publisher
    Route::get('html-pages/export-all', [HtmlPageController::class, 'exportAll'])->name('html-pages.export-all');
    Route::resource('html-pages', HtmlPageController::class)->names('html-pages');
    Route::post('html-pages/{htmlPage}/publish', [HtmlPageController::class, 'publish'])->name('html-pages.publish');
    Route::get('html-pages/{htmlPage}/preview', [HtmlPageController::class, 'preview'])->name('html-pages.preview');
    Route::resource('html-assets', HtmlAssetController::class)->only(['index', 'store', 'update', 'destroy'])->names('html-assets');
    Route::resource('html-templates', HtmlTemplateController::class)->names('html-templates');

    // Yahrzeits
    Route::post('yahrzeits/import', [YahrzeitController::class, 'import'])->name('yahrzeits.import');
    Route::get('yahrzeits/template/download', [YahrzeitController::class, 'downloadTemplate'])->name('yahrzeits.template.download');
    Route::get('yahrzeits/{yahrzeit}/prepare-reminder', [YahrzeitController::class, 'prepareReminder'])->name('yahrzeits.prepare-reminder');
    Route::post('yahrzeits/{yahrzeit}/send-reminder', [YahrzeitController::class, 'sendReminder'])->name('yahrzeits.send-reminder');
    Route::get('yahrzeits/{yahrzeit}/print-reminder', [YahrzeitController::class, 'printReminder'])->name('yahrzeits.print-reminder');
    Route::get('yahrzeits/monthly/prepare', [YahrzeitController::class, 'prepareMonthlyLetters'])->name('yahrzeits.monthly.prepare');
    Route::post('yahrzeits/monthly/send', [YahrzeitController::class, 'sendMonthlyReminders'])->name('yahrzeits.monthly.send');
    Route::post('yahrzeits/monthly/print', [YahrzeitController::class, 'printMonthlyLetters'])->name('yahrzeits.monthly.print');
    Route::resource('yahrzeits', YahrzeitController::class)->names([
        'index' => 'yahrzeits.index',
        'create' => 'yahrzeits.create',
        'store' => 'yahrzeits.store',
        'show' => 'yahrzeits.show',
        'edit' => 'yahrzeits.edit',
        'update' => 'yahrzeits.update',
        'destroy' => 'yahrzeits.destroy',
    ]);

    // Banners
    Route::resource('banners', BannerController::class)->names([
        'index' => 'banners.index',
        'create' => 'banners.create',
        'store' => 'banners.store',
        'show' => 'banners.show',
        'edit' => 'banners.edit',
        'update' => 'banners.update',
        'destroy' => 'banners.destroy',
    ]);
    Route::post('banners/{banner}/toggle-active', [BannerController::class, 'toggleActive'])->name('banners.toggle-active');

    // Calendars & Events
    Route::resource('calendars', CalendarController::class)->names([
        'index' => 'calendars.index',
        'create' => 'calendars.create',
        'store' => 'calendars.store',
        'show' => 'calendars.show',
        'edit' => 'calendars.edit',
        'update' => 'calendars.update',
        'destroy' => 'calendars.destroy',
    ]);
    Route::get('events/{event}/export-rsvps', [EventController::class, 'exportRsvps'])->name('events.export-rsvps');
    Route::resource('events', EventController::class)->names([
        'index' => 'events.index',
        'create' => 'events.create',
        'store' => 'events.store',
        'show' => 'events.show',
        'edit' => 'events.edit',
        'update' => 'events.update',
        'destroy' => 'events.destroy',
    ]);
    Route::resource('events.ticket-types', EventTicketTypeController::class)->except(['show'])->names([
        'index' => 'events.ticket-types.index',
        'create' => 'events.ticket-types.create',
        'store' => 'events.ticket-types.store',
        'edit' => 'events.ticket-types.edit',
        'update' => 'events.ticket-types.update',
        'destroy' => 'events.ticket-types.destroy',
    ]);

    // Notes
    Route::resource('notes', NoteController::class)->names([
        'index' => 'notes.index',
        'create' => 'notes.create',
        'store' => 'notes.store',
        'show' => 'notes.show',
        'edit' => 'notes.edit',
        'update' => 'notes.update',
        'destroy' => 'notes.destroy',
    ]);
    Route::get('notes/{note}/ics', [NoteController::class, 'downloadICS'])->name('notes.ics');
    Route::post('notifications/mark-seen', [NoteController::class, 'markAllSeen'])->name('notifications.mark-seen');

    // Invoices
    Route::resource('invoices', InvoiceController::class)->names([
        'index' => 'invoices.index',
        'create' => 'invoices.create',
        'store' => 'invoices.store',
        'show' => 'invoices.show',
        'edit' => 'invoices.edit',
        'update' => 'invoices.update',
        'destroy' => 'invoices.destroy',
    ]);
    Route::post('invoices/{invoice}/generate-next', [InvoiceController::class, 'generateNext'])->name('invoices.generate-next');
    Route::post('invoices/{invoice}/mark-as-paid', [InvoiceController::class, 'markAsPaid'])->name('invoices.mark-as-paid');
    Route::get('invoices/{invoice}/print', [InvoiceController::class, 'print'])->name('invoices.print');

    // Membership & School Tiers
    Route::resource('membership-tiers', MembershipTierController::class)->names([
        'index' => 'membership-tiers.index',
        'create' => 'membership-tiers.create',
        'store' => 'membership-tiers.store',
        'show' => 'membership-tiers.show',
        'edit' => 'membership-tiers.edit',
        'update' => 'membership-tiers.update',
        'destroy' => 'membership-tiers.destroy',
    ]);
    Route::resource('school-tuition-tiers', SchoolTuitionTierController::class)->names([
        'index' => 'school-tuition-tiers.index',
        'create' => 'school-tuition-tiers.create',
        'store' => 'school-tuition-tiers.store',
        'show' => 'school-tuition-tiers.show',
        'edit' => 'school-tuition-tiers.edit',
        'update' => 'school-tuition-tiers.update',
        'destroy' => 'school-tuition-tiers.destroy',
    ]);

    // PDF Templates
    Route::resource('pdf-templates', PdfTemplateController::class)->names([
        'index' => 'pdf-templates.index',
        'create' => 'pdf-templates.create',
        'store' => 'pdf-templates.store',
        'show' => 'pdf-templates.show',
        'edit' => 'pdf-templates.edit',
        'update' => 'pdf-templates.update',
        'destroy' => 'pdf-templates.destroy',
    ]);
    Route::post('pdf-templates/{pdfTemplate}/preview', [PdfTemplateController::class, 'preview'])->name('pdf-templates.preview');
    Route::post('pdf-templates/{pdfTemplate}/generate', [PdfTemplateController::class, 'generate'])->name('pdf-templates.generate');

    // Cemetery Management
    Route::resource('gravesites', GravesiteController::class)->names([
        'index' => 'gravesites.index',
        'create' => 'gravesites.create',
        'store' => 'gravesites.store',
        'show' => 'gravesites.show',
        'edit' => 'gravesites.edit',
        'update' => 'gravesites.update',
        'destroy' => 'gravesites.destroy',
    ]);
    Route::resource('deeds', DeedController::class)->names([
        'index' => 'deeds.index',
        'create' => 'deeds.create',
        'store' => 'deeds.store',
        'show' => 'deeds.show',
        'edit' => 'deeds.edit',
        'update' => 'deeds.update',
        'destroy' => 'deeds.destroy',
    ]);
    Route::post('deeds/{deed}/invoice', [DeedController::class, 'createInvoice'])->name('deeds.invoice.create');
    Route::get('deeds/{deed}/invoice/{invoice}/print', [DeedController::class, 'printInvoice'])->name('deeds.invoice.print');
    Route::resource('interments', IntermentController::class)->names([
        'index' => 'interments.index',
        'create' => 'interments.create',
        'store' => 'interments.store',
        'show' => 'interments.show',
        'edit' => 'interments.edit',
        'update' => 'interments.update',
        'destroy' => 'interments.destroy',
    ]);

    // Settings
    Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
    Route::put('settings', [SettingController::class, 'update'])->name('settings.update');

    // API Tokens
    Route::get('api-tokens', [\App\Http\Controllers\Api\TokenController::class, 'page'])->name('admin.api-tokens');

    // GL Batch Export
    Route::get('gl-batch', [GLBatchController::class, 'index'])->name('admin.gl-batch.index');
    Route::get('gl-batch/export', [GLBatchController::class, 'export'])->name('admin.gl-batch.export');
    Route::get('gl-batch/summary', [GLBatchController::class, 'summary'])->name('admin.gl-batch.summary');

    // Chart of Accounts
    Route::resource('chart-of-accounts', ChartOfAccountController::class)->except(['show'])->names([
        'index' => 'admin.chart-of-accounts.index',
        'create' => 'admin.chart-of-accounts.create',
        'store' => 'admin.chart-of-accounts.store',
        'edit' => 'admin.chart-of-accounts.edit',
        'update' => 'admin.chart-of-accounts.update',
        'destroy' => 'admin.chart-of-accounts.destroy',
    ]);

    // Gabbai UI
    Route::get('gabbai', fn() => Inertia::render('admin/gabbai/dashboard'))->name('admin.gabbai.dashboard');
    Route::get('gabbai/anniversaries', fn() => Inertia::render('admin/gabbai/anniversaries'))->name('admin.gabbai.anniversaries');
    Route::get('gabbai/honors', fn() => Inertia::render('admin/gabbai/honors'))->name('admin.gabbai.honors');
});
