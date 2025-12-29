import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';

const breadcrumbsBase: BreadcrumbItem[] = [
    { title: 'School Management', href: '/admin/school' },
    { title: 'Teachers', href: '/admin/school/teachers' },
];

export default function TeachersEdit() {
    const { props } = usePage();
    const pageProps: any = props;
    const item = pageProps.item ?? {};

    const breadcrumbs: BreadcrumbItem[] = [...breadcrumbsBase, { title: `${item.first_name} ${item.last_name}` ?? 'Edit', href: `/admin/school/teachers/${item.id}/edit` }];

    const form = useForm({
        title: item.title ?? '',
        first_name: item.first_name ?? '',
        middle_name: item.middle_name ?? '',
        last_name: item.last_name ?? '',
        email: item.email ?? '',
        phone: item.phone ?? '',
        address: item.address ?? '',
        position_title: item.position_title ?? '',
        emploee_code: item.emploee_code ?? '',
        qualifications: item.qualifications ?? '',
        start_date: item.start_date ?? '',
        end_date: item.end_date ?? '',
        picture_url: item.picture_url ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.put(`/api/admin/teachers/${item.id}`, {
            onSuccess: () => window.location.href = `/admin/school/teachers/${item.id}`
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${item.first_name} ${item.last_name}` ?? ''} />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Edit Teacher</h1>
                <form onSubmit={submit} className="space-y-3 bg-white dark:bg-black p-4 rounded border">
                    <div className="flex gap-2">
                        <div className="w-24">
                            <label className="block text-sm font-medium">Title</label>
                            <input value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} className="w-full rounded border p-2" placeholder="Mr./Ms./Dr." />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium">First Name</label>
                            <input value={form.data.first_name} onChange={(e) => form.setData('first_name', e.target.value)} className="w-full rounded border p-2" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium">Middle Name</label>
                            <input value={form.data.middle_name} onChange={(e) => form.setData('middle_name', e.target.value)} className="w-full rounded border p-2" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium">Last Name</label>
                            <input value={form.data.last_name} onChange={(e) => form.setData('last_name', e.target.value)} className="w-full rounded border p-2" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-sm font-medium">Email</label>
                            <input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} className="w-full rounded border p-2" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium">Phone</label>
                            <input type="tel" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} className="w-full rounded border p-2" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Address</label>
                        <textarea value={form.data.address} onChange={(e) => form.setData('address', e.target.value)} className="w-full rounded border p-2" rows={2} />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-sm font-medium">Position Title</label>
                            <input value={form.data.position_title} onChange={(e) => form.setData('position_title', e.target.value)} className="w-full rounded border p-2" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium">Employee Code</label>
                            <input value={form.data.emploee_code} onChange={(e) => form.setData('emploee_code', e.target.value)} className="w-full rounded border p-2" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Qualifications</label>
                        <textarea value={form.data.qualifications} onChange={(e) => form.setData('qualifications', e.target.value)} className="w-full rounded border p-2" rows={3} />
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
                        <label className="block text-sm font-medium">Picture URL</label>
                        <input value={form.data.picture_url} onChange={(e) => form.setData('picture_url', e.target.value)} className="w-full rounded border p-2" />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Link href="/admin/school/teachers">
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={form.processing}>Update Teacher</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
