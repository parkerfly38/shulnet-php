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
    currentDate: {
        gregorian: string;
        hebrew: string;
    };
    currency: string;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    roles?: string[];
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
    committees?: CommitteeMembership[];
    boards?: BoardMembership[];
    email_records?: EmailRecord[];
    created_at: string;
    updated_at: string;
    user_id?: number;
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

export interface Committee {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
    pivot?: CommitteeMemberPivot;
}

export interface Board {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
    pivot?: BoardMemberPivot;
}

export interface CommitteeMemberPivot {
    committee_id: number;
    member_id: number;
    title?: string;
    term_start_date: string;
    term_end_date?: string;
    created_at: string;
    updated_at: string;
}

export interface BoardMemberPivot {
    board_id: number;
    member_id: number;
    title?: string;
    term_start_date: string;
    term_end_date?: string;
    created_at: string;
    updated_at: string;
}

export interface CommitteeMembership extends Member {
    pivot: CommitteeMemberPivot;
}

export interface BoardMembership extends Member {
    pivot: BoardMemberPivot;
}

export interface Meeting {
    id: number;
    meetable_type: string;
    meetable_id: number;
    title: string;
    agenda?: string;
    meeting_date: string;
    location?: string;
    meeting_link?: string;
    minutes?: string;
    zoom_meeting_id?: string;
    zoom_join_url?: string;
    zoom_start_url?: string;
    zoom_password?: string;
    created_at: string;
    updated_at: string;
    meetable?: Committee | Board;
}

export interface Report {
    id: number;
    reportable_type: string;
    reportable_id: number;
    title: string;
    report_date: string;
    content: string;
    created_at: string;
    updated_at: string;
    reportable?: Committee | Board;
}

export interface EmailRecord {
    id: number;
    member_id: number;
    subject: string;
    from: string;
    to: string;
    cc?: string;
    bcc?: string;
    date_sent: string;
    conversation_id?: string;
    message_id?: string;
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
    status: 'draft' | 'open' | 'partial' | 'paid' | 'overdue' | 'cancelled';
    subtotal: string;
    tax_amount: string;
    total: string;
    amount_paid: string;
    balance: number;
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
    amount_paid: string;
    balance: number;
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

export interface Gravesite {
    id: number;
    cemetery_name?: string;
    section?: string;
    row?: string;
    plot_number: string;
    block?: string;
    status: 'available' | 'reserved' | 'occupied';
    gravesite_type: 'single' | 'double' | 'family' | 'cremation';
    size_length?: number;
    size_width?: number;
    member_id?: number;
    member?: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
    purchase_date?: string;
    purchase_price?: number;
    reserved_date?: string;
    reserved_by?: string;
    deceased_name?: string;
    deceased_hebrew_name?: string;
    date_of_birth?: string;
    date_of_death?: string;
    burial_date?: string;
    notes?: string;
    gps_coordinates?: string;
    perpetual_care: boolean;
    monument_inscription?: string;
    full_location?: string;
    created_at: string;
    updated_at: string;
}

export interface Deed {
    id: number;
    member_id: number;
    deed_number: string;
    purchase_date: string;
    purchase_price?: string;
    occupied: number;
    notes?: string;
    is_active: boolean;
    member?: Member;
    interments?: Interment[];
    gravesites?: Gravesite[];
    created_at: string;
    updated_at: string;
}

export interface Interment {
    id: number;
    deed_id: number;
    member_id?: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    hebrew_name?: string;
    date_of_birth?: string;
    date_of_death: string;
    interment_date: string;
    cause_of_death?: string;
    funeral_home?: string;
    rabbi_officiating?: string;
    notes?: string;
    deed?: Deed;
    member?: Member;
    created_at: string;
    updated_at: string;
}

// Torah Reading Types
export interface TorahReading {
    k: string; // Book name (e.g., "Genesis", "Deuteronomy")
    b: string; // Beginning verse (e.g., "21:1")
    e: string; // Ending verse (e.g., "21:4")
    v: number; // Number of verses
    p?: number; // Parsha number (optional)
    note?: string; // Optional note
}

export interface TorahReadingName {
    en: string;
    he: string;
}

export interface TorahReadingSummaryPart {
    k: string; // Book name
    b: string; // Beginning verse
    e: string; // Ending verse
}

export interface TorahReadingItem {
    date: string; // ISO date string
    hdate: string; // Hebrew date (e.g., "26 Elul 5782")
    name: TorahReadingName;
    parshaNum?: number; // Parsha number (for weekly portions)
    
    // Weekday readings (Mon-Thu)
    weekday?: {
        [key: string]: TorahReading; // Keys: "1", "2", "3", etc.
    };
    
    // Full kriyah (Shabbat/Holiday readings)
    fullkriyah?: {
        [key: string]: TorahReading; // Keys: "1"-"7", "M" (maftir)
    };
    
    // Triennial cycle readings
    triennial?: {
        [key: string]: TorahReading;
    };
    triYear?: number; // Year in triennial cycle (1-3)
    
    // Haftarah readings
    haft?: TorahReading;
    haftara?: string; // Summary text (e.g., "Isaiah 61:10-63:9")
    triHaft?: TorahReading;
    triHaftara?: string;
    
    // Summaries
    summary?: string; // Text summary
    summaryParts?: TorahReadingSummaryPart[];
}

export interface TorahReadingResponse {
    date: string; // ISO timestamp
    location: string; // e.g., "Diaspora"
    range: {
        start: string; // ISO date
        end: string; // ISO date
    };
    items: TorahReadingItem[];
}
