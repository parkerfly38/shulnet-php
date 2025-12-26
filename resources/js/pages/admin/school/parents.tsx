import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import SchoolCrud from '@/components/school-crud';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'School Management', href: '/admin/school' },
    { title: 'Parents', href: '/admin/school/parents' },
];

export default function ParentsPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Parents" />
            <div className="p-4">
                <SchoolCrud
                    title="Parents"
                    endpoint="/api/admin/parents"
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
