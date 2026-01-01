import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'School Management', href: '/admin/school' },
    { title: 'Attendance', href: '/admin/school/attendance' },
    { title: 'Mark Attendance', href: '/admin/school/attendance/mark' },
];

interface Student {
    id: number;
    first_name: string;
    last_name: string;
}

interface ClassDefinition {
    id: number;
    class_name: string;
    teacher?: {
        first_name: string;
        last_name: string;
    };
}

interface Props {
    students: Student[];
    classes: ClassDefinition[];
}

export default function MarkAttendance({ students, classes }: Props) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [classId, setClassId] = useState<number | null>(null);
    const [attendanceData, setAttendanceData] = useState<Record<number, { status: string; notes: string }>>({});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleStatusChange = (studentId: number, status: string) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: {
                status,
                notes: prev[studentId]?.notes || ''
            }
        }));
    };

    const handleNotesChange = (studentId: number, notes: string) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: {
                status: prev[studentId]?.status || 'present',
                notes
            }
        }));
    };

    const markAllPresent = () => {
        const allPresent: Record<number, { status: string; notes: string }> = {};
        students.forEach(student => {
            allPresent[student.id] = {
                status: 'present',
                notes: attendanceData[student.id]?.notes || ''
            };
        });
        setAttendanceData(allPresent);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const attendances = Object.entries(attendanceData).map(([studentId, data]) => ({
                student_id: parseInt(studentId),
                class_definition_id: classId,
                attendance_date: date,
                status: data.status,
                notes: data.notes
            }));

            const token = document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await fetch('/api/admin/attendances', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                },
                body: JSON.stringify({ attendances })
            });

            if (response.ok) {
                setMessage('Attendance saved successfully!');
                setAttendanceData({});
                setTimeout(() => {
                    window.location.href = '/admin/school/attendance';
                }, 1500);
            } else {
                const error = await response.json();
                setMessage('Error: ' + (error.message || 'Failed to save attendance'));
            }
        } catch (error) {
            setMessage('Error: ' + (error as Error).message);
        } finally {
            setSaving(false);
        }
    };

    const getStatusButtonClass = (studentId: number, status: string) => {
        const isSelected = attendanceData[studentId]?.status === status;
        const baseClasses = 'px-2 py-1 rounded text-xs font-medium transition-colors';
        
        if (isSelected) {
            switch (status) {
                case 'present':
                    return `${baseClasses} bg-green-600 text-white`;
                case 'absent':
                    return `${baseClasses} bg-red-600 text-white`;
                case 'tardy':
                    return `${baseClasses} bg-yellow-600 text-white`;
                case 'excused':
                    return `${baseClasses} bg-blue-600 text-white`;
            }
        }
        
        return `${baseClasses} bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mark Attendance" />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Mark Attendance</h1>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4 bg-white dark:bg-black p-4 rounded border space-y-3">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full rounded border p-2"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">Class (Optional)</label>
                                <select
                                    value={classId || ''}
                                    onChange={(e) => setClassId(e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full rounded border p-2"
                                >
                                    <option value="">General Attendance</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.class_name}
                                            {cls.teacher && ` - ${cls.teacher.first_name} ${cls.teacher.last_name}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <Button type="button" variant="outline" onClick={markAllPresent}>
                                <Check className="w-4 h-4 mr-2" />
                                Mark All Present
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-black rounded border overflow-hidden mb-4">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-4 py-2 text-left">Student</th>
                                    <th className="px-4 py-2 text-left">Status</th>
                                    <th className="px-4 py-2 text-left">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student.id} className="border-t">
                                        <td className="px-4 py-2 font-medium">
                                            {student.first_name} {student.last_name}
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    className={getStatusButtonClass(student.id, 'present')}
                                                    onClick={() => handleStatusChange(student.id, 'present')}
                                                >
                                                    Present
                                                </button>
                                                <button
                                                    type="button"
                                                    className={getStatusButtonClass(student.id, 'absent')}
                                                    onClick={() => handleStatusChange(student.id, 'absent')}
                                                >
                                                    Absent
                                                </button>
                                                <button
                                                    type="button"
                                                    className={getStatusButtonClass(student.id, 'tardy')}
                                                    onClick={() => handleStatusChange(student.id, 'tardy')}
                                                >
                                                    Tardy
                                                </button>
                                                <button
                                                    type="button"
                                                    className={getStatusButtonClass(student.id, 'excused')}
                                                    onClick={() => handleStatusChange(student.id, 'excused')}
                                                >
                                                    Excused
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="text"
                                                value={attendanceData[student.id]?.notes || ''}
                                                onChange={(e) => handleNotesChange(student.id, e.target.value)}
                                                placeholder="Optional notes..."
                                                className="w-full rounded border p-1 text-sm"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {message && (
                        <div className={`mb-4 p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {message}
                        </div>
                    )}

                    <div className="flex gap-2 justify-end">
                        <Link href="/admin/school/attendance">
                            <Button type="button" variant="outline">
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={saving || Object.keys(attendanceData).length === 0}>
                            {saving ? 'Saving...' : 'Save Attendance'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
