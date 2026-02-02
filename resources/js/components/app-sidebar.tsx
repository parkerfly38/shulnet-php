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
import { BookOpen, Folder, LayoutGrid, Users, UserPlus, Star, Calendar, CalendarDays, Receipt, MapPin, FileText, Settings, FileSpreadsheet, Award, Mail, ClipboardList, Home, UserCircle, UserCheck, GraduationCap, Key, Search, Layout, Image, Briefcase, Users2, TrendingUp } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const memberNavItems: NavItem[] = [
    {
        groupTitle: 'Member Portal',
        title: 'My Dashboard',
        href: '/member/dashboard',
        icon: Home,
    },
    {
        title: 'My Invoices',
        href: '/member/invoices',
        icon: Receipt,
    },
    {
        title: 'My Students',
        href: '/member/students',
        icon: GraduationCap,
    },
    {
        title: 'My Yahrzeits',
        href: '/member/yahrzeits',
        icon: Star,
    },
    {
        title: 'My Events',
        href: '/member/events',
        icon: CalendarDays,
    },
    {
        title: 'My Committees',
        href: '/member/committees',
        icon: Users2,
    },
    {
        title: 'My Boards',
        href: '/member/boards',
        icon: Briefcase,
    },
    {
        title: 'My Information',
        href: '/member/profile',
        icon: UserCircle,
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
        title: 'Email Campaigns',
        href: '/admin/campaigns',
        icon: Mail,
    },
    {
        title: 'Custom Forms',
        href: '/admin/forms',
        icon: ClipboardList,
    },
    {
        title: 'Gabbai Dashboard',
        href: '/admin/gabbai',
        icon: UserCheck,
    },
];

const leadershipNavItems: NavItem[] = [
    {
        groupTitle: 'Leadership Management',
        title: 'Leadership Dashboard',
        href: '/admin/leadership',
        icon: TrendingUp,
    },
    {
        title: 'Committees',
        href: '/admin/committees',
        icon: Users2,
    },
    {
        title: 'Boards',
        href: '/admin/boards',
        icon: Briefcase,
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
        title: 'Tuition Tiers',
        href: '/admin/school-tuition-tiers',
        icon: Award,
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
        title: 'General Settings',
        href: '/admin/settings',
        icon: Settings,
    },
    {
        title: 'API Tokens',
        href: '/admin/api-tokens',
        icon: Key,
    },
    {
        title: 'Email Settings',
        href: '/admin/email-settings',
        icon: Mail,
    },
    {
        title: 'Email Templates',
        href: '/admin/templates',
        icon: FileText,
    },
];

const contentNavItems: NavItem[] = [
    {
        groupTitle: 'Content Management',
        title: 'Pages',
        href: '/admin/html-pages',
        icon: FileText,
    },
    {
        title: 'Templates',
        href: '/admin/html-templates',
        icon: Layout,
    },
    {
        title: 'Assets',
        href: '/admin/html-assets',
        icon: Image,
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
        href: '/docs/index.html',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const user = auth.user;
    const isAdmin = user?.is_admin || false;
    const isMember = user?.is_member || false;

    const handleSearchClick = () => {
        window.dispatchEvent(new CustomEvent('open-search'));
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <AppLogo />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    {isAdmin && (
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={handleSearchClick}
                                tooltip={{
                                    children: (
                                        <div className="flex items-center gap-2">
                                            Search
                                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                                <span className="text-xs">⌘K</span>
                                            </kbd>
                                        </div>
                                    ),
                                }}
                            >
                                <Search />
                                <span>Search</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                
                
                {/* Member Portal Section */}
                {isMember && (
                    <NavMain items={memberNavItems} />
                )}
                
                {isAdmin && (
                    <>
                        <NavMain items={mainNavItems} />
                        {/* Admin Section */}
                        <NavMain items={adminNavItems} />

                        {/* Leadership Management Section */}
                        <NavMain items={leadershipNavItems} />

                        {/* School Management Section */}
                        <NavMain items={schoolNavItems} />

                        {/* Cemetery Management Section */}
                        <NavMain items={cemeteryNavItems} />
                        
                        {/* Content Management Section */}
                        <NavMain items={contentNavItems} />
                        
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
