import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

interface User {
    name: string;
    email: string;
}

interface Props {
    user: User;
}

export default function Dashboard({ user }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
                </div>

                <div className="bg-white dark:bg-black rounded-lg p-8 border text-center">
                    <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Your account has been created successfully. Please contact the administrator to complete your profile setup.
                    </p>
                    <div className="text-sm text-gray-500">
                        Logged in as: {user.email}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
