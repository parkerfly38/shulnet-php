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
    member_type: 'member' | 'contact' | 'prospect' | 'former';
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
    membership_periods?: MembershipPeriod[];
    created_at: string;
    updated_at: string;
}

export interface MembershipPeriod {
    id: number;
    member_id: number;
    invoice_id?: number;
    begin_date: string;
    end_date?: string;
    membership_type?: string;
    notes?: string;
    invoice?: {
        id: number;
        invoice_number: string;
        invoice_date: string;
        total: string;
        status: string;
    };
    created_at: string;
    updated_at: string;
}

export interface Note {
    id: number;
    item_scope: string;
    name: string;
    deadline_date?: string;
    completed_date?: string;
    seen_date?: string;
    note_text?: string;
    label?: string;
    added_by?: string;
    visibility: string;
    priority: string;
    member_id?: number;
    user_id?: number;
    member?: Member;
    user?: User;
    created_at: string;
    updated_at: string;
}

export interface EventTicketType {
    id: number;
    event_id: number;
    name: string;
    description?: string;
    category: 'early_bird' | 'adult' | 'child' | 'member' | 'nonmember' | 'general' | 'vip';
    price: string;
    quantity_available?: number;
    quantity_sold: number;
    sale_starts?: string;
    sale_ends?: string;
    active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface Invoice {
    id: number;
    member_id: number;
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    subtotal: string;
    tax_amount: string;
    total: string;
    notes?: string;
    recurring: boolean;
    recurring_interval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    recurring_interval_count: number;
    next_invoice_date?: string;
    last_invoice_date?: string;
    recurring_end_date?: string;
    parent_invoice_id?: number;
    member?: Member;
    items?: InvoiceItem[];
    created_at: string;
    updated_at: string;
}

export interface InvoiceItem {
    id: number;
    invoice_id: number;
    description: string;
    quantity: string;
    unit_price: string;
    total: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface PdfTemplateField {
    name: string;
    label: string;
    type: 'text' | 'date' | 'number' | 'textarea';
    description?: string;
    required?: boolean;
    default_value?: string;
}

export interface PdfTemplate {
    id: number;
    name: string;
    slug: string;
    description?: string;
    html_content: string;
    available_fields: PdfTemplateField[];
    category: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Yahrzeit {
    id: number;
    name: string;
    hebrew_name?: string;
    hebrew_day_of_death: number;
    hebrew_month_of_death: number;
    date_of_death?: string;
    members?: Array<{
        id: number;
        name: string;
        relationship?: string;
    }>;
}

export interface HebrewDate {
    day: number;
    month: number;
    year: number;
    formatted: string;
}

export interface Event {
    id: number;
    name: string;
    tagline?: string;
    event_start: string;
    event_end: string;
    all_day: boolean;
    location?: string;
    online: boolean;
    registration_required: boolean;
    members_only: boolean;
}
