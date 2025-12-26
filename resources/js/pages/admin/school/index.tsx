import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'School Management', href: '/admin/school' },
];

export default function SchoolIndexPage() {
    const items = [
        { title: 'Classes', href: '/admin/school/class-definitions' },
        { title: 'Class Grades', href: '/admin/school/class-grades' },
        { title: 'Exams', href: '/admin/school/exams' },
        { title: 'Exam Grades', href: '/admin/school/exam-grades' },
        { title: 'Parents', href: '/admin/school/parents' },
        { title: 'Students', href: '/admin/school/students' },
        { title: 'Subjects', href: '/admin/school/subjects' },
        { title: 'Subject Grades', href: '/admin/school/subject-grades' },
        { title: 'Teachers', href: '/admin/school/teachers' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="School Management" />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">School Management</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((it) => (
                        <Link key={it.href} href={it.href} className="p-4 border rounded bg-white dark:bg-gray-800">
                            <div className="font-medium">{it.title}</div>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
