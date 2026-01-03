import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type HebrewDate, type Yahrzeit, type Event } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Calendar, CalendarDays, MapPin, Globe, AlertCircle, UserPlus, Zap, GraduationCap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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

interface SchoolTuitionTier {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: string;
    billing_period: 'annual' | 'semester' | 'monthly' | 'custom';
    features: string[] | null;
}

interface Parent {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface Member {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
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
}

export default function Dashboard({ membersJoinedData, currentYear, currentHebrewDate, currentMonthYahrzeits, upcomingEvents, openInvoices, invoiceAging, membershipTiers, schoolTuitionTiers, parents, members }: DashboardProps) {
    const { auth, currency } = usePage().props as any;
    const user = auth.user;
    
    // Dialog state
    const [showMemberOnboarding, setShowMemberOnboarding] = useState(false);
    const [showStudentOnboarding, setShowStudentOnboarding] = useState(false);

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* User role indicators */}
                {user?.roles && user.roles.length > 0 && (
                    <div className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Roles</h3>
                        <div className="flex flex-wrap gap-2">
                            {user.roles.map((role: string) => {
                                const roleColors = {
                                    admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
                                    teacher: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                                    parent: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                                    student: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
                                    member: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
                                };
                                const colorClass = roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
                                
                                return (
                                    <span
                                        key={role}
                                        className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${colorClass}`}
                                    >
                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Members Joined Chart and Workflows */}
                <div className="grid gap-4 lg:grid-cols-12">
                    <div className="lg:col-span-8 bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Members Joined in {currentYear}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                New memberships by month
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
                                <Zap className="h-5 w-5 mr-2" />
                                Quick Workflows
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Common administrative tasks
                            </p>
                        </div>
                        <div className="space-y-3">
                            <Dialog open={showMemberOnboarding} onOpenChange={setShowMemberOnboarding}>
                                <DialogTrigger asChild>
                                    <button className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                                                <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="ml-3 flex-1">
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    Onboard New Member
                                                </h3>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                                    Create member, assign tier, generate invoice
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Onboard New Member</DialogTitle>
                                        <DialogDescription>
                                            Create a new member profile, assign a membership tier, and optionally generate an invoice.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <OnboardingWorkflow membershipTiers={membershipTiers} onClose={() => setShowMemberOnboarding(false)} />
                                </DialogContent>
                            </Dialog>
                            
                            <Dialog open={showStudentOnboarding} onOpenChange={setShowStudentOnboarding}>
                                <DialogTrigger asChild>
                                    <button className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                                                <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="ml-3 flex-1">
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    Onboard New Student
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
                                        <DialogTitle>Onboard New Student</DialogTitle>
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
                        </div>
                    </div>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {/* Current Hebrew Month Yahrzeits */}
                    <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-4 overflow-hidden flex flex-col">
                        <div className="mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                {hebrewMonthNames[currentHebrewDate.month]} Yahrzeits
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
                                    <p className="text-xs">No yahrzeits this month</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-4 overflow-hidden flex flex-col">
                        <div className="mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                <CalendarDays className="h-4 w-4 mr-2" />
                                Upcoming Events
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Next scheduled events
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
                                                                    Today
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
                                                                    <MapPin className="h-3 w-3 mr-0.5" />
                                                                    <span className="truncate max-w-[100px]">{event.location}</span>
                                                                </span>
                                                            )}
                                                            {event.online && (
                                                                <span className="flex items-center">
                                                                    <Globe className="h-3 w-3 mr-0.5" />
                                                                    Online
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
                                    <p className="text-xs">No upcoming events</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Open Invoices by Aging */}
                    <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-4 overflow-hidden flex flex-col">
                        <div className="mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                <span className="text-lg mr-2">{currencySymbol}</span>
                                Open Invoices
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Aging summary
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
                                                <div className="text-right">
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
                                        Recent Open Invoices
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
                                                    <div className="flex-shrink-0 text-right">
                                                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                            {formatCurrency(invoice.total, currency)}
                                                        </div>
                                                        {invoice.days_overdue !== null && invoice.days_overdue > 0 && (
                                                            <div className="flex items-center text-red-600 dark:text-red-400">
                                                                <AlertCircle className="h-3 w-3 mr-0.5" />
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
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
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
        console.log('Member onboarding - submitting with data:', formData);
        router.post('/onboarding/member', formData, {
            onSuccess: () => {
                console.log('Member onboarding - success!');
                onClose();
                setStep(1);
                setFormData({
                    first_name: '',
                    last_name: '',
                    middle_name: '',
                    email: '',
                    phone: '',
                    address: '',
                    date_of_birth: '',
                    gender: '',
                    membership_tier_id: '',
                    start_date: '',
                    create_invoice: true,
                    email_invoice: false,
                });
            },
            onError: (errors) => {
                console.error('Onboarding errors:', errors);
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
                <span>Basic Info</span>
                <span>Additional Details</span>
                <span>Membership Tier</span>
                <span>Invoice Preview</span>
            </div>

            {/* Step Content */}
            <div className="min-h-[400px]">
                {step === 1 && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">Basic Member Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Mr., Mrs., Dr., etc."
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
                                <label className="block text-sm font-medium mb-1">Middle Name</label>
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
                                <label className="block text-sm font-medium mb-1">Primary Phone</label>
                                <input
                                    type="tel"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.phone1}
                                    onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Secondary Phone</label>
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
                                <label className="block text-sm font-medium mb-1">City</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">State</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">ZIP Code</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.zip}
                                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Country</label>
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
                        <h3 className="font-medium text-lg">Additional Member Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Member Type</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.member_type}
                                    onChange={(e) => setFormData({ ...formData, member_type: e.target.value })}
                                >
                                    <option value="">Select type</option>
                                    <option value="member">Member</option>
                                    <option value="congregant">Congregant</option>
                                    <option value="guest">Guest</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Gender</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.dob}
                                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Anniversary Date</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.anniversary_date}
                                    onChange={(e) => setFormData({ ...formData, anniversary_date: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Hebrew Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.hebrew_name}
                                    onChange={(e) => setFormData({ ...formData, hebrew_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Father's Hebrew Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={formData.father_hebrew_name}
                                    onChange={(e) => setFormData({ ...formData, father_hebrew_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Mother's Hebrew Name</label>
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
                        <h3 className="font-medium text-lg">Select Membership Tier</h3>
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
                                                            <span className="mr-2">✓</span>
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        <div className="ml-4 text-right">
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
                            <label htmlFor="create_invoice" className="text-sm">Create invoice for this membership</label>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">Review & Send Invoice</h3>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Member</div>
                                <div className="font-medium">{formData.first_name} {formData.last_name}</div>
                                <div className="text-sm">{formData.email}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Membership</div>
                                {formData.membership_tier_id && (() => {
                                    const selectedTier = membershipTiers.find(t => t.id.toString() === formData.membership_tier_id);
                                    return selectedTier ? (
                                        <>
                                            <div className="font-medium">{selectedTier.name}</div>
                                            <div className="text-sm">Start Date: {formData.begin_date}</div>
                                            <div className="text-sm capitalize">{selectedTier.billing_period} - {formatCurrency(parseFloat(selectedTier.price), currency)}</div>
                                        </>
                                    ) : null;
                                })()}
                            </div>
                            {formData.create_invoice && formData.membership_tier_id && (() => {
                                const selectedTier = membershipTiers.find(t => t.id.toString() === formData.membership_tier_id);
                                return selectedTier ? (
                                    <div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Invoice Amount</div>
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
                                <label htmlFor="email_invoice" className="text-sm">Email invoice to member</label>
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
                    Back
                </Button>
                {step < 3 ? (
                    <Button onClick={handleNext}>
                        Next
                    </Button>
                ) : (
                    <Button onClick={handleSubmit}>
                        Complete Onboarding
                    </Button>
                )}
            </div>
        </div>
    );
}
interface StudentOnboardingWorkflowProps {
    schoolTuitionTiers: SchoolTuitionTier[];
    parents: Parent[];
    members: Member[];
    onClose: () => void;
}

interface StudentFormData {
    first_name: string;
    last_name: string;
    middle_name: string;
    gender: string;
    date_of_birth: string;
    address: string;
    email: string;
    is_parent_email: boolean;
}

function StudentOnboardingWorkflow({ schoolTuitionTiers, parents, members, onClose }: StudentOnboardingWorkflowProps) {
    const [step, setStep] = useState(1);
    const { currency } = usePage().props as any;
    
    const [students, setStudents] = useState<StudentFormData[]>([{
        first_name: '',
        last_name: '',
        middle_name: '',
        gender: '',
        date_of_birth: '',
        address: '',
        email: '',
        is_parent_email: false,
    }]);
    
    const [parentData, setParentData] = useState({
        selection_type: 'existing_parent', // 'existing_parent', 'existing_member', 'new_parent'
        parent_id: '',
        member_id: '',
        // New parent fields
        first_name: '',
        last_name: '',
        date_of_birth: '',
        address: '',
        email: '',
    });

    const [tuitionData, setTuitionData] = useState({
        tuition_tier_id: '',
        quantity: 1,
        start_date: new Date().toISOString().split('T')[0],
        create_invoice: true,
        email_invoice: false,
    });

    // Sync quantity with student count
    useEffect(() => {
        setTuitionData(prev => ({ ...prev, quantity: students.length }));
    }, [students.length]);

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const addStudent = () => {
        setStudents([...students, {
            first_name: '',
            last_name: '',
            middle_name: '',
            gender: '',
            date_of_birth: '',
            address: '',
            email: '',
            is_parent_email: false,
        }]);
    };

    const removeStudent = (index: number) => {
        if (students.length > 1) {
            setStudents(students.filter((_, i) => i !== index));
        }
    };

    const updateStudent = (index: number, field: keyof StudentFormData, value: string | boolean) => {
        const updatedStudents = [...students];
        updatedStudents[index] = { ...updatedStudents[index], [field]: value };
        setStudents(updatedStudents);
    };

    const handleSubmit = () => {
        console.log('Student onboarding - submitting with data:', { students, parent_data: parentData, tuition_data: tuitionData });
        router.post('/onboarding/student', {
            students,
            parent_data: parentData,
            tuition_data: tuitionData,
        }, {
            onSuccess: () => {
                console.log('Student onboarding - success!');
                onClose();
                setStep(1);
                setStudents([{
                    first_name: '',
                    last_name: '',
                    middle_name: '',
                    gender: '',
                    date_of_birth: '',
                    address: '',
                    email: '',
                    is_parent_email: false,
                }]);
                setParentData({
                    selection_type: 'existing_parent',
                    parent_id: '',
                    member_id: '',
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    address: '',
                });
                setTuitionData({
                    tuition_tier_id: '',
                    quantity: 1,
                    start_date: '',
                    create_invoice: true,
                    email_invoice: false,
                });
            },
            onError: (errors) => {
                console.error('Onboarding errors:', errors);
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
                                ? 'bg-green-600 text-white' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                            {s}
                        </div>
                        {s < 4 && <div className={`flex-1 h-1 ${
                            step > s ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`} />}
                    </div>
                ))}
            </div>

            {/* Step Labels */}
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Student Details</span>
                <span>Parent/Guardian</span>
                <span>Tuition Tier</span>
                <span>Invoice Preview</span>
            </div>

            {/* Step Content */}
            <div className="min-h-[400px]">
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-lg">Student Information</h3>
                            <Button onClick={addStudent} size="sm">
                                <UserPlus className="h-4 w-4 mr-1" />
                                Add Another Student
                            </Button>
                        </div>
                        
                        {students.map((student, index) => (
                            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium">Student {index + 1}</h4>
                                    {students.length > 1 && (
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => removeStudent(index)}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">First Name *</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={student.first_name}
                                            onChange={(e) => updateStudent(index, 'first_name', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Last Name *</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={student.last_name}
                                            onChange={(e) => updateStudent(index, 'last_name', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Middle Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={student.middle_name}
                                            onChange={(e) => updateStudent(index, 'middle_name', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Gender</label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={student.gender}
                                            onChange={(e) => updateStudent(index, 'gender', e.target.value)}
                                        >
                                            <option value="">Select gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={student.date_of_birth}
                                            onChange={(e) => updateStudent(index, 'date_of_birth', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Email</label>
                                        <input
                                            type="email"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={student.email}
                                            onChange={(e) => updateStudent(index, 'email', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1">Address</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={student.address}
                                            onChange={(e) => updateStudent(index, 'address', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`is_parent_email_${index}`}
                                                checked={student.is_parent_email}
                                                onChange={(e) => updateStudent(index, 'is_parent_email', e.target.checked)}
                                                className="rounded"
                                            />
                                            <label htmlFor={`is_parent_email_${index}`} className="text-sm">
                                                Use parent's email
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">Select or Create Parent/Guardian</h3>
                        
                        <div className="space-y-3">
                            <label className="flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                                <input
                                    type="radio"
                                    name="parent_type"
                                    value="existing_parent"
                                    checked={parentData.selection_type === 'existing_parent'}
                                    onChange={(e) => setParentData({ ...parentData, selection_type: e.target.value })}
                                    className="rounded-full"
                                />
                                <span>Select from Existing Parents ({parents?.length || 0} available)</span>
                            </label>
                            
                            {parentData.selection_type === 'existing_parent' && (
                                <div className="ml-6">
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                        value={parentData.parent_id}
                                        onChange={(e) => setParentData({ ...parentData, parent_id: e.target.value })}
                                    >
                                        <option value="">Select a parent</option>
                                        {parents && parents.length > 0 ? (
                                            parents.map((parent) => (
                                                <option key={parent.id} value={parent.id}>
                                                    {parent.first_name} {parent.last_name} - {parent.email}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>No parents available</option>
                                        )}
                                    </select>
                                </div>
                            )}

                            <label className="flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                                <input
                                    type="radio"
                                    name="parent_type"
                                    value="existing_member"
                                    checked={parentData.selection_type === 'existing_member'}
                                    onChange={(e) => setParentData({ ...parentData, selection_type: e.target.value })}
                                    className="rounded-full"
                                />
                                <span>Select from Existing Members (will add as parent) ({members?.length || 0} available)</span>
                            </label>
                            
                            {parentData.selection_type === 'existing_member' && (
                                <div className="ml-6">
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                        value={parentData.member_id}
                                        onChange={(e) => setParentData({ ...parentData, member_id: e.target.value })}
                                    >
                                        <option value="">Select a member</option>
                                        {members && members.length > 0 ? (
                                            members.map((member) => (
                                                <option key={member.id} value={member.id}>
                                                    {member.first_name} {member.last_name} - {member.email}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>No members available</option>
                                        )}
                                    </select>
                                </div>
                            )}

                            <label className="flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                                <input
                                    type="radio"
                                    name="parent_type"
                                    value="new_parent"
                                    checked={parentData.selection_type === 'new_parent'}
                                    onChange={(e) => setParentData({ ...parentData, selection_type: e.target.value })}
                                    className="rounded-full"
                                />
                                <span>Create New Parent</span>
                            </label>
                            
                            {parentData.selection_type === 'new_parent' && (
                                <div className="ml-6 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">First Name *</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={parentData.first_name}
                                            onChange={(e) => setParentData({ ...parentData, first_name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Last Name *</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={parentData.last_name}
                                            onChange={(e) => setParentData({ ...parentData, last_name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Email *</label>
                                        <input
                                            type="email"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={parentData.email}
                                            onChange={(e) => setParentData({ ...parentData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Date of Birth</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={parentData.date_of_birth}
                                            onChange={(e) => setParentData({ ...parentData, date_of_birth: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1">Address</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={parentData.address}
                                            onChange={(e) => setParentData({ ...parentData, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">Select Tuition Tier</h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Choose a tuition tier for {students.length} student{students.length > 1 ? 's' : ''}
                        </div>
                        {!schoolTuitionTiers || schoolTuitionTiers.length === 0 ? (
                            <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-gray-500 dark:text-gray-400">
                                No tuition tiers available. Please contact administration.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {schoolTuitionTiers.map((tier) => (
                                    <div
                                        key={tier.id}
                                        onClick={() => setTuitionData({ ...tuitionData, tuition_tier_id: tier.id.toString(), quantity: students.length })}
                                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                            tuitionData.tuition_tier_id === tier.id.toString()
                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500'
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
                                                                <span className="mr-2">✓</span>
                                                                {feature}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                            <div className="ml-4 text-right">
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
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Quantity (Students)</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={tuitionData.quantity}
                                    onChange={(e) => setTuitionData({ ...tuitionData, quantity: parseInt(e.target.value) || 1 })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Start Date *</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={tuitionData.start_date}
                                    onChange={(e) => setTuitionData({ ...tuitionData, start_date: e.target.value })}
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="create_invoice"
                                checked={tuitionData.create_invoice}
                                onChange={(e) => setTuitionData({ ...tuitionData, create_invoice: e.target.checked })}
                                className="rounded"
                            />
                            <label htmlFor="create_invoice" className="text-sm">Create invoice for tuition</label>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">Review & Send Invoice</h3>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Students</div>
                                {students.map((student, idx) => (
                                    <div key={idx} className="font-medium">
                                        {idx + 1}. {student.first_name} {student.last_name}
                                        {student.email && ` - ${student.email}`}
                                    </div>
                                ))}
                            </div>
                            
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Parent/Guardian</div>
                                {parentData.selection_type === 'existing_parent' && parentData.parent_id && (() => {
                                    const selectedParent = parents.find(p => p.id.toString() === parentData.parent_id);
                                    return selectedParent ? (
                                        <div className="font-medium">
                                            {selectedParent.first_name} {selectedParent.last_name} - {selectedParent.email}
                                        </div>
                                    ) : null;
                                })()}
                                {parentData.selection_type === 'existing_member' && parentData.member_id && (() => {
                                    const selectedMember = members.find(m => m.id.toString() === parentData.member_id);
                                    return selectedMember ? (
                                        <div className="font-medium">
                                            {selectedMember.first_name} {selectedMember.last_name} - {selectedMember.email}
                                            <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">(Member → Parent)</span>
                                        </div>
                                    ) : null;
                                })()}
                                {parentData.selection_type === 'new_parent' && (
                                    <div className="font-medium">
                                        {parentData.first_name} {parentData.last_name} - {parentData.email}
                                        <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">(New)</span>
                                    </div>
                                )}
                            </div>
                            
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Tuition</div>
                                {tuitionData.tuition_tier_id && (() => {
                                    const selectedTier = schoolTuitionTiers.find(t => t.id.toString() === tuitionData.tuition_tier_id);
                                    return selectedTier ? (
                                        <>
                                            <div className="font-medium">{selectedTier.name}</div>
                                            <div className="text-sm">Start Date: {tuitionData.start_date}</div>
                                            <div className="text-sm capitalize">
                                                {selectedTier.billing_period} - {formatCurrency(parseFloat(selectedTier.price), currency)} × {tuitionData.quantity} student{tuitionData.quantity > 1 ? 's' : ''}
                                            </div>
                                        </>
                                    ) : null;
                                })()}
                            </div>
                            
                            {tuitionData.create_invoice && tuitionData.tuition_tier_id && (() => {
                                const selectedTier = schoolTuitionTiers.find(t => t.id.toString() === tuitionData.tuition_tier_id);
                                return selectedTier ? (
                                    <div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Invoice Amount</div>
                                        <div className="font-medium text-lg">
                                            {formatCurrency(parseFloat(selectedTier.price) * tuitionData.quantity, currency)}
                                        </div>
                                    </div>
                                ) : null;
                            })()}
                        </div>
                        
                        {tuitionData.create_invoice && (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="email_invoice"
                                    checked={tuitionData.email_invoice}
                                    onChange={(e) => setTuitionData({ ...tuitionData, email_invoice: e.target.checked })}
                                    className="rounded"
                                />
                                <label htmlFor="email_invoice" className="text-sm">Email invoice to parent</label>
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
                    Back
                </Button>
                {step < 4 ? (
                    <Button onClick={handleNext}>
                        Next
                    </Button>
                ) : (
                    <Button onClick={handleSubmit}>
                        Complete Onboarding
                    </Button>
                )}
            </div>
        </div>
    );
}