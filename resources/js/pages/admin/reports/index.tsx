import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Download, FileSpreadsheet, DollarSign } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reports & Exports',
        href: '/admin/reports',
    },
];

export default function ReportsIndex() {
    const { t } = useTranslation();
    const { csrf_token } = usePage<{ csrf_token: string }>().props;
    
    const [memberFilters, setMemberFilters] = useState({
        search: '',
        member_type: '',
    });

    const [invoiceFilters, setInvoiceFilters] = useState({
        status: '',
        start_date: '',
        end_date: '',
    });

    const [studentFilters, setStudentFilters] = useState({
        class_id: '',
        grade_level: '',
    });

    const [financialFilters, setFinancialFilters] = useState({
        start_date: '',
        end_date: '',
    });

    const [yahrzeitFilters, setYahrzeitFilters] = useState({
        month: ''
    });

    const [glBatchFilters, setGlBatchFilters] = useState({
        start_date: '',
        end_date: '',
        batch_number: '',
    });

    const handleExport = (endpoint: string, filters: Record<string, any>) => {
        // Use the fresh CSRF token from Inertia shared props
        if (!csrf_token) {
            console.error('CSRF token not available');
            alert('Session error. Please refresh the page and try again.');
            return;
        }

        // Create a form element
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/admin/reports/${endpoint}`;
        form.style.display = 'none';

        // Add CSRF token
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = csrf_token;
        form.appendChild(csrfInput);

        // Add filters as hidden inputs
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = String(value);
                form.appendChild(input);
            }
        });

        // Submit form
        document.body.appendChild(form);
        form.submit();
        
        // Remove form after a delay to ensure submission completes
        setTimeout(() => form.remove(), 1000);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Reports & Exports')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    {/* Financial Reports Link */}
                    <Card className="border-primary">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-primary" />
                                <CardTitle>{t('Financial Reports Dashboard')}</CardTitle>
                            </div>
                            <CardDescription>
                                {t('View comprehensive financial analytics including income summary, outstanding balances, aging reports, and revenue analysis')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={() => router.visit('/admin/reports/financial')}
                                className="w-full md:w-auto"
                            >
                                {t('View Financial Reports')}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Members Export */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5" />
                                <CardTitle>{t('Members Export')}</CardTitle>
                            </div>
                            <CardDescription>
                                {t('Export member data with optional filters')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="member-search">{t('Search')}</Label>
                                    <Input
                                        id="member-search"
                                        placeholder={t('Name or email...')}
                                        value={memberFilters.search}
                                        onChange={(e) =>
                                            setMemberFilters({ ...memberFilters, search: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="member-type">{t('Member Type')}</Label>
                                    <Select
                                        value={memberFilters.member_type ?? ' '}
                                        onValueChange={(value) =>
                                            setMemberFilters({ ...memberFilters, member_type: value })
                                        }
                                    >
                                        <SelectTrigger id="member-type">
                                            <SelectValue placeholder={t('All types')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=" ">{t('All types')}</SelectItem>
                                            <SelectItem value="member">{t('Member')}</SelectItem>
                                            <SelectItem value="contact">{t('Contact')}</SelectItem>
                                            <SelectItem value="prospect">{t('Prospect')}</SelectItem>
                                            <SelectItem value="former">{t('Former Member')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button
                                onClick={() => handleExport('export/members', memberFilters)}
                                className="w-full md:w-auto"
                            >
                                <Download className="me-2 h-4 w-4" />
                                {t('Export Members')}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Invoices Export */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5" />
                                <CardTitle>{t('Invoices Export')}</CardTitle>
                            </div>
                            <CardDescription>
                                {t('Export invoice data by status and date range')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="invoice-status">{t('Status')}</Label>
                                    <Select
                                        value={invoiceFilters.status ?? ' '}
                                        onValueChange={(value) =>
                                            setInvoiceFilters({ ...invoiceFilters, status: value })
                                        }
                                    >
                                        <SelectTrigger id="invoice-status">
                                            <SelectValue placeholder={t('All statuses')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=" ">{t('All statuses')}</SelectItem>
                                            <SelectItem value="draft">{t('Draft')}</SelectItem>
                                            <SelectItem value="open">{t('Open')}</SelectItem>
                                            <SelectItem value="paid">{t('Paid')}</SelectItem>
                                            <SelectItem value="overdue">{t('Overdue')}</SelectItem>
                                            <SelectItem value="cancelled">{t('Cancelled')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="invoice-start-date">{t('Start Date')}</Label>
                                    <Input
                                        id="invoice-start-date"
                                        type="date"
                                        value={invoiceFilters.start_date}
                                        onChange={(e) =>
                                            setInvoiceFilters({ ...invoiceFilters, start_date: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="invoice-end-date">{t('End Date')}</Label>
                                    <Input
                                        id="invoice-end-date"
                                        type="date"
                                        value={invoiceFilters.end_date}
                                        onChange={(e) =>
                                            setInvoiceFilters({ ...invoiceFilters, end_date: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={() => handleExport('export/invoices', invoiceFilters)}
                                className="w-full md:w-auto"
                            >
                                <Download className="me-2 h-4 w-4" />
                                {t('Export Invoices')}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Students Export */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5" />
                                <CardTitle>{t('Students Export')}</CardTitle>
                            </div>
                            <CardDescription>
                                {t('Export student data with contact and parent information')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="student-grade">{t('Grade Level')}</Label>
                                    <Input
                                        id="student-grade"
                                        placeholder={t('e.g., 5')}
                                        value={studentFilters.grade_level}
                                        onChange={(e) =>
                                            setStudentFilters({ ...studentFilters, grade_level: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={() => handleExport('export/students', studentFilters)}
                                className="w-full md:w-auto"
                            >
                                <Download className="me-2 h-4 w-4" />
                                {t('Export Students')}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Financial Summary Export */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5" />
                                <CardTitle>{t('Financial Summary Report')}</CardTitle>
                            </div>
                            <CardDescription>
                                {t('Comprehensive financial report with aging analysis')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="financial-start-date">Start Date *</Label>
                                    <Input
                                        id="financial-start-date"
                                        type="date"
                                        required
                                        value={financialFilters.start_date}
                                        onChange={(e) =>
                                            setFinancialFilters({ ...financialFilters, start_date: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="financial-end-date">End Date *</Label>
                                    <Input
                                        id="financial-end-date"
                                        type="date"
                                        required
                                        value={financialFilters.end_date}
                                        onChange={(e) =>
                                            setFinancialFilters({ ...financialFilters, end_date: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={() => handleExport('export/financial-summary', financialFilters)}
                                disabled={!financialFilters.start_date || !financialFilters.end_date}
                                className="w-full md:w-auto"
                            >
                                <Download className="me-2 h-4 w-4" />
                                {t('Export Financial Summary')}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Yahrzeit Export */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5" />
                                <CardTitle>{t('Yahrzeit Calendar Export')}</CardTitle>
                            </div>
                            <CardDescription>
                                {t('Export yahrzeit dates with member associations by Hebrew month')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="yahrzeit-month">{t('Hebrew Month')}</Label>
                                    <Select
                                        value={yahrzeitFilters.month}
                                        onValueChange={(value) =>
                                            setYahrzeitFilters({ ...yahrzeitFilters, month: value })
                                        }
                                    >
                                        <SelectTrigger id="yahrzeit-month">
                                            <SelectValue placeholder={t('Select month')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">{t('Tishrei')}</SelectItem>
                                            <SelectItem value="2">{t('Cheshvan')}</SelectItem>
                                            <SelectItem value="3">{t('Kislev')}</SelectItem>
                                            <SelectItem value="4">{t('Tevet')}</SelectItem>
                                            <SelectItem value="5">{t('Shevat')}</SelectItem>
                                            <SelectItem value="6">{t('Adar')}</SelectItem>
                                            <SelectItem value="7">{t('Nisan')}</SelectItem>
                                            <SelectItem value="8">{t('Iyar')}</SelectItem>
                                            <SelectItem value="9">{t('Sivan')}</SelectItem>
                                            <SelectItem value="10">{t('Tammuz')}</SelectItem>
                                            <SelectItem value="11">{t('Av')}</SelectItem>
                                            <SelectItem value="12">{t('Elul')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button
                                onClick={() => handleExport('export/yahrzeit', yahrzeitFilters)}
                                className="w-full md:w-auto"
                            >
                                <Download className="me-2 h-4 w-4" />
                                {t('Export Yahrzeit Calendar')}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* GL Batch Export */}
                    <Card className="border-green-500">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-green-600" />
                                <CardTitle>{t('GL Batch Export')}</CardTitle>
                            </div>
                            <CardDescription>
                                {t('Export transactions by date range mapped to your Chart of Accounts for QuickBooks or other accounting software')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="gl-start-date">Start Date *</Label>
                                    <Input
                                        id="gl-start-date"
                                        type="date"
                                        required
                                        value={glBatchFilters.start_date}
                                        onChange={(e) =>
                                            setGlBatchFilters({ ...glBatchFilters, start_date: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gl-end-date">End Date *</Label>
                                    <Input
                                        id="gl-end-date"
                                        type="date"
                                        required
                                        value={glBatchFilters.end_date}
                                        onChange={(e) =>
                                            setGlBatchFilters({ ...glBatchFilters, end_date: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gl-batch-number">{t('Batch Number (Optional)')}</Label>
                                    <Input
                                        id="gl-batch-number"
                                        placeholder={t('e.g., 2026-03-001')}
                                        value={glBatchFilters.batch_number}
                                        onChange={(e) =>
                                            setGlBatchFilters({ ...glBatchFilters, batch_number: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                    onClick={() => {
                                        const params = new URLSearchParams();
                                        if (glBatchFilters.start_date) params.append('start_date', glBatchFilters.start_date);
                                        if (glBatchFilters.end_date) params.append('end_date', glBatchFilters.end_date);
                                        if (glBatchFilters.batch_number) params.append('batch_number', glBatchFilters.batch_number);
                                        
                                        globalThis.location.href = `/admin/gl-batch/export?${params.toString()}`;
                                    }}
                                    disabled={!glBatchFilters.start_date || !glBatchFilters.end_date}
                                    className="w-full sm:w-auto"
                                >
                                    <Download className="me-2 h-4 w-4" />
                                    {t('Export GL Batch')}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => router.visit('/admin/chart-of-accounts')}
                                    className="w-full sm:w-auto"
                                >
                                    {t('Manage Chart of Accounts')}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Note: Only transactions with assigned GL account codes will be included in the export.
                                Configure your Chart of Accounts and assign accounts to invoice items for accurate GL reporting.
                            </p>
                        </CardContent>
                    </Card>
                </div>
        </AppLayout>
    );
}
