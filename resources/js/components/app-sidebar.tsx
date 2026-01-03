import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Users, UserPlus, Star, Calendar, CalendarDays, Receipt, MapPin, FileText, Settings, FileSpreadsheet, Award } from 'lucide-react';
import { UserCheck } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const adminNavItems: NavItem[] = [
    {
        groupTitle: 'Shul Administration',
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Members',
        href: '/admin/members',
        icon: UserPlus,
    },
    {
        title: 'Membership Tiers',
        href: '/admin/membership-tiers',
        icon: Award,
    },
    {
        title: 'Invoices',
        href: '/admin/invoices',
        icon: Receipt,
    },
    {
        title: 'Notes',
        href: '/admin/notes',
        icon: BookOpen,
    },
    {
        title: 'Calendars',
        href: '/admin/calendars',
        icon: Calendar,
    },
    {
        title: 'Events',
        href: '/admin/events',
        icon: CalendarDays,
    },
    {
        title: 'Yahrzeits',
        href: '/admin/yahrzeits',
        icon: Star,
    },
    {
        title: 'Gabbai Dashboard',
        href: '/admin/gabbai',
        icon: UserCheck,
    },
];

const cemeteryNavItems: NavItem[] = [
    {
        groupTitle: 'Cemetery Management',
        title: 'Gravesites',
        href: '/admin/gravesites',
        icon: MapPin,
    },
    {
        title: 'Deeds',
        href: '/admin/deeds',
        icon: FileText,
    },
    {
        title: 'Interments',
        href: '/admin/interments',
        icon: Users,
    },
];

const schoolNavItems: NavItem[] = [
    {
        groupTitle: 'School Management',
        title: 'School Dashboard',
        href: '/admin/school',
        icon: LayoutGrid,
    },
    {
        title: 'Attendance',
        href: '/admin/school/attendance',
        icon: UserCheck,
    },
    {
        title: 'Classes',
        href: '/admin/school/class-definitions',
        icon: BookOpen,
    },
    {
        title: 'Exams',
        href: '/admin/school/exams',
        icon: Calendar,
    },
    {
        title: 'Parents',
        href: '/admin/school/parents',
        icon: Users,
    },
    {
        title: 'Students',
        href: '/admin/school/students',
        icon: UserPlus,
    },
    {
        title: 'Subjects',
        href: '/admin/school/subjects',
        icon: BookOpen,
    },
    {
        title: 'Teachers',
        href: '/admin/school/teachers',
        icon: UserCheck,
    },
];

const systemNavItems: NavItem[] = [
    {
        groupTitle: 'System',
        title: 'Reports',
        href: '/admin/reports',
        icon: FileSpreadsheet,
    },
    {
        title: 'Settings',
        href: '/admin/settings',
        icon: Settings,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/parkerfly38/shulnet-php',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const user = auth.user;
    const isAdmin = user?.is_admin || false;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                {isAdmin && (
                    <>
                        {/* Admin Section */}
                        <NavMain items={adminNavItems} />

                        {/* School Management Section */}
                        <NavMain items={schoolNavItems} />

                        {/* Cemetery Management Section */}
                        <NavMain items={cemeteryNavItems} />
                        
                        {/* System Section */}
                        <NavMain items={systemNavItems} />

                    </>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
