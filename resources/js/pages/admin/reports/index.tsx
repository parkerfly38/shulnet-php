import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Download, FileSpreadsheet, DollarSign } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reports & Exports',
        href: '/admin/reports',
    },
];

export default function ReportsIndex() {
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
        start_date: '',
        end_date: '',
    });

    const handleExport = (endpoint: string, filters: Record<string, any>) => {
        // Create a form element
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/admin/reports/${endpoint}`;
        form.style.display = 'none';

        // Add CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
        }

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
        document.body.removeChild(form);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports & Exports" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    {/* Financial Reports Link */}
                    <Card className="border-primary">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-primary" />
                                <CardTitle>Financial Reports Dashboard</CardTitle>
                            </div>
                            <CardDescription>
                                View comprehensive financial analytics including income summary, outstanding balances, aging reports, and revenue analysis
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={() => router.visit('/admin/reports/financial')}
                                className="w-full md:w-auto"
                            >
                                View Financial Reports
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Members Export */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5" />
                                <CardTitle>Members Export</CardTitle>
                            </div>
                            <CardDescription>
                                Export member data with optional filters
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="member-search">Search</Label>
                                    <Input
                                        id="member-search"
                                        placeholder="Name or email..."
                                        value={memberFilters.search}
                                        onChange={(e) =>
                                            setMemberFilters({ ...memberFilters, search: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="member-type">Member Type</Label>
                                    <Select
                                        value={memberFilters.member_type ?? ' '}
                                        onValueChange={(value) =>
                                            setMemberFilters({ ...memberFilters, member_type: value })
                                        }
                                    >
                                        <SelectTrigger id="member-type">
                                            <SelectValue placeholder="All types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=" ">All types</SelectItem>
                                            <SelectItem value="individual">Individual</SelectItem>
                                            <SelectItem value="family">Family</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button
                                onClick={() => handleExport('export/members', memberFilters)}
                                className="w-full md:w-auto"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export Members
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Invoices Export */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5" />
                                <CardTitle>Invoices Export</CardTitle>
                            </div>
                            <CardDescription>
                                Export invoice data by status and date range
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="invoice-status">Status</Label>
                                    <Select
                                        value={invoiceFilters.status ?? ' '}
                                        onValueChange={(value) =>
                                            setInvoiceFilters({ ...invoiceFilters, status: value })
                                        }
                                    >
                                        <SelectTrigger id="invoice-status">
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=" ">All statuses</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="open">Open</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="overdue">Overdue</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="invoice-start-date">Start Date</Label>
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
                                    <Label htmlFor="invoice-end-date">End Date</Label>
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
                                <Download className="mr-2 h-4 w-4" />
                                Export Invoices
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Students Export */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5" />
                                <CardTitle>Students Export</CardTitle>
                            </div>
                            <CardDescription>
                                Export student data with contact and parent information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="student-grade">Grade Level</Label>
                                    <Input
                                        id="student-grade"
                                        placeholder="e.g., 5"
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
                                <Download className="mr-2 h-4 w-4" />
                                Export Students
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Financial Summary Export */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5" />
                                <CardTitle>Financial Summary Report</CardTitle>
                            </div>
                            <CardDescription>
                                Comprehensive financial report with aging analysis
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
                                <Download className="mr-2 h-4 w-4" />
                                Export Financial Summary
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Yahrzeit Export */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5" />
                                <CardTitle>Yahrzeit Calendar Export</CardTitle>
                            </div>
                            <CardDescription>
                                Export yahrzeit dates with member associations
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="yahrzeit-start-date">Start Date (Optional)</Label>
                                    <Input
                                        id="yahrzeit-start-date"
                                        type="date"
                                        value={yahrzeitFilters.start_date}
                                        onChange={(e) =>
                                            setYahrzeitFilters({ ...yahrzeitFilters, start_date: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="yahrzeit-end-date">End Date (Optional)</Label>
                                    <Input
                                        id="yahrzeit-end-date"
                                        type="date"
                                        value={yahrzeitFilters.end_date}
                                        onChange={(e) =>
                                            setYahrzeitFilters({ ...yahrzeitFilters, end_date: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={() => handleExport('export/yahrzeit', yahrzeitFilters)}
                                className="w-full md:w-auto"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export Yahrzeit Calendar
                            </Button>
                        </CardContent>
                    </Card>
                </div>
        </AppLayout>
    );
}
