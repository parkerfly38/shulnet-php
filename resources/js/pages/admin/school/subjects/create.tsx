import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import subjects from '@/routes/admin/school/subjects';
import { FormEventHandler } from 'react';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Subjects', href: '/admin/school/subjects' },
    { title: 'Create', href: '/admin/school/subjects/create' },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        subject_code: '',
        books: '',
        class_id: '',
        teacher_id: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/api/admin/subjects');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Subject" />

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold leading-tight text-gray-800">
                    Create Subject
                </h2>
                <Link href={subjects.index.url()}>
                    <Button variant="outline">Back to List</Button>
                </Link>
            </div>

            <div className="">
                <div className="">
                    <Card>
                        <CardHeader>
                            <CardTitle>Subject Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <Label htmlFor="name">Subject Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="subject_code">Subject Code</Label>
                                    <Input
                                        id="subject_code"
                                        type="text"
                                        value={data.subject_code}
                                        onChange={(e) => setData('subject_code', e.target.value)}
                                        className="mt-1"
                                    />
                                    {errors.subject_code && (
                                        <p className="mt-1 text-sm text-red-600">{errors.subject_code}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="class_id">Class ID</Label>
                                    <Input
                                        id="class_id"
                                        type="number"
                                        value={data.class_id}
                                        onChange={(e) => setData('class_id', e.target.value)}
                                        className="mt-1"
                                    />
                                    {errors.class_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.class_id}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="teacher_id">Teacher ID</Label>
                                    <Input
                                        id="teacher_id"
                                        type="number"
                                        value={data.teacher_id}
                                        onChange={(e) => setData('teacher_id', e.target.value)}
                                        className="mt-1"
                                    />
                                    {errors.teacher_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.teacher_id}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="books">Books</Label>
                                    <Textarea
                                        id="books"
                                        value={data.books}
                                        onChange={(e) => setData('books', e.target.value)}
                                        className="mt-1"
                                        rows={3}
                                    />
                                    {errors.books && (
                                        <p className="mt-1 text-sm text-red-600">{errors.books}</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Link href={subjects.index.url()}>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        Create Subject
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
