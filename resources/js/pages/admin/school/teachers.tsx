import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import SchoolCrud from '@/components/school-crud';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'School Management', href: '/admin/school' },
    { title: 'Teachers', href: '/admin/school/teachers' },
];

export default function TeachersPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Teachers" />
            <div className="p-4">
                <SchoolCrud
                    title="Teachers"
                    endpoint="/api/admin/teachers"
                    fields={[
                        { name: 'first_name', label: 'First Name', type: 'text' },
                        { name: 'last_name', label: 'Last Name', type: 'text' },
                        { name: 'email', label: 'Email', type: 'text' },
                        { name: 'phone', label: 'Phone', type: 'text' },
                    ]}
                />
            </div>
        </AppLayout>
    );
}
