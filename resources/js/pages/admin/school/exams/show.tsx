import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';

const breadcrumbsBase: BreadcrumbItem[] = [
    { title: 'School Management', href: '/admin/school' },
    { title: 'Exams', href: '/admin/school/exams' },
];

export default function ExamsShow() {
    const { props } = usePage();
    const pageProps: any = props;
    const data = pageProps.item ?? {};

    const breadcrumbs: BreadcrumbItem[] = [...breadcrumbsBase, { title: data.name || 'Show', href: `/admin/school/exams/${data.id}` }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Exam: ${data.name ?? ''}`} />
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">{data.name}</h1>
                    <div className="flex gap-2">
                        <Link href="/admin/school/exams" className="px-3 py-1 border rounded">Back</Link>
                        <Link href={`/admin/school/exams/${data.id}/edit`} className="px-3 py-1 bg-yellow-500 text-white rounded">Edit</Link>
                    </div>
                </div>

                <div className="bg-white dark:bg-black p-4 rounded border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><strong>Name:</strong> {data.name}</div>
                        <div><strong>Subject:</strong> {data.subject_name ?? data.subject_id}</div>
                        <div><strong>Start Date:</strong> {data.start_date}</div>
                        <div><strong>End Date:</strong> {data.end_date}</div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
