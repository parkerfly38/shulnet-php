import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type HebrewDate, type Yahrzeit, type Event } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Calendar, CalendarDays, MapPin, Globe, AlertCircle, UserPlus, Zap, GraduationCap, Mail, Printer, Heart, Cake, Users, Car, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { StudentOnboardingWorkflow, type SchoolTuitionTier, type Parent, type Member } from '@/components/student-onboarding-workflow';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface InvoiceAgingData {
    count: number;
    total: number;
}

interface OpenInvoice {
    id: number;
    invoice_number: string;
    member_name: string;
    member_id: number;
    due_date: string;
    total: string;
    status: string;
    days_overdue: number | null;
    aging_category: string;
}

interface MembershipTier {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: string;
    billing_period: 'annual' | 'monthly' | 'lifetime' | 'custom';
    features: string[] | null;
}

interface CareAlertNote {
    id: number;
    name: string;
    member_care_alert: string;
    priority: string;
    deadline_date: string | null;
    member: {
        id: number;
        first_name: string;
        last_name: string;
    } | null;
}

interface LifecycleEvent {
    member_id: number;
    member_name: string;
    event_type: 'birthday' | 'anniversary';
    event_date: string;
    days_until: number;
}

interface RecentMember {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    created_at: string;
    months_ago: number;
    days_ago: number;
}

interface RideRequest {
    id: number;
    service_at: string;
    pickup_location: string;
    passenger_count: number;
    requester: { id: number; name: string };
    driver: { id: number; name: string } | null;
}

interface DashboardProps {
    membersJoinedData: Array<{
        month: string;
        members: number;
    }>;
    currentYear: number;
    currentHebrewDate: HebrewDate;
    currentMonthYahrzeits: Yahrzeit[];
    upcomingEvents: Event[];
    openInvoices: OpenInvoice[];
    invoiceAging: Record<string, InvoiceAgingData>;
    membershipTiers: MembershipTier[];
    schoolTuitionTiers: SchoolTuitionTier[];
    parents: Parent[];
    members: Member[];
    careAlertNotes: CareAlertNote[];
    upcomingLifecycleEvents: LifecycleEvent[];
    recentMembers: RecentMember[];
    upcomingRideRequests: RideRequest[];
}

