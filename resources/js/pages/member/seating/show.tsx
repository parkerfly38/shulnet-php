import FlashMessages from '@/components/seating/flash-messages';
import SeatMap, { Legend } from '@/components/seating/seat-map';
import { formatDateTime, type Pricing, type Seat, type SeatingSeason, seatPrice } from '@/components/seating/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CreditCard, FileText, Info } from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';

interface MyAssignment {
    id: number;
    seat_id: number;
    status: 'renewal' | 'reserved';
    price: string;
    invoice_id: number | null;
}

interface Props {
    season: SeatingSeason & { chart: NonNullable<SeatingSeason['chart']> };
    takenSeatIds: number[];
    myAssignments: MyAssignment[];
    pricing: Pricing;
}

const COLORS = {
    selected: '#e11d48',
    mine: '#0f766e',
    renewal: '#f59e0b',
    taken: '#cbd5e1',
};

const naturalSort = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

export default function MemberSeatingShow({ season, takenSeatIds, myAssignments, pricing }: Readonly<Props>) {
    const { t } = useTranslation();
    const { currency } = usePage<SharedData>().props;
    const money = (n: number | string) => formatCurrency(n, currency);

    const seats = useMemo(() => season.chart.seats ?? [], [season.chart.seats]);
    const sections = useMemo(() => new Map((season.chart.sections ?? []).map((s) => [s.id, s])), [season.chart.sections]);
    const seatsById = useMemo(() => new Map(seats.map((s) => [s.id, s])), [seats]);
    const taken = useMemo(() => new Set(takenSeatIds), [takenSeatIds]);
    const reserved = myAssignments.filter((a) => a.status === 'reserved');
    const renewals = myAssignments.filter((a) => a.status === 'renewal');
    const renewalIds = useMemo(() => new Set(renewals.map((a) => a.seat_id)), [renewals]);
    const reservedIds = useMemo(() => new Set(reserved.map((a) => a.seat_id)), [reserved]);

    // Renewal seats start selected so confirming them is one click.
    const [selection, setSelection] = useState<Set<number>>(() => new Set(renewals.map((a) => a.seat_id)));
    const [paymentOption, setPaymentOption] = useState<'pay_now' | 'invoice'>('pay_now');
    const [processing, setProcessing] = useState(false);

    const canBuy = !!season.is_open_for_members;
    const limit = season.max_seats_per_member;
    const remaining = limit ? Math.max(0, limit - reserved.length) : null;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'My Dashboard', href: '/member/dashboard' },
        { title: 'High Holy Day Seats', href: '/member/seating' },
        { title: season.name, href: `/member/seating/${season.id}` },
    ];

    const isSelectable = (seat: Seat) => renewalIds.has(seat.id) || (canBuy && !taken.has(seat.id) && !reservedIds.has(seat.id));

    const appearance = (seat: Seat) => {
        const section = seat.seating_section_id ? sections.get(seat.seating_section_id) : undefined;
        const price = money(seatPrice(seat, pricing));
        const base = `${t('Seat :label', { label: seat.label })}${section ? ` - ${section.name}` : ''}`;

        if (reservedIds.has(seat.id)) return { color: COLORS.mine, disabled: true, accessible: seat.is_accessible, title: `${base}: ${t('Your seat')}` };
        if (selection.has(seat.id)) return { color: COLORS.selected, accessible: seat.is_accessible, title: `${base}: ${price}`, className: 'ring-2 ring-offset-2 ring-foreground z-10' };
        if (renewalIds.has(seat.id)) return { color: COLORS.renewal, accessible: seat.is_accessible, title: `${base}: ${t('Held for you')} - ${price}` };
        if (taken.has(seat.id)) return { color: COLORS.taken, disabled: true, accessible: seat.is_accessible, title: `${base}: ${t('Taken')}` };
        if (!canBuy) return { color: COLORS.taken, disabled: true, hollow: true, accessible: seat.is_accessible, title: base };
        return { color: section?.color ?? '#2563eb', accessible: seat.is_accessible, title: `${base}: ${price}` };
    };

    const toggle = (seat: Seat) => {
        if (!isSelectable(seat)) return;
        setSelection((prev) => {
            const next = new Set(prev);
            if (next.has(seat.id)) next.delete(seat.id);
            else next.add(seat.id);
            return next;
        });
    };

    const selectedSeats = [...selection].map((id) => seatsById.get(id)).filter((s): s is Seat => !!s).sort((a, b) => naturalSort(a.label, b.label));
    const total = selectedSeats.reduce((sum, s) => sum + seatPrice(s, pricing), 0);
    const overLimit = remaining !== null && selectedSeats.length > remaining;

    const submit = () => {
        setProcessing(true);
        router.post(`/member/seating/${season.id}/reserve`, {
            seat_ids: selectedSeats.map((s) => s.id),
            payment_option: paymentOption,
        }, { preserveScroll: true, onFinish: () => setProcessing(false) });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={season.name} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{season.name}</h1>
                    <p className="mt-1 text-muted-foreground">
                        {canBuy ? t('Choose your seats on the map below.') : t('General seat sales are not open yet.')}
                        {season.sale_ends_at && canBuy && ` ${t('Sales close :date.', { date: formatDateTime(season.sale_ends_at) })}`}
                    </p>
                </div>

                <FlashMessages />

                {renewals.length > 0 && season.is_renewal_window_open && (
                    <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
                        <Info className="mt-0.5 h-5 w-5 shrink-0" />
                        <div>
                            <p className="font-medium">{t("We're holding your seats from last year")}</p>
                            <p className="text-sm">
                                {t('Seats :labels are reserved for you until :date. Confirm them below to keep them.', {
                                    labels: renewals.map((a) => seatsById.get(a.seat_id)?.label).filter(Boolean).join(', '),
                                    date: formatDateTime(season.renewal_ends_at),
                                })}
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                    <div className="flex min-w-0 flex-col gap-2">
                        <SeatMap
                            imageUrl={season.chart.image_url}
                            imageWidth={season.chart.image_width}
                            imageHeight={season.chart.image_height}
                            seats={seats.map((s) => ({ ...s, key: String(s.id) }))}
                            appearance={appearance}
                            onSeatClick={toggle}
                        />
                        <Legend items={[
                            ...(season.chart.sections ?? []).map((s) => ({ label: s.name, color: s.color })),
                            { label: t('Selected'), color: COLORS.selected },
                            ...(renewals.length ? [{ label: t('Held for you'), color: COLORS.renewal }] : []),
                            { label: t('Your seats'), color: COLORS.mine },
                            { label: t('Taken'), color: COLORS.taken },
                            { label: t('Accessible'), color: '#64748b', round: true },
                        ]} />
                    </div>

                    <div className="flex flex-col gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">{t('Your Selection')}</CardTitle>
                                <CardDescription>
                                    {pricing === 'member' ? t('Member pricing') : t('Non-member pricing')}
                                    {remaining !== null && ` · ${t('You can reserve :count more', { count: remaining })}`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {selectedSeats.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">{t('Tap a seat on the map to select it.')}</p>
                                ) : (
                                    <>
                                        <ul className="max-h-48 space-y-1 overflow-y-auto text-sm">
                                            {selectedSeats.map((s) => (
                                                <li key={s.id} className="flex justify-between">
                                                    <span>
                                                        {t('Seat :label', { label: s.label })}
                                                        {s.seating_section_id && <span className="text-muted-foreground"> · {sections.get(s.seating_section_id)?.name}</span>}
                                                    </span>
                                                    <span className="tabular-nums">{money(seatPrice(s, pricing))}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="flex justify-between border-t pt-2 font-semibold">
                                            <span>{t('Total')}</span><span className="tabular-nums">{money(total)}</span>
                                        </div>
                                        {total > 0 && (
                                            <div className="space-y-2">
                                                <Label>{t('Payment')}</Label>
                                                <PaymentChoice value="pay_now" current={paymentOption} onSelect={setPaymentOption}
                                                    icon={<CreditCard className="h-4 w-4" />} label={t('Pay now by card')} />
                                                <PaymentChoice value="invoice" current={paymentOption} onSelect={setPaymentOption}
                                                    icon={<FileText className="h-4 w-4" />} label={t('Add to my account and pay later')} />
                                            </div>
                                        )}
                                        {overLimit && <p className="text-sm text-destructive">{t('You can reserve at most :count seats.', { count: limit ?? 0 })}</p>}
                                        <Button className="w-full" disabled={processing || overLimit} onClick={submit}>
                                            {total > 0 && paymentOption === 'pay_now' ? t('Reserve & Pay') : t('Reserve Seats')}
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {reserved.length > 0 && (
                            <Card>
                                <CardHeader className="pb-3"><CardTitle className="text-base">{t('Your Seats')}</CardTitle></CardHeader>
                                <CardContent className="space-y-1 text-sm">
                                    {reserved.map((a) => (
                                        <div key={a.id} className="flex justify-between">
                                            <span>{t('Seat :label', { label: seatsById.get(a.seat_id)?.label ?? '' })}</span>
                                            {a.invoice_id
                                                ? <Link href={`/member/invoices/${a.invoice_id}`} className="text-primary hover:underline">{t('View invoice')}</Link>
                                                : <span className="tabular-nums">{money(a.price)}</span>}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function PaymentChoice({ value, current, onSelect, icon, label }: {
    value: 'pay_now' | 'invoice'; current: string; onSelect: (v: 'pay_now' | 'invoice') => void; icon: ReactNode; label: string;
}) {
    const active = value === current;
    return (
        <button type="button" onClick={() => onSelect(value)} aria-pressed={active}
            className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${active ? 'border-primary bg-primary/5 font-medium' : 'hover:bg-muted'}`}>
            {icon}{label}
        </button>
    );
}
