import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    groupTitle?: string;
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Member {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    title?: string;
    email: string;
    phone1?: string;
    phone2?: string;
    address_line_1?: string;
    address_line_2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    dob?: string;
    gender?: string;
    aliyah?: boolean;
    bnaimitzvahdate?: string;
    chazanut?: boolean;
    tribe?: string;
    dvartorah?: boolean;
    deceased?: boolean;
    father_hebrew_name?: string;
    mother_hebrew_name?: string;
    hebrew_name?: string;
    brianbatorah?: boolean;
    maftir?: boolean;
    anniversary_date?: string;
    created_at: string;
    updated_at: string;
}
