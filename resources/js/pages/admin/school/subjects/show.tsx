import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import subjects from '@/routes/admin/school/subjects';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Subjects', href: '/admin/school/subjects' },
];

interface Subject {
    id: number;
    name: string;
    subject_code: string;
    books: string | null;
    class_id: number | null;
    teacher_id: number | null;
    created_at: string;
    updated_at: string;
}

interface ShowProps {
    item: Subject;
}

export default function Show({ item }: Readonly<ShowProps>) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Subject: ${item.name}`} />

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold leading-tight text-gray-800">
                    Subject Details
                </h2>
                <div className="flex gap-2">
                    <Link href={subjects.index.url()}>
                        <Button variant="outline">Back to List</Button>
                    </Link>
                    <Link href={subjects.edit.url(item.id)}>
                        <Button>Edit</Button>
                    </Link>
                </div>
            </div>

            <div className="">
                <div className="">
                    <Card>
                        <CardHeader>
                            <CardTitle>{item.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-gray-700">Subject Code</div>
                                    <p className="mt-1 text-sm text-gray-900">{item.subject_code || 'N/A'}</p>
                                </div>

                                <div>
                                    <div className="text-sm font-medium text-gray-700">Class ID</div>
                                    <p className="mt-1 text-sm text-gray-900">{item.class_id || 'N/A'}</p>
                                </div>

                                <div>
                                    <div className="text-sm font-medium text-gray-700">Teacher ID</div>
                                    <p className="mt-1 text-sm text-gray-900">{item.teacher_id || 'N/A'}</p>
                                </div>

                                <div className="md:col-span-2">
                                    <div className="text-sm font-medium text-gray-700">Books</div>
                                    <p className="mt-1 text-sm text-gray-900">{item.books || 'N/A'}</p>
                                </div>

                                <div>
                                    <div className="text-sm font-medium text-gray-700">Created At</div>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </p>
                                </div>

                                <div>
                                    <div className="text-sm font-medium text-gray-700">Updated At</div>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {new Date(item.updated_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
