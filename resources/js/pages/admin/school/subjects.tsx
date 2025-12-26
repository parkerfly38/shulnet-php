import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import SchoolCrud from '@/components/school-crud';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'School Management', href: '/admin/school' },
    { title: 'Subjects', href: '/admin/school/subjects' },
];

export default function SubjectsPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subjects" />
            <div className="p-4">
                <SchoolCrud
                    title="Subjects"
                    endpoint="/api/admin/subjects"
                    fields={[
                        { name: 'name', label: 'Name', type: 'text' },
                        { name: 'description', label: 'Description', type: 'textarea' },
                        { name: 'class_id', label: 'Class', type: 'select', optionsEndpoint: '/api/admin/class-definitions' },
                        { name: 'teacher_id', label: 'Teacher', type: 'select', optionsEndpoint: '/api/admin/teachers' },
                    ]}
                />
            </div>
        </AppLayout>
    );
}
