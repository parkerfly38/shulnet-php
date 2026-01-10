import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Member Portal', href: '/member/dashboard' },
];

interface Invoice {
    id: number;
    invoice_number: string;
    description: string;
    total_amount: number;
    status: string;
    due_date: string;
    created_at: string;
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    classes: Array<{
        id: number;
        class_name: string;
        teacher_name: string;
        grade: string | null;
    }>;
}

interface Yahrzeit {
    id: number;
    name: string;
    hebrew_name: string;
    relationship: string;
    date_of_death: string;
    occurrence_date: string;
}

interface Assignment {
    id: number;
    date: string;
    honor: string;
}

interface Event {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
}

interface Member {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface Props {
    member: Member;
    invoices: Invoice[];
    students: Student[];
    yahrzeits: Yahrzeit[];
    assignments: Assignment[];
    events: Event[];
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function MemberDashboard({ member, invoices, students, yahrzeits, assignments, events }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Member Portal" />

            <div className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Welcome, {member.first_name}!</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Invoices */}
                    <div className="bg-white dark:bg-black rounded-lg p-6 border">
                        <h2 className="text-lg font-semibold mb-4">My Invoices</h2>
                        {invoices.length === 0 ? (
                            <p className="text-sm text-gray-500">No invoices found.</p>
                        ) : (
                            <div className="space-y-3">
                                {invoices.map((invoice) => (
                                    <Link 
                                        key={invoice.id} 
                                        href={`/member/invoices/${invoice.id}`}
                                        className="block p-3 bg-gray-50 dark:bg-gray-900 rounded border hover:border-blue-500 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="font-medium">#{invoice.invoice_number}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">{invoice.description}</div>
                                                <div className="text-xs text-gray-500 mt-1">Due: {formatDate(invoice.due_date)}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium">{formatCurrency(invoice.total_amount)}</div>
                                                <div className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                                                    invoice.status === 'paid' 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                        : invoice.status === 'open'
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                        : invoice.status === 'overdue'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                }`}>
                                                    {invoice.status}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upcoming Aliyah Assignments */}
                    <div className="bg-white dark:bg-black rounded-lg p-6 border">
                        <h2 className="text-lg font-semibold mb-4">My Upcoming Aliyah Assignments</h2>
                        {assignments.length === 0 ? (
                            <p className="text-sm text-gray-500">No upcoming assignments.</p>
                        ) : (
                            <div className="space-y-3">
                                {assignments.map((assignment) => (
                                    <div key={assignment.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded border">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">
                                                    {assignment.honor === 'M' ? 'Maftir' : `Aliyah ${assignment.honor}`}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {formatDate(assignment.date)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Students (if parent) */}
                    {students.length > 0 && (
                        <div className="bg-white dark:bg-black rounded-lg p-6 border lg:col-span-2">
                            <h2 className="text-lg font-semibold mb-4">My Children</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {students.map((student) => (
                                    <div key={student.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded border">
                                        <div className="font-medium text-lg mb-2">
                                            {student.first_name} {student.last_name}
                                        </div>
                                        {student.email && (
                                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                {student.email}
                                            </div>
                                        )}
                                        {student.classes.length > 0 && (
                                            <div>
                                                <div className="text-sm font-semibold mb-2">Classes:</div>
                                                <div className="space-y-2">
                                                    {student.classes.map((cls) => (
                                                        <div key={cls.id} className="text-sm">
                                                            <div className="font-medium">{cls.class_name}</div>
                                                            <div className="text-xs text-gray-500">
                                                                Teacher: {cls.teacher_name}
                                                                {cls.grade && ` • Grade: ${cls.grade}`}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upcoming Yahrzeits */}
                    <div className="bg-white dark:bg-black rounded-lg p-6 border">
                        <h2 className="text-lg font-semibold mb-4">Upcoming Yahrzeits</h2>
                        {yahrzeits.length === 0 ? (
                            <p className="text-sm text-gray-500">No upcoming yahrzeits in the next 60 days.</p>
                        ) : (
                            <div className="space-y-3">
                                {yahrzeits.map((yahrzeit) => (
                                    <div key={yahrzeit.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded border">
                                        <div className="font-medium">{yahrzeit.name}</div>
                                        {yahrzeit.hebrew_name && (
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{yahrzeit.hebrew_name}</div>
                                        )}
                                        <div className="text-xs text-gray-500 mt-1">
                                            {yahrzeit.relationship} • {formatDate(yahrzeit.occurrence_date)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upcoming Events */}
                    <div className="bg-white dark:bg-black rounded-lg p-6 border">
                        <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
                        {events.length === 0 ? (
                            <p className="text-sm text-gray-500">No upcoming events.</p>
                        ) : (
                            <div className="space-y-3">
                                {events.map((event) => (
                                    <div key={event.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded border">
                                        <div className="font-medium">{event.title}</div>
                                        {event.description && (
                                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {event.description.substring(0, 100)}
                                                {event.description.length > 100 && '...'}
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-500 mt-2 space-y-1">
                                            <div>📅 {formatDate(event.start_date)}</div>
                                            {event.location && <div>📍 {event.location}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
