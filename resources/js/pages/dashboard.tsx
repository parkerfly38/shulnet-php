import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type HebrewDate, type Yahrzeit, type Event } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Calendar, CalendarDays, MapPin, Globe, DollarSign, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
}

export default function Dashboard({ membersJoinedData, currentYear, currentHebrewDate, currentMonthYahrzeits, upcomingEvents, openInvoices, invoiceAging }: DashboardProps) {
    const { auth } = usePage().props as any;
    const user = auth.user;

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
                    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
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

                {/* Members Joined Chart */}
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
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

                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {/* Current Hebrew Month Yahrzeits */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-4 overflow-hidden flex flex-col">
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
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-4 overflow-hidden flex flex-col">
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
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-4 overflow-hidden flex flex-col">
                        <div className="mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                <DollarSign className="h-4 w-4 mr-2" />
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
                                                        ${data.total.toFixed(2)}
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
                                                            ${parseFloat(invoice.total).toFixed(2)}
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
