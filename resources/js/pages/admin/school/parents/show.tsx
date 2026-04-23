import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';

const breadcrumbsBase: BreadcrumbItem[] = [
    { title: 'School Management', href: '/admin/school' },
    { title: 'Parents', href: '/admin/school/parents' },
];

export default function ParentsShow() {
    const { props } = usePage();
    const pageProps: any = props;
    const data = pageProps.item ?? {};

    const breadcrumbs: BreadcrumbItem[] = [...breadcrumbsBase, { title: `${data.first_name} ${data.last_name}` || 'Show', href: `/admin/school/parents/${data.id}` }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Parent: ${data.first_name} ${data.last_name}` ?? ''} />
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">{data.first_name} {data.last_name}</h1>
                    <div className="flex gap-2">
                        <Link href="/admin/school/parents" className="px-3 py-1 border rounded">Back</Link>
                        <Link href={`/admin/school/parents/${data.id}/edit`} className="px-3 py-1 bg-yellow-500 text-white rounded">Edit</Link>
                    </div>
                </div>

                <div className="bg-white dark:bg-black p-4 rounded border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><strong>First Name:</strong> {data.first_name}</div>
                        <div><strong>Last Name:</strong> {data.last_name}</div>
                        <div><strong>Email:</strong> {data.email}</div>
                        <div><strong>Date of Birth:</strong> {data.date_of_birth}</div>
                        <div className="col-span-1 md:col-span-2"><strong>Address:</strong> {data.address}</div>
                        {data.picture_url && (
                            <div className="col-span-1 md:col-span-2">
                                <strong>Picture:</strong>
                                <img src={data.picture_url} alt={`${data.first_name} ${data.last_name}`} className="mt-2 w-32 h-32 object-cover rounded" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Students Section */}
                <div className="mt-6">
                    <h2 className="text-xl font-bold mb-4">Students</h2>
                    <div className="bg-white dark:bg-black p-4 rounded border">
                        {data.students && data.students.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {data.students.map((student: any) => (
                                    <Link
                                        key={student.id}
                                        href={`/admin/school/students/${student.id}`}
                                        className="p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="font-semibold">
                                            {student.first_name} {student.middle_name} {student.last_name}
                                        </div>
                                        {student.gender && (
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Gender: {student.gender}</div>
                                        )}
                                        {student.date_of_birth && (
                                            <div className="text-sm text-gray-600 dark:text-gray-400">DOB: {student.date_of_birth}</div>
                                        )}
                                        {student.email && (
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{student.email}</div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                                No students assigned to this parent
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
