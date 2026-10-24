import AsyncMemberSelect from '@/components/async-member-select';
import FlashMessages from '@/components/seating/flash-messages';
import SeasonFormDialog from '@/components/seating/season-form-dialog';
import SeatMap, { Legend } from '@/components/seating/seat-map';
import { formatDateTime, type GlAccount, type Pricing, type Seat, type SeatAssignment, type SeatingSeason, seatPrice } from '@/components/seating/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Armchair, CircleDollarSign, Clock, Pencil, RefreshCw, Search, Trash2, UserCheck, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Props {
    season: SeatingSeason & { chart: NonNullable<SeatingSeason['chart']> };
    assignments: SeatAssignment[];
    stats: { seats: number; reserved: number; renewals: number; invoiced: number; paid: number };
    renewalSources: { id: number; name: string }[];
    charts: { id: number; name: string }[];
    glAccounts: GlAccount[];
}

const COLORS = {
    paid: '#334155',
    unpaid: '#94a3b8',
    renewal: '#f59e0b',
    inactive: '#94a3b8',
    selected: '#e11d48',
};

const naturalSort = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

function isPaid(a: SeatAssignment) {
    return a.invoice ? a.invoice.status === 'paid' : Number(a.price) === 0;
}

export default function SeatingSeasonShow({ season, assignments, stats, renewalSources, charts, glAccounts }: Readonly<Props>) {
    const { t } = useTranslation();
    const { currency } = usePage<SharedData>().props;
    const money = (n: number | string) => formatCurrency(n, currency);

    const seats = useMemo(() => season.chart.seats ?? [], [season.chart.seats]);
    const sections = useMemo(() => new Map((season.chart.sections ?? []).map((s) => [s.id, s])), [season.chart.sections]);
    const seatsById = useMemo(() => new Map(seats.map((s) => [s.id, s])), [seats]);
    // Lapsed renewal offers no longer hold the seat.
    const holding = useMemo(() => new Map(assignments.filter((a) => !a.is_expired).map((a) => [a.seat_id, a])), [assignments]);

    const [selection, setSelection] = useState<Set<number>>(new Set());
    const [focusedId, setFocusedId] = useState<number | null>(null);
    const [editing, setEditing] = useState(false);
    const [renewalsOpen, setRenewalsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const focused = focusedId ? assignments.find((a) => a.id === focusedId) ?? null : null;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'High Holy Day Seating', href: '/admin/seating-seasons' },
        { title: season.name, href: `/admin/seating-seasons/${season.id}` },
    ];

    const mapSeats = seats.map((s) => ({ ...s, key: String(s.id) }));

    const appearance = (seat: Seat) => {
        const held = holding.get(seat.id);
        const sectionName = seat.seating_section_id ? sections.get(seat.seating_section_id)?.name : null;
        const base = `${seat.label}${sectionName ? ` - ${sectionName}` : ''}`;

        if (selection.has(seat.id)) {
            return { color: COLORS.selected, accessible: seat.is_accessible, title: base, className: 'ring-2 ring-offset-2 ring-foreground z-10' };
        }
        if (held) {
            const who = `${held.member?.first_name ?? ''} ${held.member?.last_name ?? ''}`.trim();
            const color = held.status === 'renewal' ? COLORS.renewal : isPaid(held) ? COLORS.paid : COLORS.unpaid;
            return {
                color,
                accessible: seat.is_accessible,
                title: `${base}: ${who}${held.status === 'renewal' ? ` (${t('renewal')})` : ''}`,
                className: focusedId === held.id ? 'ring-2 ring-offset-2 ring-foreground z-10' : undefined,
            };
        }
        if (!seat.is_active) {
            return { color: COLORS.inactive, hollow: true, disabled: true, accessible: seat.is_accessible, title: `${base}: ${t('Unavailable')}` };
        }
        return {
            color: seat.seating_section_id ? sections.get(seat.seating_section_id)?.color ?? '#2563eb' : '#2563eb',
            accessible: seat.is_accessible,
            title: `${base}: ${money(seat.member_price)} / ${money(seat.nonmember_price)}`,
        };
    };

    const handleSeatClick = (seat: Seat) => {
        const held = holding.get(seat.id);
        if (held) {
            setSelection(new Set());
            setFocusedId(held.id);
            return;
        }
        setFocusedId(null);
        setSelection((prev) => {
            const next = new Set(prev);
            if (next.has(seat.id)) next.delete(seat.id);
            else next.add(seat.id);
            return next;
        });
    };

    const rows = useMemo(() => {
        const q = search.trim().toLowerCase();
        return assignments
            .filter((a) => !a.is_expired)
            .filter((a) => !q || [a.member?.first_name, a.member?.last_name, a.occupant_name, seatsById.get(a.seat_id)?.label, a.invoice?.invoice_number]
                .some((v) => v?.toLowerCase().includes(q)))
            .sort((a, b) => naturalSort(seatsById.get(a.seat_id)?.label ?? '', seatsById.get(b.seat_id)?.label ?? ''));
    }, [assignments, search, seatsById]);

    const available = stats.seats - stats.reserved - stats.renewals;

    const statCards = [
        { title: t('Reserved'), value: `${stats.reserved} / ${stats.seats}`, icon: Armchair },
        { title: t('Available'), value: String(Math.max(0, available)), icon: UserCheck },
        { title: t('Renewals pending'), value: String(stats.renewals), icon: Clock },
        { title: t('Invoiced / Paid'), value: `${money(stats.invoiced)} / ${money(stats.paid)}`, icon: CircleDollarSign },
    ];

    const destroySeason = () => {
        if (confirm(t('Delete this season? Pending renewal offers will be removed.'))) {
            router.delete(`/admin/seating-seasons/${season.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={season.name} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{season.name}</h1>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span>{season.chart.name}</span>
                            {season.is_open_for_members
                                ? <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">{t('Open to members')}</Badge>
                                : <Badge variant="secondary">{season.member_sales_enabled ? t('Member sales closed') : t('Admin only')}</Badge>}
                            {season.is_renewal_window_open && (
                                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                                    {t('Renewals held until :date', { date: formatDateTime(season.renewal_ends_at) })}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => setRenewalsOpen(true)}><RefreshCw className="mr-2 h-4 w-4" />{t('Offer Renewals')}</Button>
                        <Button variant="outline" asChild>
                            <Link href={`/admin/seating-charts/${season.chart.id}/edit`}>{t('Edit Seat Map')}</Link>
                        </Button>
                        <Button variant="outline" onClick={() => setEditing(true)}><Pencil className="mr-2 h-4 w-4" />{t('Edit Season')}</Button>
                        <Button variant="ghost" size="icon" aria-label={t('Delete season')} onClick={destroySeason}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                </div>

                <FlashMessages />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card) => (
                        <Card key={card.title} className="py-4">
                            <CardContent className="flex items-center justify-between px-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">{card.title}</p>
                                    <p className="text-xl font-semibold tabular-nums">{card.value}</p>
                                </div>
                                <card.icon className="h-6 w-6 text-muted-foreground" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
                    <div className="flex min-w-0 flex-col gap-2">
                        {seats.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    {t('This chart has no seats yet.')}{' '}
                                    <Link className="text-primary hover:underline" href={`/admin/seating-charts/${season.chart.id}/edit`}>{t('Place seats on the map')}</Link>
                                </CardContent>
                            </Card>
                        ) : (
                            <SeatMap
                                imageUrl={season.chart.image_url}
                                imageWidth={season.chart.image_width}
                                imageHeight={season.chart.image_height}
                                seats={mapSeats}
                                appearance={appearance}
                                onSeatClick={handleSeatClick}
                            />
                        )}
                        <Legend items={[
                            ...(season.chart.sections ?? []).map((s) => ({ label: `${s.name} (${t('available')})`, color: s.color })),
                            { label: t('Selected'), color: COLORS.selected },
                            { label: t('Renewal held'), color: COLORS.renewal },
                            { label: t('Reserved, unpaid'), color: COLORS.unpaid },
                            { label: t('Reserved, paid'), color: COLORS.paid },
                            { label: t('Unavailable'), color: COLORS.inactive, hollow: true },
                        ]} />
                    </div>

                    <div className="flex flex-col gap-4">
                        {focused ? (
                            <AssignmentPanel
                                key={focused.id}
                                season={season}
                                assignment={focused}
                                seat={seatsById.get(focused.seat_id)}
                                sectionName={sections.get(seatsById.get(focused.seat_id)?.seating_section_id ?? -1)?.name}
                                money={money}
                                onClose={() => setFocusedId(null)}
                            />
                        ) : selection.size > 0 ? (
                            <AssignPanel
                                season={season}
                                seats={[...selection].map((id) => seatsById.get(id)!).filter(Boolean).sort((a, b) => naturalSort(a.label, b.label))}
                                money={money}
                                onClear={() => setSelection(new Set())}
                                onDone={() => setSelection(new Set())}
                            />
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">{t('Assign Seats')}</CardTitle>
                                    <CardDescription>{t('Click available seats on the map to select them, then choose a member to assign and invoice. Click a taken seat to see who holds it.')}</CardDescription>
                                </CardHeader>
                            </Card>
                        )}
                    </div>
                </div>

                <Card className="gap-0 py-0">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
                        <h2 className="text-lg font-semibold">{t('Seat Holders')}</h2>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input className="ps-8" placeholder={t('Search name, seat or invoice')} value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50 text-left text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-2 font-medium">{t('Seat')}</th>
                                    <th className="px-4 py-2 font-medium">{t('Section')}</th>
                                    <th className="px-4 py-2 font-medium">{t('Member')}</th>
                                    <th className="px-4 py-2 font-medium">{t('Occupant')}</th>
                                    <th className="px-4 py-2 font-medium">{t('Status')}</th>
                                    <th className="px-4 py-2 text-right font-medium">{t('Price')}</th>
                                    <th className="px-4 py-2 font-medium">{t('Invoice')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 && (
                                    <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">{t('No seats assigned yet.')}</td></tr>
                                )}
                                {rows.map((a) => {
                                    const seat = seatsById.get(a.seat_id);
                                    return (
                                        <tr key={a.id} className="cursor-pointer border-b last:border-0 hover:bg-muted/30"
                                            onClick={() => { setSelection(new Set()); setFocusedId(a.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                                            <td className="px-4 py-2 font-medium">{seat?.label}</td>
                                            <td className="px-4 py-2">{sections.get(seat?.seating_section_id ?? -1)?.name ?? '-'}</td>
                                            <td className="px-4 py-2">{a.member?.first_name} {a.member?.last_name}</td>
                                            <td className="px-4 py-2">{a.occupant_name ?? '-'}</td>
                                            <td className="px-4 py-2"><StatusBadge assignment={a} /></td>
                                            <td className="px-4 py-2 text-right tabular-nums">{money(a.price)}</td>
                                            <td className="px-4 py-2">
                                                {a.invoice
                                                    ? <Link href={`/admin/invoices/${a.invoice.id}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>{a.invoice.invoice_number}</Link>
                                                    : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <SeasonFormDialog open={editing} onOpenChange={setEditing} season={season} charts={charts} glAccounts={glAccounts} />
            <RenewalsDialog open={renewalsOpen} onOpenChange={setRenewalsOpen} season={season} sources={renewalSources} />
        </AppLayout>
    );
}

function StatusBadge({ assignment }: { assignment: SeatAssignment }) {
    const { t } = useTranslation();
    if (assignment.status === 'renewal') {
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">{t('Renewal held')}</Badge>;
    }
    if (isPaid(assignment)) {
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">{t('Paid')}</Badge>;
    }
    if (assignment.invoice?.status === 'partial') {
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">{t('Partially paid')}</Badge>;
    }
    return <Badge variant="secondary">{assignment.invoice ? t('Invoiced') : t('Not invoiced')}</Badge>;
}

function AssignPanel({ season, seats, money, onClear, onDone }: {
    season: SeatingSeason;
    seats: Seat[];
    money: (n: number | string) => string;
    onClear: () => void;
    onDone: () => void;
}) {
    const { t } = useTranslation();
    const [memberId, setMemberId] = useState<number | null>(null);
    const [pricing, setPricing] = useState<Pricing>('member');
    const [createInvoice, setCreateInvoice] = useState(true);
    const [processing, setProcessing] = useState(false);
    const total = seats.reduce((sum, s) => sum + seatPrice(s, pricing), 0);

    const submit = () => {
        if (!memberId) return;
        setProcessing(true);
        router.post(`/admin/seating-seasons/${season.id}/assignments`, {
            member_id: memberId,
            seat_ids: seats.map((s) => s.id),
            pricing,
            create_invoice: createInvoice,
        }, {
            preserveScroll: true,
            onSuccess: (page) => {
                if (!(page.props as { flash?: { error?: string } }).flash?.error) onDone();
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div>
                    <CardTitle className="text-base">{t('Assign :count seats', { count: seats.length })}</CardTitle>
                    <CardDescription>{seats.map((s) => s.label).join(', ')}</CardDescription>
                </div>
                <Button size="icon" variant="ghost" className="-mt-2 -me-2" aria-label={t('Clear selection')} onClick={onClear}><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-1">
                    <Label>{t('Member')}</Label>
                    <AsyncMemberSelect onChange={setMemberId} placeholder={t('Search members...')} />
                </div>
                <div className="space-y-1">
                    <Label>{t('Pricing')}</Label>
                    <Select value={pricing} onValueChange={(v) => setPricing(v as Pricing)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="member">{t('Member price')}</SelectItem>
                            <SelectItem value="nonmember">{t('Non-member price')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <ul className="max-h-40 space-y-1 overflow-y-auto text-sm">
                    {seats.map((s) => (
                        <li key={s.id} className="flex justify-between"><span>{t('Seat :label', { label: s.label })}</span><span className="tabular-nums">{money(seatPrice(s, pricing))}</span></li>
                    ))}
                </ul>
                <div className="flex justify-between border-t pt-2 font-semibold"><span>{t('Total')}</span><span className="tabular-nums">{money(total)}</span></div>
                <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={createInvoice} onCheckedChange={(v) => setCreateInvoice(v === true)} />
                    {t('Create an invoice for these seats')}
                </label>
                <Button className="w-full" disabled={!memberId || processing} onClick={submit}>
                    {createInvoice && total > 0 ? t('Assign & Invoice') : t('Assign Seats')}
                </Button>
            </CardContent>
        </Card>
    );
}

function AssignmentPanel({ season, assignment, seat, sectionName, money, onClose }: {
    season: SeatingSeason;
    assignment: SeatAssignment;
    seat?: Seat;
    sectionName?: string;
    money: (n: number | string) => string;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const [occupant, setOccupant] = useState(assignment.occupant_name ?? '');
    const base = `/admin/seating-seasons/${season.id}/assignments`;
    const member = assignment.member;

    const saveOccupant = () => {
        router.patch(`${base}/${assignment.id}`, { occupant_name: occupant || null }, { preserveScroll: true });
    };

    const release = () => {
        const warning = assignment.invoice
            ? t('Release seat :label? Its charge will be removed from invoice :invoice.', { label: seat?.label ?? '', invoice: assignment.invoice.invoice_number })
            : t('Release seat :label?', { label: seat?.label ?? '' });
        if (confirm(warning)) {
            router.delete(`${base}/${assignment.id}`, { preserveScroll: true, onSuccess: onClose });
        }
    };

    const confirmRenewal = () => {
        router.post(base, {
            member_id: assignment.member_id,
            seat_ids: [assignment.seat_id],
            pricing: assignment.pricing,
            create_invoice: true,
        }, { preserveScroll: true });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div>
                    <CardTitle className="text-base">{t('Seat :label', { label: seat?.label ?? '' })}</CardTitle>
                    {sectionName && <CardDescription>{sectionName}</CardDescription>}
                </div>
                <Button size="icon" variant="ghost" className="-mt-2 -me-2" aria-label={t('Close')} onClick={onClose}><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div>
                    <p className="text-muted-foreground">{t('Held by')}</p>
                    {member && (
                        <Link href={`/admin/members/${member.id}`} className="font-medium text-primary hover:underline">{member.first_name} {member.last_name}</Link>
                    )}
                    {member?.email && <p className="text-muted-foreground">{member.email}</p>}
                </div>
                <div className="flex items-center justify-between">
                    <StatusBadge assignment={assignment} />
                    <span className="tabular-nums">{money(assignment.price)} <span className="text-muted-foreground">({assignment.pricing === 'member' ? t('member') : t('non-member')})</span></span>
                </div>
                {assignment.invoice && (
                    <p>
                        {t('Invoice')}:{' '}
                        <Link href={`/admin/invoices/${assignment.invoice.id}`} className="text-primary hover:underline">{assignment.invoice.invoice_number}</Link>
                        <span className="text-muted-foreground"> ({money(assignment.invoice.amount_paid)} / {money(assignment.invoice.total)} {t('paid')})</span>
                    </p>
                )}
                <div className="space-y-1">
                    <Label htmlFor="occupant">{t('Occupant name')}</Label>
                    <div className="flex gap-2">
                        <Input id="occupant" value={occupant} placeholder={t('Who will sit here')} onChange={(e) => setOccupant(e.target.value)} />
                        <Button variant="outline" onClick={saveOccupant} disabled={occupant === (assignment.occupant_name ?? '')}>{t('Save')}</Button>
                    </div>
                </div>
                {assignment.status === 'renewal' && (
                    <Button className="w-full" onClick={confirmRenewal}>{t('Confirm Renewal & Invoice')}</Button>
                )}
                <Button variant="outline" className="w-full text-destructive" onClick={release}>
                    {assignment.status === 'renewal' ? t('Withdraw Renewal Offer') : t('Release Seat')}
                </Button>
            </CardContent>
        </Card>
    );
}

function RenewalsDialog({ open, onOpenChange, season, sources }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    season: SeatingSeason;
    sources: { id: number; name: string }[];
}) {
    const { t } = useTranslation();
    const [fromId, setFromId] = useState(sources[0] ? String(sources[0].id) : '');
    const [processing, setProcessing] = useState(false);

    const submit = () => {
        setProcessing(true);
        router.post(`/admin/seating-seasons/${season.id}/renewals`, { from_season_id: fromId }, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('Offer Renewals')}</DialogTitle>
                    <DialogDescription>
                        {t("Hold each of last season's seats for the member who had it. Members confirm their seats in the member portal (or you can confirm them here) until the renewal deadline, after which unclaimed seats are released.")}
                    </DialogDescription>
                </DialogHeader>
                {sources.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t('There are no other seasons using this seating chart.')}</p>
                ) : (
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label>{t('Copy seat holders from')}</Label>
                            <Select value={fromId} onValueChange={setFromId}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {sources.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        {!season.renewal_ends_at && (
                            <p className="rounded border border-amber-200 bg-amber-50 p-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
                                {t('This season has no renewal deadline, so renewal offers will not hold seats. Set one under Edit Season first.')}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">{t("Renewals are priced at this year's seat prices. Seats already assigned this season are skipped.")}</p>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{t('Cancel')}</Button>
                    <Button onClick={submit} disabled={!fromId || processing}>{t('Create Renewal Offers')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
