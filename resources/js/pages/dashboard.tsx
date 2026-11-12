import { useTranslation } from '@/hooks/use-translation';
import { CongregationHeader } from '@/components/congregation-header';
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
    const { t } = useTranslation();
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Dashboard')} />

            <div className="p-4 space-y-6">
                <CongregationHeader title={t('Welcome, :name!', { name: user.name })} />

                <div className="bg-white dark:bg-black rounded-lg p-8 border text-center">
                    <h2 className="text-xl font-semibold mb-4">{t('Getting Started')}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {t('Your account has been created successfully. Please contact the administrator to complete your profile setup.')}
                    </p>
                    <div className="text-sm text-gray-500">
                        Logged in as: {user.email}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
