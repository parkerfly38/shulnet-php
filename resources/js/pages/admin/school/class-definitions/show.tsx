import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';

const breadcrumbsBase: BreadcrumbItem[] = [
    { title: 'School Management', href: '/admin/school' },
    { title: 'Classes', href: '/admin/school/class-definitions' },
];

export default function ClassDefinitionsShow() {
    const { props } = usePage();
    const pageProps: any = props;
    const data = pageProps.item ?? {};

    const breadcrumbs: BreadcrumbItem[] = [...breadcrumbsBase, { title: data.name || 'Show', href: `/admin/school/class-definitions/${data.id}` }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Class: ${data.name ?? ''}`} />
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">{data.name}</h1>
                    <div className="flex gap-2">
                        <Link href="/admin/school/class-definitions" className="px-3 py-1 border rounded">Back</Link>
                        <Link href={`/admin/school/class-definitions/${data.id}/edit`} className="px-3 py-1 bg-yellow-500 text-white rounded">Edit</Link>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><strong>Class #:</strong> {data.class_number}</div>
                        <div><strong>Teacher:</strong> {data.teacher_name ?? data.teacher_id}</div>
                        <div><strong>Capacity:</strong> {data.capacity}</div>
                        <div><strong>Start:</strong> {data.start_date}</div>
                        <div><strong>End:</strong> {data.end_date}</div>
                        <div><strong>Location:</strong> {data.location}</div>
                        <div><strong>Fee:</strong> {data.fee}</div>
                        <div className="col-span-1 md:col-span-2"><strong>Description:</strong>
                            <div className="mt-2 text-sm text-gray-700">{data.description}</div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
