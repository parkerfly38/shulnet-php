import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import SchoolCrud from '@/components/school-crud';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'School Management', href: '/admin/school' },
    { title: 'Classes', href: '/admin/school/class-definitions' },
];

export default function ClassDefinitionsPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Classes" />
            <div className="p-4">
                <SchoolCrud
                    title="Classes"
                    endpoint="/api/admin/class-definitions"
                    fields={[
                        { name: 'name', label: 'Name', type: 'text' },
                        { name: 'class_number', label: 'Class #', type: 'text' },
                        { name: 'description', label: 'Description', type: 'textarea' },
                        { name: 'teacher_id', label: 'Teacher', type: 'select', optionsEndpoint: '/api/admin/teachers' },
                        { name: 'capacity', label: 'Capacity', type: 'number' },
                        { name: 'start_date', label: 'Start Date', type: 'date' },
                        { name: 'end_date', label: 'End Date', type: 'date' },
                        { name: 'location', label: 'Location', type: 'text' },
                        { name: 'fee', label: 'Fee', type: 'number' },
                    ]}
                    listColumns={[
                        { key: 'name', label: 'Name' },
                        { key: 'class_number', label: 'Class #' },
                        { key: 'teacher_name', label: 'Teacher' },
                        { key: 'capacity', label: 'Capacity' },
                        { key: 'start_date', label: 'Start' },
                        { key: 'end_date', label: 'End' },
                    ]}
                />
            </div>
        </AppLayout>
    );
}
