import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { BannerDisplay } from '@/components/banner-display';
import { AdminChatWidget } from '@/components/admin-chat-widget';
import { type BreadcrumbItem, type Banner, type SharedData } from '@/types';
import { usePage, router } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import axios from 'axios';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { dashboardBanners } = usePage().props as any;
    const banners = (dashboardBanners || []) as Banner[];

    const handleBannerDismiss = async (bannerId: number) => {
        try {
            await axios.post(`/api/member/banners/${bannerId}/dismissed`);
            router.reload({ only: ['dashboardBanners'] });
        } catch (error) {
            console.error('Failed to dismiss banner:', error);
        }
    };

    const handleBannerView = async (bannerId: number) => {
        try {
            await axios.post(`/api/member/banners/${bannerId}/viewed`);
        } catch (error) {
            console.error('Failed to mark banner as viewed:', error);
        }
    };

    const handleBannerClick = async (bannerId: number) => {
        try {
            await axios.post(`/api/member/banners/${bannerId}/clicked`);
        } catch (error) {
            console.error('Failed to mark banner as clicked:', error);
        }
    };
    const { auth } = usePage<SharedData>().props;
    const isAdmin = Array.isArray(auth?.user?.roles) && auth.user.roles.includes('admin');

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {banners.length > 0 && (
                    <div className="px-4 pt-2">
                        <BannerDisplay 
                            banners={banners}
                            onDismiss={handleBannerDismiss}
                            onView={handleBannerView}
                            onClick={handleBannerClick}
                        />
                    </div>
                )}
                {children}
            </AppContent>
            {isAdmin && <AdminChatWidget />}
        </AppShell>
    );
}