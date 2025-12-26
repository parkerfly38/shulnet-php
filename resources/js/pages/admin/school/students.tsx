import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import SchoolCrud from '@/components/school-crud';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'School Management', href: '/admin/school' },
    { title: 'Students', href: '/admin/school/students' },
];

export default function StudentsPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Students" />
            <div className="p-4">
                <SchoolCrud
                    title="Students"
                    endpoint="/api/admin/students"
                    fields={[
                        { name: 'first_name', label: 'First Name', type: 'text' },
                        { name: 'last_name', label: 'Last Name', type: 'text' },
                        { name: 'dob', label: 'Date of Birth', type: 'date' },
                        { name: 'parent_id', label: 'Parent', type: 'select', optionsEndpoint: '/api/admin/parents' },
                        { name: 'email', label: 'Email', type: 'text' },
                        { name: 'phone', label: 'Phone', type: 'text' },
                    ]}
                />
            </div>
        </AppLayout>
    );
}
