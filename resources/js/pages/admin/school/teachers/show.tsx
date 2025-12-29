import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';

const breadcrumbsBase: BreadcrumbItem[] = [
    { title: 'School Management', href: '/admin/school' },
    { title: 'Teachers', href: '/admin/school/teachers' },
];

export default function TeachersShow() {
    const { props } = usePage();
    const pageProps: any = props;
    const data = pageProps.item ?? {};

    const breadcrumbs: BreadcrumbItem[] = [...breadcrumbsBase, { title: `${data.first_name} ${data.last_name}` || 'Show', href: `/admin/school/teachers/${data.id}` }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Teacher: ${data.first_name} ${data.last_name}` ?? ''} />
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">{data.title} {data.first_name} {data.last_name}</h1>
                    <div className="flex gap-2">
                        <Link href="/admin/school/teachers" className="px-3 py-1 border rounded">Back</Link>
                        <Link href={`/admin/school/teachers/${data.id}/edit`} className="px-3 py-1 bg-yellow-500 text-white rounded">Edit</Link>
                    </div>
                </div>

                <div className="bg-white dark:bg-black p-4 rounded border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><strong>Title:</strong> {data.title}</div>
                        <div><strong>First Name:</strong> {data.first_name}</div>
                        <div><strong>Middle Name:</strong> {data.middle_name}</div>
                        <div><strong>Last Name:</strong> {data.last_name}</div>
                        <div><strong>Email:</strong> {data.email}</div>
                        <div><strong>Phone:</strong> {data.phone}</div>
                        <div><strong>Position:</strong> {data.position_title}</div>
                        <div><strong>Employee Code:</strong> {data.emploee_code}</div>
                        <div><strong>Start Date:</strong> {data.start_date}</div>
                        <div><strong>End Date:</strong> {data.end_date}</div>
                        <div className="col-span-1 md:col-span-2"><strong>Address:</strong> {data.address}</div>
                        <div className="col-span-1 md:col-span-2"><strong>Qualifications:</strong>
                            <div className="mt-2 text-sm text-gray-700">{data.qualifications}</div>
                        </div>
                        {data.picture_url && (
                            <div className="col-span-1 md:col-span-2">
                                <strong>Picture:</strong>
                                <img src={data.picture_url} alt={`${data.first_name} ${data.last_name}`} className="mt-2 w-32 h-32 object-cover rounded" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
