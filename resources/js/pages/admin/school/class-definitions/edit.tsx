import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';

const breadcrumbsBase: BreadcrumbItem[] = [
    { title: 'School Management', href: '/admin/school' },
    { title: 'Classes', href: '/admin/school/class-definitions' },
];

export default function ClassDefinitionsEdit() {
    const { props } = usePage();
    const pageProps: any = props;
    const item = pageProps.item ?? {};

    const breadcrumbs: BreadcrumbItem[] = [...breadcrumbsBase, { title: item.name ?? 'Edit', href: `/admin/school/class-definitions/${item.id}/edit` }];

    const form = useForm({
        name: item.name ?? '',
        class_number: item.class_number ?? '',
        description: item.description ?? '',
        teacher_id: item.teacher_id ?? '',
        capacity: item.capacity ?? '',
        start_date: item.start_date ?? '',
        end_date: item.end_date ?? '',
        location: item.location ?? '',
        fee: item.fee ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.put(`/api/admin/class-definitions/${item.id}`, {
            onSuccess: () => window.location.href = `/admin/school/class-definitions/${item.id}`
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${item.name ?? ''}`} />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Edit Class Definition</h1>
                <form onSubmit={submit} className="space-y-3 bg-white dark:bg-black p-4 rounded border">
                    <div>
                        <label className="block text-sm font-medium">Name</label>
                        <input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className="w-full rounded border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Class #</label>
                        <input value={form.data.class_number} onChange={(e) => form.setData('class_number', e.target.value)} className="w-full rounded border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Description</label>
                        <textarea value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} className="w-full rounded border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Capacity</label>
                        <input type="number" value={form.data.capacity} onChange={(e) => form.setData('capacity', e.target.value)} className="w-full rounded border p-2" />
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
                    <div>
                        <label className="block text-sm font-medium">Location</label>
                        <input value={form.data.location} onChange={(e) => form.setData('location', e.target.value)} className="w-full rounded border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Fee</label>
                        <input type="number" step="0.01" value={form.data.fee} onChange={(e) => form.setData('fee', e.target.value)} className="w-full rounded border p-2" />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Link href={`/admin/school/class-definitions/${item.id}`} className="px-3 py-1 border rounded">Cancel</Link>
                        <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
