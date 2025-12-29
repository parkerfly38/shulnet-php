import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';

const breadcrumbsBase: BreadcrumbItem[] = [
    { title: 'School Management', href: '/admin/school' },
    { title: 'Parents', href: '/admin/school/parents' },
];

export default function ParentsEdit() {
    const { props } = usePage();
    const pageProps: any = props;
    const item = pageProps.item ?? {};

    const breadcrumbs: BreadcrumbItem[] = [...breadcrumbsBase, { title: `${item.first_name} ${item.last_name}` ?? 'Edit', href: `/admin/school/parents/${item.id}/edit` }];

    const form = useForm({
        first_name: item.first_name ?? '',
        last_name: item.last_name ?? '',
        email: item.email ?? '',
        date_of_birth: item.date_of_birth ?? '',
        address: item.address ?? '',
        picture_url: item.picture_url ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.put(`/api/admin/parents/${item.id}`, {
            onSuccess: () => window.location.href = `/admin/school/parents/${item.id}`
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${item.first_name} ${item.last_name}` ?? ''} />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Edit Parent</h1>
                <form onSubmit={submit} className="space-y-3 bg-white dark:bg-black p-4 rounded border">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-sm font-medium">First Name</label>
                            <input value={form.data.first_name} onChange={(e) => form.setData('first_name', e.target.value)} className="w-full rounded border p-2" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium">Last Name</label>
                            <input value={form.data.last_name} onChange={(e) => form.setData('last_name', e.target.value)} className="w-full rounded border p-2" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} className="w-full rounded border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Date of Birth</label>
                        <input type="date" value={form.data.date_of_birth} onChange={(e) => form.setData('date_of_birth', e.target.value)} className="w-full rounded border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Address</label>
                        <textarea value={form.data.address} onChange={(e) => form.setData('address', e.target.value)} className="w-full rounded border p-2" rows={3} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Picture URL</label>
                        <input value={form.data.picture_url} onChange={(e) => form.setData('picture_url', e.target.value)} className="w-full rounded border p-2" />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Link href="/admin/school/parents">
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={form.processing}>Update Parent</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