export default function Dashboard({ membersJoinedData, currentYear, currentHebrewDate, currentMonthYahrzeits, upcomingEvents, openInvoices, invoiceAging, membershipTiers, schoolTuitionTiers, parents, members, careAlertNotes, upcomingLifecycleEvents, recentMembers, upcomingRideRequests }: DashboardProps) {
    const { t } = useTranslation();
    const { auth, currency } = usePage().props as any;
    const user = auth.user;
    
    // Dialog state
    const [showMemberOnboarding, setShowMemberOnboarding] = useState(false);
    const [showStudentOnboarding, setShowStudentOnboarding] = useState(false);
    const [showMonthlyYahrzeits, setShowMonthlyYahrzeits] = useState(false);

    // Currency symbol mapping
    const currencySymbols: Record<string, string> = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        CAD: '$',
        AUD: '$',
        ILS: '₪',
        JPY: '¥',
        CHF: 'Fr',
        CNY: '¥',
        INR: '₹',
    };
    const currencySymbol = currencySymbols[currency] || '$';

    // Hebrew month names (regular year)
    const hebrewMonthNames: Record<number, string> = {
        1: 'Tishrei',
        2: 'Cheshvan',
        3: 'Kislev',
        4: 'Tevet',
        5: 'Shevat',
        6: 'Adar',
        7: 'Nisan',
        8: 'Iyar',
        9: 'Sivan',
        10: 'Tammuz',
        11: 'Av',
        12: 'Elul'
    };

    // Hebrew month names (leap year)
    const hebrewMonthNamesLeap: Record<number, string> = {
        1: 'Tishrei',
        2: 'Cheshvan',
        3: 'Kislev',
        4: 'Tevet',
        5: 'Shevat',
        6: 'Adar',
        7: 'Adar II',
        8: 'Nisan',
        9: 'Iyar',
        10: 'Sivan',
        11: 'Tammuz',
        12: 'Av',
        13: 'Elul'
    };

    // Get the correct month name based on whether it's a leap year
    const getHebrewMonthName = (month: number) => {
        if (currentHebrewDate.isLeapYear) {
            return hebrewMonthNamesLeap[month] || 'Unknown';
        }
        return hebrewMonthNames[month] || 'Unknown';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Dashboard')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Members Joined Chart and Workflows */}
                <div className="grid gap-4 lg:grid-cols-12">
                    <div className="lg:col-span-8 bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Members Joined in {currentYear}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {t('New memberships by month')}
                            </p>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={membersJoinedData}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                                    <XAxis 
                                        dataKey="month" 
                                        className="text-gray-600 dark:text-gray-400"
                                        tick={{ fill: 'currentColor' }}
                                    />
                                    <YAxis 
                                        className="text-gray-600 dark:text-gray-400"
                                        tick={{ fill: 'currentColor' }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'var(--tooltip-bg, white)',
                                            border: '1px solid var(--tooltip-border, #e5e7eb)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--tooltip-text, black)'
                                        }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="members" 
                                        stroke="#3b82f6" 
                                        strokeWidth={2}
                                        dot={{ fill: '#3b82f6', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Workflows */}
                    <div className="lg:col-span-4 bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                <Zap className="h-5 w-5 me-2" />
                                {t('Quick Workflows')}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {t('Common administrative tasks')}
                            </p>
                        </div>
                        <div className="space-y-3">
                            <Dialog open={showMemberOnboarding} onOpenChange={setShowMemberOnboarding}>
                                <DialogTrigger asChild>
                                    <button className="w-full text-start p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                                                <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="ms-3 flex-1">
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {t('Onboard New Member')}
                                                </h3>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                                    {t('Create member, assign tier, generate invoice')}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>{t('Onboard New Member')}</DialogTitle>
                                        <DialogDescription>
                                            {t('Create a new member profile, assign a membership tier, and optionally generate an invoice.')}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <OnboardingWorkflow membershipTiers={membershipTiers} onClose={() => setShowMemberOnboarding(false)} />
                                </DialogContent>
                            </Dialog>
                            
                            <Dialog open={showStudentOnboarding} onOpenChange={setShowStudentOnboarding}>
                                <DialogTrigger asChild>
                                    <button className="w-full text-start p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                                                <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="ms-3 flex-1">
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {t('Onboard New Student')}
                                                </h3>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                                    Create student(s), assign parent, set tuition tier
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>{t('Onboard New Student')}</DialogTitle>
                                        <DialogDescription>
                                            Create student profile(s), assign or create a parent, select tuition tier, and generate an invoice.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <StudentOnboardingWorkflow 
                                        schoolTuitionTiers={schoolTuitionTiers} 
                                        parents={parents}
                                        members={members}
                                        onClose={() => setShowStudentOnboarding(false)}
                                    />
                                </DialogContent>
                            </Dialog>

                            <Dialog open={showMonthlyYahrzeits} onOpenChange={setShowMonthlyYahrzeits}>
                                <DialogTrigger asChild>
                                    <button className="w-full text-start p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                                                <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div className="ms-3 flex-1">
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {t('Print/Email Monthly Yahrzeit Letters')}
                                                </h3>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                                    {t('Generate letters for this Hebrew month')}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>{t('Monthly Yahrzeit Letters')}</DialogTitle>
                                        <DialogDescription>
                                            {t('Generate PDF or send email reminders for all yahrzeits in the current Hebrew month.')}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <MonthlyYahrzeitWorkflow 
                                        currentHebrewDate={currentHebrewDate}
                                        onClose={() => setShowMonthlyYahrzeits(false)}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {/* Current Hebrew Month Yahrzeits */}
                    <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-4 overflow-hidden flex flex-col">
                        <div className="mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                <Calendar className="h-4 w-4 me-2" />
                                {currentHebrewDate.month} Yahrzeits
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Today: {currentHebrewDate.formatted}
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-64">
                            {currentMonthYahrzeits && currentMonthYahrzeits.length > 0 ? (
                                <div className="space-y-2">
                                    {currentMonthYahrzeits.map((yahrzeit) => (
                                        <div 
                                            key={yahrzeit.id}
                                            className="border border-gray-200 dark:border-gray-700 rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                                        >
                                            <div className="flex items-start gap-2">
                                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                                                        {yahrzeit.hebrew_day_of_death}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                        {yahrzeit.name}
                                                    </div>
                                                    {yahrzeit.hebrew_name && (
                                                        <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                            {yahrzeit.hebrew_name}
                                                        </div>
                                                    )}
                                                    {yahrzeit.members && yahrzeit.members.length > 0 && (
                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                            {yahrzeit.members.slice(0, 2).map((member) => (
                                                                <Link
                                                                    key={member.id}
                                                                    href={`/admin/members/${member.id}`}
                                                                    className="inline-flex items-center text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                                                >
                                                                    {member.name.split(' ')[0]}
                                                                </Link>
                                                            ))}
                                                            {yahrzeit.members.length > 2 && (
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    +{yahrzeit.members.length - 2}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-xs">{t('No yahrzeits this month')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-4 overflow-hidden flex flex-col">
                        <div className="mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                <CalendarDays className="h-4 w-4 me-2" />
                                {t('Upcoming Events')}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {t('Next scheduled events')}
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-64">
                            {upcomingEvents && upcomingEvents.length > 0 ? (
                                <div className="space-y-2">
                                    {upcomingEvents.map((event) => {
                                        const startDate = new Date(event.event_start);
                                        const endDate = new Date(event.event_end);
                                        const isToday = startDate.toDateString() === new Date().toDateString();
                                        
                                        return (
                                            <Link
                                                key={event.id}
                                                href={`/admin/events/${event.id}`}
                                                className="block border border-gray-200 dark:border-gray-700 rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <div className="flex-shrink-0 w-12 text-center">
                                                        <div className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase">
                                                            {startDate.toLocaleDateString('en-US', { month: 'short' })}
                                                        </div>
                                                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                            {startDate.getDate()}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start gap-1">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate flex-1">
                                                                {event.name}
                                                            </div>
                                                            {isToday && (
                                                                <span className="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
                                                                    {t('Today')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {event.tagline && (
                                                            <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                                {event.tagline}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                            {!event.all_day && (
                                                                <span>
                                                                    {startDate.toLocaleTimeString('en-US', { 
                                                                        hour: 'numeric', 
                                                                        minute: '2-digit',
                                                                        hour12: true 
                                                                    })}
                                                                </span>
                                                            )}
                                                            {event.location && (
                                                                <span className="flex items-center">
                                                                    <MapPin className="h-3 w-3 me-0.5" />
                                                                    <span className="truncate max-w-[100px]">{event.location}</span>
                                                                </span>
                                                            )}
                                                            {event.online && (
                                                                <span className="flex items-center">
                                                                    <Globe className="h-3 w-3 me-0.5" />
                                                                    {t('Online')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-xs">{t('No upcoming events')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Open Invoices by Aging */}
                    <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-4 overflow-hidden flex flex-col">
                        <div className="mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                <span className="text-lg me-2">{currencySymbol}</span>
                                {t('Open Invoices')}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {t('Aging summary')}
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {/* Aging Summary */}
                            <div className="space-y-2 mb-3">
                                {Object.entries(invoiceAging).map(([category, data]) => {
                                    if (data.count === 0) return null;
                                    
                                    const categoryLabels: Record<string, string> = {
                                        'current': 'Current',
                                        '1-30': '1-30 Days',
                                        '31-60': '31-60 Days',
                                        '61-90': '61-90 Days',
                                        '90+': '90+ Days'
                                    };
                                    
                                    const categoryColors: Record<string, string> = {
                                        'current': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
                                        '1-30': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
                                        '31-60': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
                                        '61-90': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
                                        '90+': 'bg-red-200 dark:bg-red-900/40 text-red-900 dark:text-red-200'
                                    };
                                    
                                    return (
                                        <div key={category} className={`rounded-md p-2 ${categoryColors[category]}`}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium">
                                                    {categoryLabels[category]}
                                                </span>
                                                <div className="text-end">
                                                    <div className="text-sm font-bold">
                                                        {currencySymbol}{data.total.toFixed(2)}
                                                    </div>
                                                    <div className="text-xs opacity-75">
                                                        {data.count} {data.count === 1 ? 'invoice' : 'invoices'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Recent Open Invoices */}
                            {openInvoices && openInvoices.length > 0 && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        {t('Recent Open Invoices')}
                                    </h4>
                                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                        {openInvoices.slice(0, 5).map((invoice) => (
                                            <Link
                                                key={invoice.id}
                                                href={`/admin/invoices/${invoice.id}`}
                                                className="block border border-gray-200 dark:border-gray-700 rounded p-1.5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-xs"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                            {invoice.invoice_number}
                                                        </div>
                                                        <div className="text-gray-600 dark:text-gray-400 truncate">
                                                            {invoice.member_name}
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0 text-end">
                                                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                            {formatCurrency(invoice.total, currency)}
                                                        </div>
                                                        {invoice.days_overdue !== null && invoice.days_overdue > 0 && (
                                                            <div className="flex items-center text-red-600 dark:text-red-400">
                                                                <AlertCircle className="h-3 w-3 me-0.5" />
                                                                {invoice.days_overdue}d
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* New Dashboard Sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Member Care Alerts */}
                    <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                <Heart className="h-5 w-5 me-2 text-red-500" />
                                {t('Member Care Alerts')}
                            </h3>
                            <Link href="/admin/notes">
                                <span className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                    {t('View All Notes')}
                                </span>
                            </Link>
                        </div>
                        {careAlertNotes.length > 0 ? (
                            <div className="space-y-2">
                                {careAlertNotes.map((note) => (
                                    <Link
                                        key={note.id}
                                        href={`/admin/notes/${note.id}`}
                                        className="block border-2 border-red-500 rounded-lg p-3 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                        <Heart className="h-3 w-3 me-1" />
                                                        {note.member_care_alert === 'hospitalized' && 'Hospitalized'}
                                                        {note.member_care_alert === 'mourning' && 'Mourning'}
                                                        {note.member_care_alert === 'immediate_follow_up' && 'Immediate Follow-Up'}
                                                        {note.member_care_alert === 'other_emergency' && 'Other Emergency'}
                                                    </span>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                        note.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                        note.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                    }`}>
                                                        {note.priority}
                                                    </span>
                                                </div>
                                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                                    {note.name}
                                                </div>
                                                {note.member && (
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        Member: {note.member.first_name} {note.member.last_name}
                                                    </div>
                                                )}
                                                {note.deadline_date && (
                                                    <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                                        Deadline: {new Date(note.deadline_date).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Heart className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                <p>{t('No active member care alerts')}</p>
                            </div>
                        )}
                    </div>

                    {/* Upcoming Lifecycle Events */}
                    <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                <Cake className="h-5 w-5 me-2 text-purple-500" />
                                {t('Upcoming Lifecycle Events')}
                            </h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{t('Next 30 Days')}</span>
                        </div>
                        {upcomingLifecycleEvents.length > 0 ? (
                            <div className="space-y-2">
                                {upcomingLifecycleEvents.map((event, index) => (
                                    <Link
                                        key={index}
                                        href={`/admin/members/${event.member_id}`}
                                        className="block border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                        event.event_type === 'birthday' 
                                                            ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                                                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                    }`}>
                                                        {event.event_type === 'birthday' ? '🎂 Birthday' : '💐 Anniversary'}
                                                    </span>
                                                </div>
                                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                                    {event.member_name}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {new Date(event.event_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {event.days_until === 0 ? 'Today!' : `${Math.ceil(event.days_until)}d`}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Cake className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                <p>{t('No upcoming events in the next 30 days')}</p>
                            </div>
                        )}
                    </div>

                    {/* Recent Members */}
                    <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                <Users className="h-5 w-5 me-2 text-green-500" />
                                {t('Recently Joined Members')}
                            </h3>
                            <Link href="/admin/members">
                                <span className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                    {t('View All Members')}
                                </span>
                            </Link>
                        </div>
                        {recentMembers.length > 0 ? (
                            <div className="space-y-2">
                                {recentMembers.map((member) => (
                                    <Link
                                        key={member.id}
                                        href={`/admin/members/${member.id}`}
                                        className="block border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                                    {member.first_name} {member.last_name}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                    {member.email}
                                                </div>
                                            </div>
                                            <div className="text-end flex-shrink-0">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {new Date(member.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                                    {member.months_ago < 1
                                                        ? member.days_ago < 1
                                                            ? 'Today'
                                                            : `${member.days_ago} day${member.days_ago > 1 ? 's' : ''} ago`
                                                        : `${member.months_ago} month${member.months_ago > 1 ? 's' : ''} ago`}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                <p>{t('No members joined in the last 60 days')}</p>
                            </div>
                        )}
                    </div>

                    {/* Upcoming Ride Requests */}
                    <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                <Car className="h-5 w-5 me-2 text-blue-600 dark:text-blue-400" />
                                {t('Upcoming Ride Needs')}
                            </h3>
                            <Link href="/member/rides">
                                <span className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{t('View Ride Sharing')}</span>
                            </Link>
                        </div>
                        {upcomingRideRequests.length > 0 ? (
                            <div className="space-y-2">
                                {upcomingRideRequests.map((rideRequest) => (
                                    <div key={rideRequest.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <Link href={`/admin/members/${rideRequest.requester.id}`} className="font-medium text-gray-900 dark:text-gray-100 hover:underline">
                                                    {rideRequest.requester.name}
                                                </Link>
                                                <div className="mt-1 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                    <Clock className="h-3.5 w-3.5 shrink-0" />
                                                    {new Date(rideRequest.service_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                                </div>
                                                <div className="mt-1 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 truncate">
                                                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                    {rideRequest.pickup_location}
                                                </div>
                                            </div>
                                            <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${rideRequest.driver ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                                                {rideRequest.driver ? 'Driver assigned' : 'Needs driver'}
                                            </span>
                                        </div>
                                        {rideRequest.driver && (
                                            <div className="mt-2 border-t border-gray-100 pt-2 text-sm dark:border-gray-800">
                                                Driver: <Link href={`/admin/members/${rideRequest.driver.id}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">{rideRequest.driver.name}</Link>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Car className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                <p>{t('No upcoming ride needs')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

interface OnboardingWorkflowProps {
    membershipTiers: MembershipTier[];
    onClose: () => void;
}

function OnboardingWorkflow({ membershipTiers, onClose }: OnboardingWorkflowProps) {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const { currency } = usePage().props as any;
    const [formData, setFormData] = useState({
        // Basic member details
        first_name: '',
        last_name: '',
        middle_name: '',
        title: '',
        email: '',
        phone1: '',
        phone2: '',
        
        // Address
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        
        // Additional details
        member_type: '',
        gender: '',
        dob: '',
        hebrew_name: '',
        father_hebrew_name: '',
        mother_hebrew_name: '',
        anniversary_date: '',
        
        // Membership details
        membership_tier_id: '',
        start_date: new Date().toISOString().split('T')[0],
        
        // Invoice options
        create_invoice: true,
        email_invoice: false,
    });

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = () => {
        router.post('/onboarding/member', formData, {
            onSuccess: () => {
                onClose();
                setStep(1);
                setFormData({
                    first_name: '',
                    last_name: '',
                    middle_name: '',
                    title: '',
                    email: '',
                    phone1: '',
                    phone2: '',
                    address_line_1: '',
                    address_line_2: '',
                    city: '',
                    state: '',
                    zip: '',
                    country: '',
                    member_type: '',
                    gender: '',
                    dob: '',
                    hebrew_name: '',
                    father_hebrew_name: '',
                    mother_hebrew_name: '',
                    anniversary_date: '',
                    membership_tier_id: '',
                    start_date: new Date().toISOString().split('T')[0],
                    create_invoice: true,
                    email_invoice: false,
                });
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-between">
                {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex items-center flex-1">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            step >= s 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                            {s}
                        </div>
                        {s < 4 && <div className={`flex-1 h-1 ${
                            step > s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`} />}
                    </div>
                ))}
            </div>

            {/* Step Labels */}
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>{t('Basic Info')}</span>
                <span>{t('Additional Details')}</span>
                <span>{t('Membership Tier')}</span>
                <span>{t('Invoice Preview')}</span>
            </div>

            {/* Step Content */}
            <div className="min-h-[400px]">
                {step === 1 && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">{t('Basic Member Information')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('Title')}</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder={t('Mr., Mrs., Dr., etc.')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">First Name *</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('Middle Name')}</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.middle_name}
                                    onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Last Name *</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email *</label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('Primary Phone')}</label>
                                <input
                                    type="tel"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.phone1}
                                    onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">{t('Secondary Phone')}</label>
                                <input
                                    type="tel"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.phone2}
                                    onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Address Line 1</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.address_line_1}
                                    onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Address Line 2</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.address_line_2}
                                    onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('City')}</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('State')}</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('ZIP Code')}</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.zip}
                                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('Country')}</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">{t('Additional Member Details')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('Member Type')}</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.member_type}
                                    onChange={(e) => setFormData({ ...formData, member_type: e.target.value })}
                                >
                                    <option value="">{t('Select type')}</option>
                                    <option value="member">{t('Member')}</option>
                                    <option value="contact">{t('Contact')}</option>
                                    <option value="prospect">{t('Prospect')}</option>
                                    <option value="former">{t('Former Member')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('Gender')}</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="">{t('Select gender')}</option>
                                    <option value="male">{t('Male')}</option>
                                    <option value="female">{t('Female')}</option>
                                    <option value="other">{t('Other')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('Date of Birth')}</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.dob}
                                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('Anniversary Date')}</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.anniversary_date}
                                    onChange={(e) => setFormData({ ...formData, anniversary_date: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">{t('Hebrew Name')}</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.hebrew_name}
                                    onChange={(e) => setFormData({ ...formData, hebrew_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t("Father's Hebrew Name")}</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.father_hebrew_name}
                                    onChange={(e) => setFormData({ ...formData, father_hebrew_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t("Mother's Hebrew Name")}</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.mother_hebrew_name}
                                    onChange={(e) => setFormData({ ...formData, mother_hebrew_name: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">{t('Select Membership Tier')}</h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Choose a membership tier for {formData.first_name} {formData.last_name}
                        </div>
                        <div className="space-y-3">
                            {membershipTiers.map((tier) => (
                                <div
                                    key={tier.id}
                                    onClick={() => setFormData({ ...formData, membership_tier_id: tier.id.toString() })}
                                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                        formData.membership_tier_id === tier.id.toString()
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="font-medium text-lg">{tier.name}</div>
                                            {tier.description && (
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {tier.description}
                                                </div>
                                            )}
                                            {tier.features && tier.features.length > 0 && (
                                                <ul className="mt-2 space-y-1">
                                                    {tier.features.map((feature, idx) => (
                                                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                                                            <span className="me-2">✓</span>
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        <div className="ms-4 text-end">
                                            <div className="font-bold text-xl">
                                                {formatCurrency(parseFloat(tier.price), currency)}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                                                {tier.billing_period}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Start Date *</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="create_invoice"
                                checked={formData.create_invoice}
                                onChange={(e) => setFormData({ ...formData, create_invoice: e.target.checked })}
                                className="rounded"
                            />
                            <label htmlFor="create_invoice" className="text-sm">{t('Create invoice for this membership')}</label>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">{t('Review & Send Invoice')}</h3>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{t('Member')}</div>
                                <div className="font-medium">{formData.first_name} {formData.last_name}</div>
                                <div className="text-sm">{formData.email}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{t('Membership')}</div>
                                {formData.membership_tier_id && (() => {
                                    const selectedTier = membershipTiers.find(t => t.id.toString() === formData.membership_tier_id);
                                    return selectedTier ? (
                                        <>
                                            <div className="font-medium">{selectedTier.name}</div>
                                            <div className="text-sm">Start Date: {formData.start_date}</div>
                                            <div className="text-sm capitalize">{selectedTier.billing_period} - {formatCurrency(parseFloat(selectedTier.price), currency)}</div>
                                        </>
                                    ) : null;
                                })()}
                            </div>
                            {formData.create_invoice && formData.membership_tier_id && (() => {
                                const selectedTier = membershipTiers.find(t => t.id.toString() === formData.membership_tier_id);
                                return selectedTier ? (
                                    <div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">{t('Invoice Amount')}</div>
                                        <div className="font-medium text-lg">{formatCurrency(parseFloat(selectedTier.price), currency)}</div>
                                    </div>
                                ) : null;
                            })()}
                        </div>
                        {formData.create_invoice && (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="email_invoice"
                                    checked={formData.email_invoice}
                                    onChange={(e) => setFormData({ ...formData, email_invoice: e.target.checked })}
                                    className="rounded"
                                />
                                <label htmlFor="email_invoice" className="text-sm">{t('Email invoice to member')}</label>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={step === 1}
                >
                    {t('Back')}
                </Button>
                {step < 3 ? (
                    <Button onClick={handleNext}>
                        {t('Next')}
                    </Button>
                ) : (
                    <Button onClick={handleSubmit}>
                        {t('Complete Onboarding')}
                    </Button>
                )}
            </div>
        </div>
    );
}

interface MonthlyYahrzeitWorkflowProps {
    currentHebrewDate: HebrewDate;
    onClose: () => void;
}

interface YahrzeitData {
    id: number;
    name: string;
    hebrew_name: string | null;
    hebrew_day_of_death: number;
    hebrew_month_of_death: string;
    date_of_death: string;
    observance_type: string | null;
    notes: string | null;
    gregorian_date: string;
    members: Array<{
        id: number;
        first_name: string;
        last_name: string;
        email: string | null;
        relationship: string;
    }>;
}

function MonthlyYahrzeitWorkflow({ currentHebrewDate, onClose }: MonthlyYahrzeitWorkflowProps) {
    const { t } = useTranslation();
    const [yahrzeits, setYahrzeits] = useState<YahrzeitData[]>([]);
    const [selectedYahrzeits, setSelectedYahrzeits] = useState<number[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string>(currentHebrewDate.month);
    const [loading, setLoading] = useState(true);
    const [action, setAction] = useState<'email' | 'print'>('email');
    const [processing, setProcessing] = useState(false);

    // Hebrew month names (regular year)
    const hebrewMonthNames: Record<number, string> = {
        1: 'Tishrei', 2: 'Cheshvan', 3: 'Kislev', 4: 'Tevet', 5: 'Shevat', 6: 'Adar',
        7: 'Nisan', 8: 'Iyar', 9: 'Sivan', 10: 'Tammuz', 11: 'Av', 12: 'Elul'
    };

    // Hebrew month names (leap year)
    const hebrewMonthNamesLeap: Record<number, string> = {
        1: 'Tishrei', 2: 'Cheshvan', 3: 'Kislev', 4: 'Tevet', 5: 'Shevat', 6: 'Adar',
        7: 'Adar II', 8: 'Nisan', 9: 'Iyar', 10: 'Sivan', 11: 'Tammuz', 12: 'Av', 13: 'Elul'
    };

    useEffect(() => {
        // Fetch yahrzeits for selected month
        setLoading(true);
        fetch(`/admin/yahrzeits/monthly/prepare?month=${selectedMonth}`)
            .then(res => res.json())
            .then(data => {
                setYahrzeits(data.yahrzeits);
                // Select all by default
                setSelectedYahrzeits(data.yahrzeits.map((y: YahrzeitData) => y.id));
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
            });
    }, [selectedMonth]);

    const handleToggleYahrzeit = (id: number) => {
        setSelectedYahrzeits(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleToggleAll = () => {
        if (selectedYahrzeits.length === yahrzeits.length) {
            setSelectedYahrzeits([]);
        } else {
            setSelectedYahrzeits(yahrzeits.map(y => y.id));
        }
    };

    const handleSubmit = () => {
        if (selectedYahrzeits.length === 0) return;

        setProcessing(true);

        if (action === 'email') {
            // Send emails
            router.post('/admin/yahrzeits/monthly/send', {
                yahrzeit_ids: selectedYahrzeits,
                month: selectedMonth,
            }, {
                preserveState: true,
                onSuccess: () => {
                    onClose();
                },
                onFinish: () => {
                    setProcessing(false);
                },
            });
        } else {
            // Open print view in new window
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/admin/yahrzeits/monthly/print';
            form.target = '_blank';

            // Add CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (csrfToken) {
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = '_token';
                csrfInput.value = csrfToken;
                form.appendChild(csrfInput);
            }

            // Add yahrzeit IDs
            selectedYahrzeits.forEach(id => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'yahrzeit_ids[]';
                input.value = id.toString();
                form.appendChild(input);
            });

            // Add month
            const monthInput = document.createElement('input');
            monthInput.type = 'hidden';
            monthInput.name = 'month';
            monthInput.value = selectedMonth.toString();
            form.appendChild(monthInput);

            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);

            setProcessing(false);
            onClose();
        }
    };

    const getTotalRecipients = () => {
        return yahrzeits
            .filter(y => selectedYahrzeits.includes(y.id))
            .reduce((total, y) => {
                return total + (action === 'email' 
                    ? y.members.filter(m => m.email).length 
                    : y.members.length);
            }, 0);
    };

    return (
        <div className="space-y-6">
            {loading ? (
                <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">{t('Loading yahrzeits...')}</p>
                </div>
            ) : yahrzeits.length === 0 ? (
                <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">
                        No yahrzeits found for {selectedMonth}.
                    </p>
                    <div className="mt-4">
                        <Label htmlFor="hebrew-month-empty" className="text-sm font-medium">{t('Select a Different Month')}</Label>
                        <select
                            id="hebrew-month-empty"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                            {Object.entries(currentHebrewDate.isLeapYear ? hebrewMonthNamesLeap : hebrewMonthNames).map(([num, name]) => (
                                <option key={name} value={name}>
                                    {name} {name === currentHebrewDate.month ? '(Current)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium text-lg mb-2">
                                {t('Monthly Yahrzeit Letters')}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('Select the Hebrew month and yahrzeits to include')}
                            </p>
                        </div>

                        {/* Month Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="hebrew-month" className="text-sm font-medium">{t('Hebrew Month')}</Label>
                            <select
                                id="hebrew-month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            >
                                {Object.entries(currentHebrewDate.isLeapYear ? hebrewMonthNamesLeap : hebrewMonthNames).map(([num,name]) => (
                                    <option key={name} value={name}>
                                        {name} {name === currentHebrewDate.month ? '(Current)' : ''}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500">
                                Found {yahrzeits.length} yahrzeit{yahrzeits.length !== 1 ? 's' : ''} for {selectedMonth}
                            </p>
                        </div>

                        <div>
                            <h3 className="font-medium text-lg mb-2">
                                Yahrzeits for {selectedMonth} ({yahrzeits.length} total)
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('Select the yahrzeits to include in the letters')}
                            </p>
                        </div>

                        {/* Action Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">{t('Action')}</label>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="action-email"
                                        name="action"
                                        value="email"
                                        checked={action === 'email'}
                                        onChange={(e) => setAction(e.target.value as 'email' | 'print')}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <label htmlFor="action-email" className="cursor-pointer font-normal flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        {t('Send via Email to All Members')}
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="action-print"
                                        name="action"
                                        value="print"
                                        checked={action === 'print'}
                                        onChange={(e) => setAction(e.target.value as 'email' | 'print')}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <label htmlFor="action-print" className="cursor-pointer font-normal flex items-center gap-2">
                                        <Printer className="h-4 w-4" />
                                        {t('Generate PDF for All Members')}
                                    </label>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">
                                {action === 'email' 
                                    ? 'Individual emails will be sent to each member with an email address'
                                    : 'A single PDF document will be generated with one letter per member'}
                            </p>
                        </div>

                        {/* Yahrzeit Selection */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium">{t('Select Yahrzeits')}</label>
                                <button
                                    type="button"
                                    onClick={handleToggleAll}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    {selectedYahrzeits.length === yahrzeits.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>
                            <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-3">
                                {yahrzeits.map((yahrzeit) => {
                                    const membersWithEmail = yahrzeit.members.filter(m => m.email).length;
                                    const totalMembers = yahrzeit.members.length;
                                    
                                    return (
                                        <div key={yahrzeit.id} className="flex items-start space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                                            <input
                                                type="checkbox"
                                                id={`yahrzeit-${yahrzeit.id}`}
                                                checked={selectedYahrzeits.includes(yahrzeit.id)}
                                                onChange={() => handleToggleYahrzeit(yahrzeit.id)}
                                                className="mt-1 h-4 w-4 text-blue-600"
                                            />
                                            <label htmlFor={`yahrzeit-${yahrzeit.id}`} className="cursor-pointer flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                                            {yahrzeit.name}
                                                        </div>
                                                        {yahrzeit.hebrew_name && (
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                {yahrzeit.hebrew_name}
                                                            </div>
                                                        )}
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            ({yahrzeit.hebrew_month_of_death} {yahrzeit.hebrew_day_of_death}) • {yahrzeit.gregorian_date}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {totalMembers} member{totalMembers !== 1 ? 's' : ''}
                                                            {action === 'email' && ` (${membersWithEmail} with email)`}
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0 ms-2">
                                                        <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                                                            {yahrzeit.hebrew_day_of_death}
                                                        </span>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Summary and Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedYahrzeits.length} yahrzeit{selectedYahrzeits.length !== 1 ? 's' : ''} selected
                            {selectedYahrzeits.length > 0 && ` • ${getTotalRecipients()} letter${getTotalRecipients() !== 1 ? 's' : ''}`}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onClose} disabled={processing}>
                                {t('Cancel')}
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={selectedYahrzeits.length === 0 || processing || (action === 'email' && getTotalRecipients() === 0)}
                            >
                                {processing ? 'Processing...' : (
                                    action === 'email' 
                                        ? `Send ${getTotalRecipients()} Email${getTotalRecipients() !== 1 ? 's' : ''}`
                                        : `Generate PDF (${getTotalRecipients()} Letter${getTotalRecipients() !== 1 ? 's' : ''})`
                                )}
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
