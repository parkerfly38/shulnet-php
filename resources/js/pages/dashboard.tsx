import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const { auth } = usePage().props as any;
    const user = auth.user;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* User role indicators */}
                {user?.roles && user.roles.length > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Your Roles</h3>
                        <div className="flex flex-wrap gap-2">
                            {user.roles.map((role: string) => {
                                const roleColors = {
                                    admin: 'bg-red-100 text-red-800',
                                    teacher: 'bg-blue-100 text-blue-800',
                                    parent: 'bg-green-100 text-green-800',
                                    student: 'bg-yellow-100 text-yellow-800',
                                    member: 'bg-gray-100 text-gray-800',
                                };
                                const colorClass = roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800';
                                
                                return (
                                    <span
                                        key={role}
                                        className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${colorClass}`}
                                    >
                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
