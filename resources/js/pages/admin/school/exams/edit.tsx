import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';

const breadcrumbsBase: BreadcrumbItem[] = [
    { title: 'School Management', href: '/admin/school' },
    { title: 'Exams', href: '/admin/school/exams' },
];

export default function ExamsEdit() {
    const { props } = usePage();
    const pageProps: any = props;
    const item = pageProps.item ?? {};

    const breadcrumbs: BreadcrumbItem[] = [...breadcrumbsBase, { title: item.name ?? 'Edit', href: `/admin/school/exams/${item.id}/edit` }];

    const form = useForm({
        name: item.name ?? '',
        subject_id: item.subject_id ?? '',
        start_date: item.start_date ?? '',
        end_date: item.end_date ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.put(`/api/admin/exams/${item.id}`, {
            onSuccess: () => window.location.href = `/admin/school/exams/${item.id}`
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${item.name ?? ''}`} />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Edit Exam</h1>
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
                        <Link href={`/admin/school/exams/${item.id}`}>
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={form.processing}>Update Exam</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
