import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import SchoolCrud from '@/components/school-crud';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'School Management', href: '/admin/school' },
    { title: 'Class Grades', href: '/admin/school/class-grades' },
];

export default function ClassGradesPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Class Grades" />
            <div className="p-4">
                <SchoolCrud
                    title="Class Grades"
                    endpoint="/api/admin/class-grades"
                    fields={[
                        { name: 'class_definition_id', label: 'Class', type: 'select', optionsEndpoint: '/api/admin/class-definitions' },
                        { name: 'student_id', label: 'Student', type: 'select', optionsEndpoint: '/api/admin/students' },
                        { name: 'grade', label: 'Grade', type: 'text' },
                    ]}
                />
            </div>
        </AppLayout>
    );
}
