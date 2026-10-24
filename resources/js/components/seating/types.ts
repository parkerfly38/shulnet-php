export interface SeatingSection {
    id: number;
    seating_chart_id: number;
    name: string;
    color: string;
    sort_order: number;
}

export interface Seat {
    id: number;
    seating_chart_id: number;
    seating_section_id: number | null;
    label: string;
    x: number;
    y: number;
    member_price: string;
    nonmember_price: string;
    is_accessible: boolean;
    is_active: boolean;
}

export interface SeatingChart {
    id: number;
    name: string;
    description: string | null;
    image_url: string | null;
    image_width: number | null;
    image_height: number | null;
    sections?: SeatingSection[];
    seats?: Seat[];
    seats_count?: number;
    seasons_count?: number;
}

export interface SeatingSeason {
    id: number;
    seating_chart_id: number;
    name: string;
    first_service_date: string | null;
    member_sales_enabled: boolean;
    sale_starts_at: string | null;
    sale_ends_at: string | null;
    renewal_ends_at: string | null;
    max_seats_per_member: number | null;
    gl_account_id: number | null;
    notes: string | null;
    is_open_for_members?: boolean;
    is_renewal_window_open?: boolean;
    chart?: SeatingChart;
}

export type SeatStatus = 'renewal' | 'reserved';
export type Pricing = 'member' | 'nonmember';

export interface SeatAssignment {
    id: number;
    seating_season_id: number;
    seat_id: number;
    member_id: number;
    status: SeatStatus;
    pricing: Pricing;
    price: string;
    occupant_name: string | null;
    invoice_id: number | null;
    source: 'admin' | 'member' | 'renewal';
    is_expired?: boolean;
    member?: { id: number; first_name: string; last_name: string; email: string | null; member_type: string };
    invoice?: { id: number; invoice_number: string; status: string; total: string; amount_paid: string } | null;
    season?: SeatingSeason;
    seat?: Seat & { section?: SeatingSection | null };
}

export interface GlAccount {
    id: number;
    account_code: string;
    account_name: string;
}

export function seatPrice(seat: Pick<Seat, 'member_price' | 'nonmember_price'>, pricing: Pricing): number {
    return Number(pricing === 'nonmember' ? seat.nonmember_price : seat.member_price);
}

/** ISO timestamp from the server -> value for <input type="datetime-local"> in the browser's timezone. */
export function toLocalInput(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** <input type="datetime-local"> value -> ISO timestamp, so the server stores the instant the admin meant. */
export function fromLocalInput(value: string): string | null {
    return value ? new Date(value).toISOString() : null;
}

export function formatDateTime(iso: string | null): string {
    return iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '';
}
