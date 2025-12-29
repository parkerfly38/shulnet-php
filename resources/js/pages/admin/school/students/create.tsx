import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'School Management', href: '/admin/school' },
    { title: 'Students', href: '/admin/school/students' },
    { title: 'Create', href: '/admin/school/students/create' },
];

export default function StudentsCreate() {
    const form = useForm({
        first_name: '',
        middle_name: '',
        last_name: '',
        gender: '',
        date_of_birth: '',
        email: '',
        is_parent_email: false,
        parent_id: '',
        address: '',
        picture_url: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/api/admin/students', {
            onSuccess: () => window.location.href = '/admin/school/students'
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Student" />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Create Student</h1>
                <form onSubmit={submit} className="space-y-3 bg-white dark:bg-black p-4 rounded border">
                    <div className="flex gap-2">
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
                            <label className="block text-sm font-medium">Gender</label>
                            <select value={form.data.gender} onChange={(e) => form.setData('gender', e.target.value)} className="w-full rounded border p-2">
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium">Date of Birth</label>
                            <input type="date" value={form.data.date_of_birth} onChange={(e) => form.setData('date_of_birth', e.target.value)} className="w-full rounded border p-2" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} className="w-full rounded border p-2" />
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked={form.data.is_parent_email} onChange={(e) => form.setData('is_parent_email', e.target.checked)} className="rounded" />
                        <label className="text-sm font-medium">Is Parent Email</label>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Parent ID</label>
                        <input type="number" value={form.data.parent_id} onChange={(e) => form.setData('parent_id', e.target.value)} className="w-full rounded border p-2" />
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
                        <Link href="/admin/school/students">
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={form.processing}>Create Student</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
