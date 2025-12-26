import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import SchoolCrud from '@/components/school-crud';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'School Management', href: '/admin/school' },
    { title: 'Exams', href: '/admin/school/exams' },
];

export default function ExamsPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Exams" />
            <div className="p-4">
                <SchoolCrud
                    title="Exams"
                    endpoint="/api/admin/exams"
                    fields={[
                        { name: 'name', label: 'Name', type: 'text' },
                        { name: 'date', label: 'Date', type: 'date' },
                        { name: 'description', label: 'Description', type: 'textarea' },
                    ]}
                />
            </div>
        </AppLayout>
    );
}
