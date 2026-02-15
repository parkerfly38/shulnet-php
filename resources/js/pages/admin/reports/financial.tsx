import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { DollarSign, TrendingUp, Users, Calendar, FileText, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reports',
        href: '/admin/reports',
    },
    {
        title: 'Financial Reports',
        href: '/admin/reports/financial',
    },
];

interface IncomeSummary {
    start_date: string;
    end_date: string;
    categories: {
        membership_dues: number;
        tuition: number;
        event_revenue: number;
        donations: number;
        other_income: number;
    };
    total_revenue: number;
    invoice_count: number;
}

interface OutstandingBalance {
    member_id: number;
    member_name: string;
    email: string;
    total_owed: number;
    invoice_count: number;
    oldest_invoice_date: string;
}

interface AgingBucket {
    count: number;
    total: number;
    invoices: any[];
}

interface AgingReport {
    aging_buckets: {
        current: AgingBucket;
        '31_60': AgingBucket;
        '61_90': AgingBucket;
        over_90: AgingBucket;
    };
    total_outstanding: number;
}

interface EventRevenueData {
    start_date: string;
    end_date: string;
    total_revenue: number;
    total_attendees: number;
    event_count: number;
    average_revenue_per_event: number;
    events: Array<{
        event_id: number;
        event_name: string;
        event_date: string;
        revenue: number;
        attendees: number;
        capacity: number;
        sell_through_rate: number;
        average_ticket_price: number;
    }>;
    ticket_types: Array<{
        ticket_type: string;
        quantity: number;
        revenue: number;
        average_price: number;
    }>;
}

interface RevenueSourceData {
    start_date: string;
    end_date: string;
    total_revenue: number;
    breakdown: Array<{
        category: string;
        amount: number;
        percentage: number;
    }>;
}

interface MemberGrowthData {
    start_date: string;
    end_date: string;
    starting_members: number;
    new_members: number;
    members_lost: number;
    current_total: number;
    net_change: number;
    growth_rate: number;
    by_type: {
        [key: string]: number;
    };
}

interface TuitionRevenueData {
    total_students: number;
    students_by_grade: {
        [key: string]: number;
    };
    projected_revenue: number;
    collected_revenue: number;
    outstanding_revenue: number;
    collection_rate: number;
}

interface PaymentMethodsData {
    start_date: string;
    end_date: string;
    breakdown: Array<{
        method: string;
        count: number;
        total: number;
        percentage_of_revenue: number;
        percentage_of_transactions: number;
        average_transaction: number;
    }>;
    total_revenue: number;
    total_transactions: number;
}

