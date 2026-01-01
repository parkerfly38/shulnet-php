import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'School Management', href: '/admin/school' },
    { title: 'Attendance', href: '/admin/school/attendance' },
];

interface Attendance {
    id: number;
    student: {
        id: number;
        first_name: string;
        last_name: string;
    };
    class_definition?: {
        id: number;
        class_name: string;
    };
    attendance_date: string;
    status: 'present' | 'absent' | 'tardy' | 'excused';
    notes?: string;
}

export default function AttendanceIndex() {
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterStatus, setFilterStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const fetchAttendances = async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page) });
            if (searchDate) params.append('date', searchDate);
            if (filterStatus) params.append('status', filterStatus);

            const response = await fetch(`/api/admin/attendances?${params}`);
            const data = await response.json();
            setAttendances(data.data);
            setCurrentPage(data.current_page);
            setLastPage(data.last_page);
        } catch (error) {
            console.error('Failed to fetch attendances:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendances();
    }, [searchDate, filterStatus]);

    const getStatusBadgeClass = (status: string) => {
        const baseClasses = 'px-2 py-1 rounded text-xs font-medium';
        switch (status) {
            case 'present':
                return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
            case 'absent':
                return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
            case 'tardy':
                return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
            case 'excused':
                return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attendance" />
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Student Attendance</h1>
                    <Link href="/admin/school/attendance/mark">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Mark Attendance
                        </Button>
                    </Link>
                </div>

                <div className="mb-4 flex gap-4 items-end bg-white dark:bg-black p-4 rounded border">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Date</label>
                        <input
                            type="date"
                            value={searchDate}
                            onChange={(e) => setSearchDate(e.target.value)}
                            className="w-full rounded border p-2"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full rounded border p-2"
                        >
                            <option value="">All Statuses</option>
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="tardy">Tardy</option>
                            <option value="excused">Excused</option>
                        </select>
                    </div>
                    <Button onClick={() => fetchAttendances()}>
                        <Search className="w-4 h-4 mr-2" />
                        Search
                    </Button>
                </div>

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        <div className="bg-white dark:bg-black rounded border overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Date</th>
                                        <th className="px-4 py-2 text-left">Student</th>
                                        <th className="px-4 py-2 text-left">Class</th>
                                        <th className="px-4 py-2 text-left">Status</th>
                                        <th className="px-4 py-2 text-left">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendances.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                                No attendance records found
                                            </td>
                                        </tr>
                                    ) : (
                                        attendances.map((attendance) => (
                                            <tr key={attendance.id} className="border-t">
                                                <td className="px-4 py-2">
                                                    {new Date(attendance.attendance_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <Link 
                                                        href={`/admin/school/students/${attendance.student.id}`}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {attendance.student.first_name} {attendance.student.last_name}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-2">
                                                    {attendance.class_definition?.class_name || '—'}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <span className={getStatusBadgeClass(attendance.status)}>
                                                        {attendance.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-600">
                                                    {attendance.notes || '—'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {lastPage > 1 && (
                            <div className="mt-4 flex justify-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => fetchAttendances(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <span className="px-4 py-2">
                                    Page {currentPage} of {lastPage}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => fetchAttendances(currentPage + 1)}
                                    disabled={currentPage === lastPage}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
