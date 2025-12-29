import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'School Management', href: '/admin/school' },
    { title: 'Exams', href: '/admin/school/exams' },
    { title: 'Create', href: '/admin/school/exams/create' },
];

export default function ExamsCreate() {
    const form = useForm({
        name: '',
        subject_id: '',
        start_date: '',
        end_date: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/api/admin/exams', {
            onSuccess: () => window.location.href = '/admin/school/exams'
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Exam" />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Create Exam</h1>
                <form onSubmit={submit} className="space-y-3 bg-white dark:bg-black p-4 rounded border">
                    <div>
                        <label className="block text-sm font-medium">Name</label>
                        <input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className="w-full rounded border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Subject ID</label>
                        <input type="number" value={form.data.subject_id} onChange={(e) => form.setData('subject_id', e.target.value)} className="w-full rounded border p-2" />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-sm font-medium">Start Date</label>
                            <input type="date" value={form.data.start_date} onChange={(e) => form.setData('start_date', e.target.value)} className="w-full rounded border p-2" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium">End Date</label>
                            <input type="date" value={form.data.end_date} onChange={(e) => form.setData('end_date', e.target.value)} className="w-full rounded border p-2" />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Link href="/admin/school/exams">
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={form.processing}>Create Exam</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