export default function FinancialReports() {
    const [activeTab, setActiveTab] = useState('income-summary');
    const [dateRange, setDateRange] = useState({
        start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Jan 1 current year
        end_date: new Date().toISOString().split('T')[0],
    });

    const [incomeSummary, setIncomeSummary] = useState<IncomeSummary | null>(null);
    const [outstandingBalances, setOutstandingBalances] = useState<{ balances: OutstandingBalance[]; total_outstanding: number; member_count: number } | null>(null);
    const [agingReport, setAgingReport] = useState<AgingReport | null>(null);
    const [eventRevenue, setEventRevenue] = useState<EventRevenueData | null>(null);
    const [revenueSource, setRevenueSource] = useState<RevenueSourceData | null>(null);
    const [memberGrowth, setMemberGrowth] = useState<MemberGrowthData | null>(null);
    const [tuitionRevenue, setTuitionRevenue] = useState<TuitionRevenueData | null>(null);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsData | null>(null);
    const [loading, setLoading] = useState(false);

    // Load income summary
    const loadIncomeSummary = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/reports/income-summary', {
                params: dateRange,
            });
            setIncomeSummary(response.data);
        } catch (error) {
            console.error('Failed to load income summary:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load event revenue
    const loadEventRevenue = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/reports/event-revenue', {
                params: dateRange,
            });
            setEventRevenue(response.data);
        } catch (error) {
            console.error('Failed to load event revenue:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load revenue source
    const loadRevenueSource = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/reports/revenue-by-source', {
                params: dateRange,
            });
            setRevenueSource(response.data);
        } catch (error) {
            console.error('Failed to load revenue source:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load member growth
    const loadMemberGrowth = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/reports/member-growth', {
                params: dateRange,
            });
            setMemberGrowth(response.data);
        } catch (error) {
            console.error('Failed to load member growth:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load tuition revenue
    const loadTuitionRevenue = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/reports/tuition-revenue');
            setTuitionRevenue(response.data);
        } catch (error) {
            console.error('Failed to load tuition revenue:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load payment methods
    const loadPaymentMethods = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/reports/payment-methods', {
                params: dateRange,
            });
            setPaymentMethods(response.data);
        } catch (error) {
            console.error('Failed to load payment methods:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load outstanding balances
    const loadOutstandingBalances = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/reports/outstanding-balances');
            setOutstandingBalances(response.data);
        } catch (error) {
            console.error('Failed to load outstanding balances:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load aging report
    const loadAgingReport = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/reports/aging');
            setAgingReport(response.data);
        } catch (error) {
            console.error('Failed to load aging report:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load data when tab changes
    useEffect(() => {
        if (activeTab === 'income-summary') {
            loadIncomeSummary();
        } else if (activeTab === 'outstanding') {
            loadOutstandingBalances();
        } else if (activeTab === 'aging') {
            loadAgingReport();
        } else if (activeTab === 'event-revenue') {
            loadEventRevenue();
        } else if (activeTab === 'revenue-source') {
            loadRevenueSource();
        } else if (activeTab === 'member-growth') {
            loadMemberGrowth();
        } else if (activeTab === 'tuition') {
            loadTuitionRevenue();
        } else if (activeTab === 'payment-methods') {
            loadPaymentMethods();
        }
    }, [activeTab, dateRange]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Financial Reports" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Financial Reports</h1>
                        <p className="text-muted-foreground mt-1">
                            View comprehensive financial analytics and reports
                        </p>
                    </div>
                </div>

                {/* Date Range Selector (for reports that need it) */}
                {(activeTab === 'income-summary' || activeTab === 'event-revenue' || activeTab === 'revenue-source' || activeTab === 'member-growth' || activeTab === 'payment-methods') && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Date Range</CardTitle>
                            <CardDescription>Select the reporting period</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="start-date">Start Date</Label>
                                    <Input
                                        id="start-date"
                                        type="date"
                                        value={dateRange.start_date}
                                        onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end-date">End Date</Label>
                                    <Input
                                        id="end-date"
                                        type="date"
                                        value={dateRange.end_date}
                                        onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button onClick={() => {
                                        if (activeTab === 'income-summary') loadIncomeSummary();
                                        else if (activeTab === 'event-revenue') loadEventRevenue();
                                        else if (activeTab === 'revenue-source') loadRevenueSource();
                                        else if (activeTab === 'member-growth') loadMemberGrowth();
                                        else if (activeTab === 'payment-methods') loadPaymentMethods();
                                    }} className="w-full">
                                        Generate Report
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-8">
                        <TabsTrigger value="income-summary">Income Summary</TabsTrigger>
                        <TabsTrigger value="event-revenue">Event Revenue</TabsTrigger>
                        <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
                        <TabsTrigger value="aging">Aging</TabsTrigger>
                        <TabsTrigger value="revenue-source">Revenue Source</TabsTrigger>
                        <TabsTrigger value="member-growth">Member Growth</TabsTrigger>
                        <TabsTrigger value="tuition">Tuition</TabsTrigger>
                        <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
                    </TabsList>

                    {/* Income Summary Tab */}
                    <TabsContent value="income-summary" className="space-y-4">
                        {loading ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <p>Loading...</p>
                                </CardContent>
                            </Card>
                        ) : incomeSummary ? (
                            <>
                                {/* Summary Cards */}
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{formatCurrency(incomeSummary.total_revenue)}</div>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(incomeSummary.start_date)} - {formatDate(incomeSummary.end_date)}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{incomeSummary.invoice_count}</div>
                                            <p className="text-xs text-muted-foreground">
                                                Total invoiced
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Average Invoice</CardTitle>
                                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {formatCurrency(incomeSummary.invoice_count > 0 ? incomeSummary.total_revenue / incomeSummary.invoice_count : 0)}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Per invoice
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Revenue Breakdown */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Revenue by Category</CardTitle>
                                        <CardDescription>Breakdown of income sources</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {Object.entries(incomeSummary.categories).map(([category, amount]) => {
                                                const percentage = incomeSummary.total_revenue > 0 
                                                    ? (amount / incomeSummary.total_revenue) * 100 
                                                    : 0;
                                                return (
                                                    <div key={category} className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium capitalize">
                                                                {category.replace(/_/g, ' ')}
                                                            </span>
                                                            <span className="text-sm font-medium">
                                                                {formatCurrency(amount)} ({percentage.toFixed(1)}%)
                                                            </span>
                                                        </div>
                                                        <div className="h-2 rounded-full bg-secondary">
                                                            <div
                                                                className="h-2 rounded-full bg-primary"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <p>Select a date range and click "Generate Report"</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Outstanding Balances Tab */}
                    <TabsContent value="outstanding" className="space-y-4">
                        {loading ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <p>Loading...</p>
                                </CardContent>
                            </Card>
                        ) : outstandingBalances ? (
                            <>
                                {/* Summary Cards */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{formatCurrency(outstandingBalances.total_outstanding)}</div>
                                            <p className="text-xs text-muted-foreground">Across all members</p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Members with Balance</CardTitle>
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{outstandingBalances.member_count}</div>
                                            <p className="text-xs text-muted-foreground">
                                                Avg: {formatCurrency(outstandingBalances.member_count > 0 ? outstandingBalances.total_outstanding / outstandingBalances.member_count : 0)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Outstanding Balances Table */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Outstanding Balances by Member</CardTitle>
                                        <CardDescription>Members with unpaid invoices (sorted by amount)</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="text-left p-2">Member</th>
                                                        <th className="text-left p-2">Email</th>
                                                        <th className="text-right p-2">Invoices</th>
                                                        <th className="text-right p-2">Total Owed</th>
                                                        <th className="text-right p-2">Oldest Invoice</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {outstandingBalances.balances.map((balance) => (
                                                        <tr key={balance.member_id} className="border-b hover:bg-muted/50">
                                                            <td className="p-2">{balance.member_name}</td>
                                                            <td className="p-2 text-sm text-muted-foreground">{balance.email}</td>
                                                            <td className="p-2 text-right">{balance.invoice_count}</td>
                                                            <td className="p-2 text-right font-medium">{formatCurrency(balance.total_owed)}</td>
                                                            <td className="p-2 text-right text-sm">{formatDate(balance.oldest_invoice_date)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : null}
                    </TabsContent>

                    {/* Aging Report Tab */}
                    <TabsContent value="aging" className="space-y-4">
                        {loading ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <p>Loading...</p>
                                </CardContent>
                            </Card>
                        ) : agingReport ? (
                            <>
                                {/* Aging Buckets */}
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">Current (0-30 days)</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{formatCurrency(agingReport.aging_buckets.current.total)}</div>
                                            <p className="text-xs text-muted-foreground">{agingReport.aging_buckets.current.count} invoices</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">31-60 days</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{formatCurrency(agingReport.aging_buckets['31_60'].total)}</div>
                                            <p className="text-xs text-muted-foreground">{agingReport.aging_buckets['31_60'].count} invoices</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-red-200 bg-red-50 dark:bg-red-950">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">61-90 days</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{formatCurrency(agingReport.aging_buckets['61_90'].total)}</div>
                                            <p className="text-xs text-muted-foreground">{agingReport.aging_buckets['61_90'].count} invoices</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-red-300 bg-red-100 dark:bg-red-900">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">90+ days</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{formatCurrency(agingReport.aging_buckets.over_90.total)}</div>
                                            <p className="text-xs text-muted-foreground">{agingReport.aging_buckets.over_90.count} invoices</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Total Outstanding */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Total Outstanding</CardTitle>
                                        <CardDescription>Sum of all aging buckets</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{formatCurrency(agingReport.total_outstanding)}</div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : null}
                    </TabsContent>

                    {/* Event Revenue Tab */}
                    <TabsContent value="event-revenue" className="space-y-4">
                        {loading ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <p>Loading...</p>
                                </CardContent>
                            </Card>
                        ) : eventRevenue ? (
                            <>
                                {/* Summary Cards */}
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{formatCurrency(eventRevenue.total_revenue)}</div>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(eventRevenue.start_date)} - {formatDate(eventRevenue.end_date)}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{eventRevenue.event_count}</div>
                                            <p className="text-xs text-muted-foreground">
                                                Avg: {formatCurrency(eventRevenue.average_revenue_per_event)} per event
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{eventRevenue.total_attendees}</div>
                                            <p className="text-xs text-muted-foreground">
                                                Across all events
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Avg Ticket Price</CardTitle>
                                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {formatCurrency(eventRevenue.total_attendees > 0 ? eventRevenue.total_revenue / eventRevenue.total_attendees : 0)}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Per attendee
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Revenue by Event */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Revenue by Event</CardTitle>
                                        <CardDescription>Breakdown of revenue, attendance, and sell-through rates</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="text-left p-2">Event</th>
                                                        <th className="text-left p-2">Date</th>
                                                        <th className="text-right p-2">Revenue</th>
                                                        <th className="text-right p-2">Attendees</th>
                                                        <th className="text-right p-2">Capacity</th>
                                                        <th className="text-right p-2">Sell-Through</th>
                                                        <th className="text-right p-2">Avg Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {eventRevenue.events.map((event) => (
                                                        <tr key={event.event_id} className="border-b hover:bg-muted/50">
                                                            <td className="p-2 font-medium">{event.event_name}</td>
                                                            <td className="p-2 text-sm">{formatDate(event.event_date)}</td>
                                                            <td className="p-2 text-right font-medium">{formatCurrency(event.revenue)}</td>
                                                            <td className="p-2 text-right">{event.attendees}</td>
                                                            <td className="p-2 text-right">{event.capacity || 'N/A'}</td>
                                                            <td className="p-2 text-right">
                                                                {event.capacity ? (
                                                                    <span className={event.sell_through_rate >= 90 ? 'text-green-600 font-medium' : event.sell_through_rate >= 70 ? 'text-blue-600' : ''}>
                                                                        {event.sell_through_rate.toFixed(1)}%
                                                                    </span>
                                                                ) : 'N/A'}
                                                            </td>
                                                            <td className="p-2 text-right">{formatCurrency(event.average_ticket_price)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Revenue by Ticket Type */}
                                {eventRevenue.ticket_types.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Revenue by Ticket Type</CardTitle>
                                            <CardDescription>Breakdown of ticket sales by type</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b">
                                                            <th className="text-left p-2">Ticket Type</th>
                                                            <th className="text-right p-2">Quantity Sold</th>
                                                            <th className="text-right p-2">Total Revenue</th>
                                                            <th className="text-right p-2">Average Price</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {eventRevenue.ticket_types.map((ticketType, index) => (
                                                            <tr key={index} className="border-b hover:bg-muted/50">
                                                                <td className="p-2 font-medium">{ticketType.ticket_type}</td>
                                                                <td className="p-2 text-right">{ticketType.quantity}</td>
                                                                <td className="p-2 text-right font-medium">{formatCurrency(ticketType.revenue)}</td>
                                                                <td className="p-2 text-right">{formatCurrency(ticketType.average_price)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        ) : (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <p>Select a date range and click "Generate Report"</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Revenue Source Tab */}
                    <TabsContent value="revenue-source" className="space-y-4">
                        {loading ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <p>Loading...</p>
                                </CardContent>
                            </Card>
                        ) : revenueSource ? (
                            <>
                                {/* Summary Card */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div>
                                            <CardTitle>Total Revenue</CardTitle>
                                            <CardDescription>
                                                {formatDate(revenueSource.start_date)} - {formatDate(revenueSource.end_date)}
                                            </CardDescription>
                                        </div>
                                        <DollarSign className="h-8 w-8 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-4xl font-bold">{formatCurrency(revenueSource.total_revenue)}</div>
                                    </CardContent>
                                </Card>

                                {/* Revenue Breakdown Cards */}
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {revenueSource.breakdown.map((source) => (
                                        <Card key={source.category}>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium">{source.category}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <div className="text-2xl font-bold">{formatCurrency(source.amount)}</div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground">Percentage</span>
                                                        <span className="font-medium">{source.percentage.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="h-2 rounded-full bg-secondary">
                                                        <div
                                                            className="h-2 rounded-full bg-primary"
                                                            style={{ width: `${source.percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {/* Detailed Breakdown Table */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Revenue Source Breakdown</CardTitle>
                                        <CardDescription>Complete revenue analysis by category</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="text-left p-2">Category</th>
                                                        <th className="text-right p-2">Amount</th>
                                                        <th className="text-right p-2">Percentage</th>
                                                        <th className="text-left p-2 w-1/3">Distribution</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {revenueSource.breakdown.map((source) => (
                                                        <tr key={source.category} className="border-b hover:bg-muted/50">
                                                            <td className="p-2 font-medium">{source.category}</td>
                                                            <td className="p-2 text-right font-medium">{formatCurrency(source.amount)}</td>
                                                            <td className="p-2 text-right">{source.percentage.toFixed(1)}%</td>
                                                            <td className="p-2">
                                                                <div className="h-2 rounded-full bg-secondary">
                                                                    <div
                                                                        className="h-2 rounded-full bg-primary"
                                                                        style={{ width: `${source.percentage}%` }}
                                                                    />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <p>Select a date range and click "Generate Report"</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Member Growth Tab */}
                    <TabsContent value="member-growth" className="space-y-4">
                        {loading ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <p>Loading...</p>
                                </CardContent>
                            </Card>
                        ) : memberGrowth ? (
                            <>
                                {/* Growth Metrics Cards */}
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Starting Members</CardTitle>
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{memberGrowth.starting_members}</div>
                                            <p className="text-xs text-muted-foreground">
                                                As of {formatDate(memberGrowth.start_date)}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-green-200 bg-green-50 dark:bg-green-950">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">New Members</CardTitle>
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-green-600">+{memberGrowth.new_members}</div>
                                            <p className="text-xs text-muted-foreground">
                                                Joined during period
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-red-200 bg-red-50 dark:bg-red-950">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Members Lost</CardTitle>
                                            <Users className="h-4 w-4 text-red-600" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-red-600">{memberGrowth.members_lost > 0 ? '-' : ''}{memberGrowth.members_lost}</div>
                                            <p className="text-xs text-muted-foreground">
                                                Left or changed status
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Current Total</CardTitle>
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{memberGrowth.current_total}</div>
                                            <p className="text-xs text-muted-foreground">
                                                As of {formatDate(memberGrowth.end_date)}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className={memberGrowth.net_change >= 0 ? 'border-green-200 bg-green-50 dark:bg-green-950' : 'border-red-200 bg-red-50 dark:bg-red-950'}>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                                            <TrendingUp className={`h-4 w-4 ${memberGrowth.net_change >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                                        </CardHeader>
                                        <CardContent>
                                            <div className={`text-2xl font-bold ${memberGrowth.net_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {memberGrowth.growth_rate > 0 ? '+' : ''}{memberGrowth.growth_rate}%
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Net: {memberGrowth.net_change > 0 ? '+' : ''}{memberGrowth.net_change} members
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Period Summary */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Growth Summary</CardTitle>
                                        <CardDescription>
                                            {formatDate(memberGrowth.start_date)} - {formatDate(memberGrowth.end_date)}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Starting Members</span>
                                                <span className="text-sm">{memberGrowth.starting_members}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-green-600">
                                                <span className="text-sm font-medium">+ New Members</span>
                                                <span className="text-sm font-bold">+{memberGrowth.new_members}</span>
                                            </div>
                                            {memberGrowth.members_lost > 0 && (
                                                <div className="flex items-center justify-between text-red-600">
                                                    <span className="text-sm font-medium">- Members Lost</span>
                                                    <span className="text-sm font-bold">-{memberGrowth.members_lost}</span>
                                                </div>
                                            )}
                                            <div className="border-t pt-4 flex items-center justify-between">
                                                <span className="font-medium">Ending Members</span>
                                                <span className="text-xl font-bold">{memberGrowth.current_total}</span>
                                            </div>
                                            <div className="border-t pt-4 flex items-center justify-between">
                                                <span className="font-medium">Net Change</span>
                                                <span className={`text-xl font-bold ${memberGrowth.net_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {memberGrowth.net_change > 0 ? '+' : ''}{memberGrowth.net_change} ({memberGrowth.growth_rate > 0 ? '+' : ''}{memberGrowth.growth_rate}%)
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Member Type Breakdown */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Member Type Distribution</CardTitle>
                                        <CardDescription>Current membership breakdown by type</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {Object.entries(memberGrowth.by_type).map(([type, count]) => {
                                                const totalMembers = Object.values(memberGrowth.by_type).reduce((sum, val) => sum + val, 0);
                                                const percentage = totalMembers > 0 ? (count / totalMembers) * 100 : 0;
                                                return (
                                                    <div key={type} className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium capitalize">
                                                                {type}
                                                            </span>
                                                            <span className="text-sm font-medium">
                                                                {count} ({percentage.toFixed(1)}%)
                                                            </span>
                                                        </div>
                                                        <div className="h-2 rounded-full bg-secondary">
                                                            <div
                                                                className="h-2 rounded-full bg-primary"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <p>Select a date range and click "Generate Report"</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                    {/* Tuition Revenue Tab */}
                    <TabsContent value="tuition" className="space-y-4">
                        {loading ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <p>Loading...</p>
                                </CardContent>
                            </Card>
                        ) : tuitionRevenue ? (
                            <>
                                {/* Summary Metrics */}
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{tuitionRevenue.total_students}</div>
                                            <p className="text-xs text-muted-foreground">
                                                Enrolled in Hebrew School
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Projected Revenue</CardTitle>
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{formatCurrency(tuitionRevenue.projected_revenue)}</div>
                                            <p className="text-xs text-muted-foreground">
                                                Total invoiced
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-green-200 bg-green-50 dark:bg-green-950">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Collected Revenue</CardTitle>
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-green-600">{formatCurrency(tuitionRevenue.collected_revenue)}</div>
                                            <p className="text-xs text-muted-foreground">
                                                Payments received
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className={tuitionRevenue.collection_rate >= 90 ? 'border-green-200 bg-green-50 dark:bg-green-950' : tuitionRevenue.collection_rate >= 75 ? 'border-orange-200 bg-orange-50 dark:bg-orange-950' : 'border-red-200 bg-red-50 dark:bg-red-950'}>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                                            <TrendingUp className={`h-4 w-4 ${tuitionRevenue.collection_rate >= 90 ? 'text-green-600' : tuitionRevenue.collection_rate >= 75 ? 'text-orange-600' : 'text-red-600'}`} />
                                        </CardHeader>
                                        <CardContent>
                                            <div className={`text-2xl font-bold ${tuitionRevenue.collection_rate >= 90 ? 'text-green-600' : tuitionRevenue.collection_rate >= 75 ? 'text-orange-600' : 'text-red-600'}`}>
                                                {tuitionRevenue.collection_rate.toFixed(1)}%
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Of projected revenue
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Collection Summary */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Collection Summary</CardTitle>
                                        <CardDescription>Breakdown of tuition revenue status</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Projected Revenue</span>
                                                <span className="text-sm font-bold">{formatCurrency(tuitionRevenue.projected_revenue)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-green-600">
                                                <span className="text-sm font-medium">Collected</span>
                                                <span className="text-sm font-bold">{formatCurrency(tuitionRevenue.collected_revenue)} ({tuitionRevenue.collection_rate.toFixed(1)}%)</span>
                                            </div>
                                            {tuitionRevenue.outstanding_revenue > 0 && (
                                                <div className="flex items-center justify-between text-orange-600">
                                                    <span className="text-sm font-medium">Outstanding</span>
                                                    <span className="text-sm font-bold">{formatCurrency(tuitionRevenue.outstanding_revenue)} ({(100 - tuitionRevenue.collection_rate).toFixed(1)}%)</span>
                                                </div>
                                            )}
                                            <div className="h-2 rounded-full bg-secondary">
                                                <div
                                                    className="h-2 rounded-full bg-green-600"
                                                    style={{ width: `${tuitionRevenue.collection_rate}%` }}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Students by Grade */}
                                {Object.keys(tuitionRevenue.students_by_grade).length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Enrollment by Grade</CardTitle>
                                            <CardDescription>Student distribution across grade levels</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {Object.entries(tuitionRevenue.students_by_grade).map(([grade, count]) => {
                                                    const percentage = tuitionRevenue.total_students > 0 
                                                        ? (count / tuitionRevenue.total_students) * 100 
                                                        : 0;
                                                    return (
                                                        <div key={grade} className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm font-medium">
                                                                    Grade {grade}
                                                                </span>
                                                                <span className="text-sm font-medium">
                                                                    {count} students ({percentage.toFixed(1)}%)
                                                                </span>
                                                            </div>
                                                            <div className="h-2 rounded-full bg-secondary">
                                                                <div
                                                                    className="h-2 rounded-full bg-primary"
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        ) : null}
                    </TabsContent>

                    {/* Payment Methods Tab */}
                    <TabsContent value="payment-methods" className="space-y-4">
                        {loading ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <p>Loading...</p>
                                </CardContent>
                            </Card>
                        ) : paymentMethods ? (
                            <>
                                {/* Summary Cards */}
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{formatCurrency(paymentMethods.total_revenue)}</div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {paymentMethods.start_date} to {paymentMethods.end_date}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{paymentMethods.total_transactions.toLocaleString()}</div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                All payment methods
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
                                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {formatCurrency(paymentMethods.total_transactions > 0 
                                                    ? paymentMethods.total_revenue / paymentMethods.total_transactions 
                                                    : 0)}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Across all methods
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Payment Methods Breakdown */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Payment Methods Breakdown</CardTitle>
                                        <CardDescription>
                                            Revenue and transaction distribution by payment method
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="text-left py-3 px-4 font-semibold">Payment Method</th>
                                                        <th className="text-right py-3 px-4 font-semibold">Transactions</th>
                                                        <th className="text-right py-3 px-4 font-semibold">% of Transactions</th>
                                                        <th className="text-right py-3 px-4 font-semibold">Total Revenue</th>
                                                        <th className="text-right py-3 px-4 font-semibold">% of Revenue</th>
                                                        <th className="text-right py-3 px-4 font-semibold">Avg Transaction</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paymentMethods.breakdown.map((method) => (
                                                        <tr key={method.method} className="border-b hover:bg-muted/50">
                                                            <td className="py-3 px-4 font-medium">{method.method}</td>
                                                            <td className="text-right py-3 px-4">{method.count.toLocaleString()}</td>
                                                            <td className="text-right py-3 px-4">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <span>{method.percentage_of_transactions.toFixed(1)}%</span>
                                                                    <div className="w-16 h-2 rounded-full bg-secondary">
                                                                        <div
                                                                            className="h-2 rounded-full bg-blue-500"
                                                                            style={{ width: `${method.percentage_of_transactions}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="text-right py-3 px-4 font-medium">
                                                                {formatCurrency(method.total)}
                                                            </td>
                                                            <td className="text-right py-3 px-4">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <span>{method.percentage_of_revenue.toFixed(1)}%</span>
                                                                    <div className="w-16 h-2 rounded-full bg-secondary">
                                                                        <div
                                                                            className="h-2 rounded-full bg-green-500"
                                                                            style={{ width: `${method.percentage_of_revenue}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="text-right py-3 px-4">
                                                                {formatCurrency(method.average_transaction)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : null}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
