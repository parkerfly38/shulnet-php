import FlashMessages from '@/components/seating/flash-messages';
import SeatMap, { Legend, pointToPercent } from '@/components/seating/seat-map';
import { type SeatingChart } from '@/components/seating/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { AlignHorizontalSpaceAround, AlignVerticalJustifyCenter, ArrowLeft, Armchair, ImageUp, MousePointer2, Plus, Rows3, Save, Trash2 } from 'lucide-react';
import React, { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface EditorSection {
    key: string;
    id: number | null;
    name: string;
    color: string;
}

interface EditorSeat {
    key: string;
    id: number | null;
    label: string;
    x: number;
    y: number;
    section_key: string | null;
    member_price: string;
    nonmember_price: string;
    is_accessible: boolean;
    is_active: boolean;
}

type Mode = 'select' | 'seat' | 'row';
type Point = { x: number; y: number };

interface Props {
    chart: SeatingChart;
    assignedSeatIds: number[];
}

const SECTION_COLORS = ['#2563eb', '#16a34a', '#9333ea', '#ea580c', '#0891b2', '#db2777', '#65a30d', '#ca8a04'];
const NO_SECTION = 'none';
const UNSECTIONED_COLOR = '#64748b';
let tempKey = 0;
const newKey = () => `new-${++tempKey}`;

function fromChart(chart: SeatingChart): { sections: EditorSection[]; seats: EditorSeat[] } {
    return {
        sections: (chart.sections ?? []).map((s) => ({ key: String(s.id), id: s.id, name: s.name, color: s.color })),
        seats: (chart.seats ?? []).map((s) => ({
            key: String(s.id),
            id: s.id,
            label: s.label,
            x: Number(s.x),
            y: Number(s.y),
            section_key: s.seating_section_id ? String(s.seating_section_id) : null,
            member_price: String(s.member_price),
            nonmember_price: String(s.nonmember_price),
            is_accessible: s.is_accessible,
            is_active: s.is_active,
        })),
    };
}

/** A -> B, Z -> AA, 9 -> 10. */
function nextRowLabel(label: string): string {
    if (/^\d+$/.test(label)) return String(Number(label) + 1);
    if (!/^[A-Za-z]+$/.test(label)) return label;

    const chars = label.toUpperCase().split('');
    let i = chars.length - 1;
    while (i >= 0) {
        if (chars[i] !== 'Z') {
            chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1);
            return chars.join('');
        }
        chars[i] = 'A';
        i--;
    }
    return 'A' + chars.join('');
}

/** The shared value of a field across seats, or undefined when they differ. */
function common<K extends keyof EditorSeat>(seats: EditorSeat[], field: K): EditorSeat[K] | undefined {
    if (seats.length === 0) return undefined;
    const first = seats[0][field];
    return seats.every((s) => s[field] === first) ? first : undefined;
}

export default function SeatingChartEditor({ chart, assignedSeatIds }: Readonly<Props>) {
    const { t } = useTranslation();
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const initial = useMemo(() => fromChart(chart), []); // eslint-disable-line react-hooks/exhaustive-deps

    const [sections, setSections] = useState<EditorSection[]>(initial.sections);
    const [seats, setSeats] = useState<EditorSeat[]>(initial.seats);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [mode, setMode] = useState<Mode>('select');
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(!chart.image_url);

    // Defaults for newly placed seats
    const [defaults, setDefaults] = useState({
        sectionKey: initial.sections[0]?.key ?? NO_SECTION,
        rowLabel: 'A',
        nextNumber: 1,
        seatsInRow: 10,
        memberPrice: '0',
        nonmemberPrice: '0',
    });

    const [rowStart, setRowStart] = useState<Point | null>(null);
    const [hoverPoint, setHoverPoint] = useState<Point | null>(null);
    const [marquee, setMarquee] = useState<{ start: Point; end: Point } | null>(null);

    const canvasRef = useRef<HTMLDivElement>(null);
    const assigned = useMemo(() => new Set(assignedSeatIds), [assignedSeatIds]);
    const sectionsByKey = useMemo(() => new Map(sections.map((s) => [s.key, s])), [sections]);
    const selectedSeats = useMemo(() => seats.filter((s) => selected.has(s.key)), [seats, selected]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Seating Charts', href: '/admin/seating-charts' },
        { title: chart.name, href: `/admin/seating-charts/${chart.id}/edit` },
    ];

    const changeSeats = useCallback((updater: (seats: EditorSeat[]) => EditorSeat[]) => {
        setSeats(updater);
        setDirty(true);
    }, []);

    const updateSelected = (patch: Partial<EditorSeat>) => {
        changeSeats((all) => all.map((s) => (selected.has(s.key) ? { ...s, ...patch } : s)));
    };

    // Warn before leaving with unsaved changes.
    useEffect(() => {
        if (!dirty) return;
        const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
        window.addEventListener('beforeunload', onBeforeUnload);
        const removeInertia = router.on('before', (event) => {
            if (event.detail.visit.method === 'get' && !confirm(t('You have unsaved seat changes. Leave without saving?'))) {
                event.preventDefault();
            }
        });
        return () => {
            window.removeEventListener('beforeunload', onBeforeUnload);
            removeInertia();
        };
    }, [dirty, t]);

    const labelsInUse = useCallback((except?: Set<string>) => {
        return new Set(seats.filter((s) => !except?.has(s.key)).map((s) => s.label.toUpperCase()));
    }, [seats]);

    /** Create seats at the given points, labelled from the current row/number defaults. */
    const placeSeats = (points: Point[]) => {
        const used = labelsInUse();
        let n = defaults.nextNumber;
        const created: EditorSeat[] = points.map((p) => {
            while (used.has(`${defaults.rowLabel}${n}`.toUpperCase())) n++;
            const label = `${defaults.rowLabel}${n}`;
            used.add(label.toUpperCase());
            n++;
            return {
                key: newKey(),
                id: null,
                label,
                x: Math.round(p.x * 1000) / 1000,
                y: Math.round(p.y * 1000) / 1000,
                section_key: defaults.sectionKey === NO_SECTION ? null : defaults.sectionKey,
                member_price: defaults.memberPrice || '0',
                nonmember_price: defaults.nonmemberPrice || '0',
                is_accessible: false,
                is_active: true,
            };
        });

        changeSeats((all) => [...all, ...created]);
        setSelected(new Set(created.map((s) => s.key)));
        return n;
    };

    const toPercent = (e: { clientX: number; clientY: number }) =>
        canvasRef.current ? pointToPercent(canvasRef.current, e.clientX, e.clientY) : { x: 0, y: 0 };

    const handleCanvasPointerDown = (e: React.PointerEvent) => {
        if (e.button !== 0) return;
        const point = toPercent(e);

        if (mode === 'seat') {
            const next = placeSeats([point]);
            setDefaults((d) => ({ ...d, nextNumber: next }));
            return;
        }

        if (mode === 'row') {
            if (!rowStart) {
                setRowStart(point);
                setHoverPoint(point);
                return;
            }
            const count = Math.max(1, Math.min(200, defaults.seatsInRow));
            const points = Array.from({ length: count }, (_, i) => {
                const f = count === 1 ? 0 : i / (count - 1);
                return { x: rowStart.x + (point.x - rowStart.x) * f, y: rowStart.y + (point.y - rowStart.y) * f };
            });
            placeSeats(points);
            setDefaults((d) => ({ ...d, rowLabel: nextRowLabel(d.rowLabel), nextNumber: 1 }));
            setRowStart(null);
            return;
        }

        // Select mode on empty canvas: start a marquee.
        const additive = e.shiftKey || e.metaKey || e.ctrlKey;
        const start = point;
        setMarquee({ start, end: start });

        const onMove = (ev: PointerEvent) => setMarquee({ start, end: toPercent(ev) });
        const onUp = (ev: PointerEvent) => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            const end = toPercent(ev);
            const [x0, x1] = [Math.min(start.x, end.x), Math.max(start.x, end.x)];
            const [y0, y1] = [Math.min(start.y, end.y), Math.max(start.y, end.y)];
            const inside = x1 - x0 > 0.3 || y1 - y0 > 0.3
                ? seats.filter((s) => s.x >= x0 && s.x <= x1 && s.y >= y0 && s.y <= y1).map((s) => s.key)
                : [];
            setSelected((prev) => new Set([...(additive ? prev : []), ...inside]));
            setMarquee(null);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    // Row preview follows the pointer.
    useEffect(() => {
        if (!rowStart) return;
        const onMove = (e: PointerEvent) => setHoverPoint(toPercent(e));
        window.addEventListener('pointermove', onMove);
        return () => window.removeEventListener('pointermove', onMove);
    }, [rowStart]);

    const handleSeatPointerDown = (seat: EditorSeat, e: React.PointerEvent) => {
        if (e.button !== 0) return;
        const additive = e.shiftKey || e.metaKey || e.ctrlKey;

        let nextSelection: Set<string>;
        if (additive) {
            nextSelection = new Set(selected);
            if (nextSelection.has(seat.key)) nextSelection.delete(seat.key);
            else nextSelection.add(seat.key);
        } else {
            nextSelection = selected.has(seat.key) ? selected : new Set([seat.key]);
        }
        setSelected(nextSelection);

        if (!nextSelection.has(seat.key)) return;

        // Drag the selection.
        const start = toPercent(e);
        const origins = new Map(seats.filter((s) => nextSelection.has(s.key)).map((s) => [s.key, { x: s.x, y: s.y }]));
        let moved = false;

        const onMove = (ev: PointerEvent) => {
            const p = toPercent(ev);
            const dx = p.x - start.x;
            const dy = p.y - start.y;
            if (!moved && Math.abs(dx) < 0.2 && Math.abs(dy) < 0.2) return;
            moved = true;
            changeSeats((all) => all.map((s) => {
                const o = origins.get(s.key);
                return o ? { ...s, x: clampPct(o.x + dx), y: clampPct(o.y + dy) } : s;
            }));
        };
        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    const deleteSelected = useCallback(() => {
        const blocked = selectedSeats.filter((s) => s.id !== null && assigned.has(s.id));
        const removable = new Set(selectedSeats.filter((s) => !blocked.includes(s)).map((s) => s.key));

        if (removable.size) changeSeats((all) => all.filter((s) => !removable.has(s.key)));
        setSelected(new Set(blocked.map((s) => s.key)));
        setNotice(blocked.length
            ? t('Seats :labels have been assigned in a season and cannot be deleted. Uncheck "Available" to take them out of service instead.', { labels: blocked.map((s) => s.label).join(', ') })
            : null);
    }, [selectedSeats, assigned, changeSeats, t]);

    // Keyboard: delete, nudge, escape.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) return;

            if (e.key === 'Escape') {
                setRowStart(null);
                setSelected(new Set());
                return;
            }
            if (selected.size === 0) return;

            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                deleteSelected();
                return;
            }

            const step = e.shiftKey ? 1 : 0.2;
            const delta: Record<string, Point> = {
                ArrowLeft: { x: -step, y: 0 }, ArrowRight: { x: step, y: 0 },
                ArrowUp: { x: 0, y: -step }, ArrowDown: { x: 0, y: step },
            };
            const d = delta[e.key];
            if (d) {
                e.preventDefault();
                changeSeats((all) => all.map((s) => (selected.has(s.key) ? { ...s, x: clampPct(s.x + d.x), y: clampPct(s.y + d.y) } : s)));
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [selected, deleteSelected, changeSeats]);

    const alignSelected = () => {
        const avgY = selectedSeats.reduce((sum, s) => sum + s.y, 0) / selectedSeats.length;
        updateSelected({ y: Math.round(avgY * 1000) / 1000 });
    };

    const distributeSelected = () => {
        const sorted = [...selectedSeats].sort((a, b) => a.x - b.x);
        if (sorted.length < 3) return;
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const positions = new Map(sorted.map((s, i) => {
            const f = i / (sorted.length - 1);
            return [s.key, { x: first.x + (last.x - first.x) * f, y: first.y + (last.y - first.y) * f }];
        }));
        changeSeats((all) => all.map((s) => (positions.has(s.key) ? { ...s, ...positions.get(s.key)! } : s)));
    };

    const [relabel, setRelabel] = useState({ row: 'A', start: 1 });
    const relabelSelected = () => {
        const sorted = [...selectedSeats].sort((a, b) => a.x - b.x);
        const used = labelsInUse(selected);
        const labels = new Map(sorted.map((s, i) => [s.key, `${relabel.row}${relabel.start + i}`]));
        const clash = [...labels.values()].find((l) => used.has(l.toUpperCase()));
        if (clash) {
            setNotice(t('Label :label is already used by another seat.', { label: clash }));
            return;
        }
        setNotice(null);
        changeSeats((all) => all.map((s) => (labels.has(s.key) ? { ...s, label: labels.get(s.key)! } : s)));
    };

    const addSection = () => {
        const key = newKey();
        setSections((all) => [...all, { key, id: null, name: t('New Section'), color: SECTION_COLORS[all.length % SECTION_COLORS.length] }]);
        setDefaults((d) => ({ ...d, sectionKey: d.sectionKey === NO_SECTION ? key : d.sectionKey }));
        setDirty(true);
    };

    const updateSection = (key: string, patch: Partial<EditorSection>) => {
        setSections((all) => all.map((s) => (s.key === key ? { ...s, ...patch } : s)));
        setDirty(true);
    };

    const removeSection = (key: string) => {
        setSections((all) => all.filter((s) => s.key !== key));
        changeSeats((all) => all.map((s) => (s.section_key === key ? { ...s, section_key: null } : s)));
        setDefaults((d) => ({ ...d, sectionKey: d.sectionKey === key ? NO_SECTION : d.sectionKey }));
    };

    const save = () => {
        const duplicate = findDuplicateLabel(seats);
        if (duplicate) {
            setNotice(t('Label :label is used by more than one seat.', { label: duplicate }));
            return;
        }
        setNotice(null);
        setSaving(true);

        router.put(`/admin/seating-charts/${chart.id}/layout`, {
            sections: sections.map(({ key, id, name, color }) => ({ key, id, name, color })),
            seats: seats.map(({ id, label, x, y, section_key, member_price, nonmember_price, is_accessible, is_active }) => ({
                id, label, x, y, section_key, member_price: member_price || '0', nonmember_price: nonmember_price || '0', is_accessible, is_active,
            })),
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                // Pick up database ids for newly created seats and sections.
                const fresh = fromChart((page.props as unknown as Props).chart);
                setSections(fresh.sections);
                setSeats(fresh.seats);
                setSelected(new Set());
                setDirty(false);
            },
            onFinish: () => setSaving(false),
        });
    };

    const errorMessages = Object.values(errors ?? {});
    const activeCount = seats.filter((s) => s.is_active).length;

    const overlay = (
        <>
            {marquee && (
                <div className="pointer-events-none absolute border border-primary bg-primary/10" style={{
                    left: `${Math.min(marquee.start.x, marquee.end.x)}%`,
                    top: `${Math.min(marquee.start.y, marquee.end.y)}%`,
                    width: `${Math.abs(marquee.end.x - marquee.start.x)}%`,
                    height: `${Math.abs(marquee.end.y - marquee.start.y)}%`,
                }} />
            )}
            {rowStart && hoverPoint && (
                <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <line x1={rowStart.x} y1={rowStart.y} x2={hoverPoint.x} y2={hoverPoint.y}
                        stroke="currentColor" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeDasharray="6 4" className="text-primary" />
                </svg>
            )}
        </>
    );

    const modeHint: Record<Mode, string> = {
        select: t('Click a seat to select it. Shift-click or drag a box to select several. Drag to move; arrow keys nudge; Delete removes.'),
        seat: t('Click the map to place a seat. Labels count up from the row and number below.'),
        row: rowStart
            ? t('Click where the row ends. :count seats will be spaced evenly.', { count: defaults.seatsInRow })
            : t('Click where the row starts, then where it ends.'),
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${chart.name} - ${t('Seat Map Editor')}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/seating-charts" aria-label={t('Back')}><ArrowLeft className="h-4 w-4" /></Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{chart.name}</h1>
                            <p className="text-sm text-muted-foreground">
                                {t(':count seats (:active available)', { count: seats.length, active: activeCount })}
                                {dirty && <span className="ml-2 font-medium text-amber-600">{t('Unsaved changes')}</span>}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setDetailsOpen(true)}>
                            <ImageUp className="mr-2 h-4 w-4" />{t('Details & Image')}
                        </Button>
                        <Button onClick={save} disabled={!dirty || saving}>
                            <Save className="mr-2 h-4 w-4" />{saving ? t('Saving...') : t('Save Layout')}
                        </Button>
                    </div>
                </div>

                <FlashMessages />
                {(notice || errorMessages.length > 0) && (
                    <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
                        {notice && <p>{notice}</p>}
                        {errorMessages.map((m) => <p key={m}>{m}</p>)}
                    </div>
                )}

                <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                    <div className="flex min-w-0 flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <ToggleGroup type="single" variant="outline" value={mode}
                                onValueChange={(v) => { if (v) { setMode(v as Mode); setRowStart(null); } }}>
                                <ToggleGroupItem value="select" aria-label={t('Select')} className="px-3">
                                    <MousePointer2 className="mr-1.5 h-4 w-4" />{t('Select')}
                                </ToggleGroupItem>
                                <ToggleGroupItem value="seat" aria-label={t('Add Seat')} className="px-3">
                                    <Armchair className="mr-1.5 h-4 w-4" />{t('Add Seat')}
                                </ToggleGroupItem>
                                <ToggleGroupItem value="row" aria-label={t('Add Row')} className="px-3">
                                    <Rows3 className="mr-1.5 h-4 w-4" />{t('Add Row')}
                                </ToggleGroupItem>
                            </ToggleGroup>
                            <p className="text-xs text-muted-foreground">{modeHint[mode]}</p>
                        </div>

                        <SeatMap
                            imageUrl={chart.image_url}
                            imageWidth={chart.image_width}
                            imageHeight={chart.image_height}
                            seats={seats}
                            canvasRef={canvasRef}
                            cursor={mode === 'select' ? 'default' : 'crosshair'}
                            onCanvasPointerDown={handleCanvasPointerDown}
                            onSeatPointerDown={handleSeatPointerDown}
                            overlay={overlay}
                            appearance={(seat) => {
                                const color = seat.section_key ? sectionsByKey.get(seat.section_key)?.color ?? UNSECTIONED_COLOR : UNSECTIONED_COLOR;
                                return {
                                    color,
                                    hollow: !seat.is_active,
                                    accessible: seat.is_accessible,
                                    title: `${seat.label}${seat.section_key ? ` - ${sectionsByKey.get(seat.section_key)?.name ?? ''}` : ''}`,
                                    className: selected.has(seat.key) ? 'ring-2 ring-offset-2 ring-foreground z-10' : undefined,
                                };
                            }}
                        />

                        <Legend items={[
                            ...sections.map((s) => ({ label: s.name, color: s.color })),
                            { label: t('No section'), color: UNSECTIONED_COLOR },
                            { label: t('Accessible'), color: UNSECTIONED_COLOR, round: true },
                            { label: t('Unavailable'), color: UNSECTIONED_COLOR, hollow: true },
                        ]} />
                    </div>

                    <div className="flex flex-col gap-4">
                        {selectedSeats.length > 0 ? (
                            <SelectionPanel
                                seats={selectedSeats}
                                sections={sections}
                                onChange={updateSelected}
                                onDelete={deleteSelected}
                                onAlign={alignSelected}
                                onDistribute={distributeSelected}
                                relabel={relabel}
                                setRelabel={setRelabel}
                                onRelabel={relabelSelected}
                            />
                        ) : (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">{t('New Seat Defaults')}</CardTitle>
                                    <CardDescription>{t('Applied to seats you add with the Add Seat and Add Row tools.')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <SectionSelect sections={sections} value={defaults.sectionKey}
                                        onChange={(v) => setDefaults((d) => ({ ...d, sectionKey: v }))} />
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="space-y-1">
                                            <Label htmlFor="row-label">{t('Row')}</Label>
                                            <Input id="row-label" value={defaults.rowLabel} maxLength={10}
                                                onChange={(e) => setDefaults((d) => ({ ...d, rowLabel: e.target.value.trim() }))} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="next-number">{t('Next #')}</Label>
                                            <Input id="next-number" type="number" min={1} value={defaults.nextNumber}
                                                onChange={(e) => setDefaults((d) => ({ ...d, nextNumber: Math.max(1, Number(e.target.value) || 1) }))} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="seats-in-row">{t('Per row')}</Label>
                                            <Input id="seats-in-row" type="number" min={1} max={200} value={defaults.seatsInRow}
                                                onChange={(e) => setDefaults((d) => ({ ...d, seatsInRow: Math.max(1, Number(e.target.value) || 1) }))} />
                                        </div>
                                    </div>
                                    <PriceInputs
                                        member={defaults.memberPrice}
                                        nonmember={defaults.nonmemberPrice}
                                        onMember={(v) => setDefaults((d) => ({ ...d, memberPrice: v }))}
                                        onNonmember={(v) => setDefaults((d) => ({ ...d, nonmemberPrice: v }))}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-base">{t('Sections')}</CardTitle>
                                <Button size="sm" variant="outline" onClick={addSection}><Plus className="mr-1 h-4 w-4" />{t('Add')}</Button>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {sections.length === 0 && (
                                    <p className="text-sm text-muted-foreground">{t('Group seats into sections such as Main Floor or Balcony.')}</p>
                                )}
                                {sections.map((section) => (
                                    <div key={section.key} className="flex items-center gap-2">
                                        <input type="color" value={section.color} aria-label={t('Section color')}
                                            className="h-9 w-9 shrink-0 cursor-pointer rounded border bg-transparent p-0.5"
                                            onChange={(e) => updateSection(section.key, { color: e.target.value })} />
                                        <Input value={section.name} aria-label={t('Section name')}
                                            onChange={(e) => updateSection(section.key, { name: e.target.value })} />
                                        <span className="w-8 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                                            {seats.filter((s) => s.section_key === section.key).length}
                                        </span>
                                        <Button size="icon" variant="ghost" className="shrink-0" aria-label={t('Remove section')}
                                            onClick={() => removeSection(section.key)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <ChartDetailsDialog chart={chart} open={detailsOpen} onOpenChange={setDetailsOpen} />
        </AppLayout>
    );
}

function clampPct(n: number) {
    return Math.round(Math.min(100, Math.max(0, n)) * 1000) / 1000;
}

function findDuplicateLabel(seats: EditorSeat[]): string | null {
    const seen = new Set<string>();
    for (const s of seats) {
        const label = s.label.trim().toUpperCase();
        if (seen.has(label)) return s.label;
        seen.add(label);
    }
    return null;
}

function SectionSelect({ sections, value, onChange, placeholder }: {
    sections: EditorSection[]; value: string | undefined; onChange: (v: string) => void; placeholder?: string;
}) {
    const { t } = useTranslation();
    return (
        <div className="space-y-1">
            <Label>{t('Section')}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
                <SelectContent>
                    <SelectItem value={NO_SECTION}>{t('No section')}</SelectItem>
                    {sections.map((s) => (
                        <SelectItem key={s.key} value={s.key}>
                            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />{s.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

function PriceInputs({ member, nonmember, onMember, onNonmember, placeholder }: {
    member: string; nonmember: string; onMember: (v: string) => void; onNonmember: (v: string) => void; placeholder?: string;
}) {
    const { t } = useTranslation();
    return (
        <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
                <Label htmlFor="member-price">{t('Member price')}</Label>
                <Input id="member-price" type="number" min={0} step="0.01" value={member} placeholder={placeholder}
                    onChange={(e) => onMember(e.target.value)} />
            </div>
            <div className="space-y-1">
                <Label htmlFor="nonmember-price">{t('Non-member price')}</Label>
                <Input id="nonmember-price" type="number" min={0} step="0.01" value={nonmember} placeholder={placeholder}
                    onChange={(e) => onNonmember(e.target.value)} />
            </div>
        </div>
    );
}

function SelectionPanel({ seats, sections, onChange, onDelete, onAlign, onDistribute, relabel, setRelabel, onRelabel }: {
    seats: EditorSeat[];
    sections: EditorSection[];
    onChange: (patch: Partial<EditorSeat>) => void;
    onDelete: () => void;
    onAlign: () => void;
    onDistribute: () => void;
    relabel: { row: string; start: number };
    setRelabel: (r: { row: string; start: number }) => void;
    onRelabel: () => void;
}) {
    const { t } = useTranslation();
    const single = seats.length === 1 ? seats[0] : null;
    const sectionKey = common(seats, 'section_key');
    const memberPrice = common(seats, 'member_price');
    const nonmemberPrice = common(seats, 'nonmember_price');
    const accessible = common(seats, 'is_accessible');
    const active = common(seats, 'is_active');
    const mixed = t('Mixed');

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">
                    {single ? t('Seat :label', { label: single.label }) : t(':count seats selected', { count: seats.length })}
                </CardTitle>
                <CardDescription>{t('Changes apply to every selected seat.')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {single && (
                    <div className="space-y-1">
                        <Label htmlFor="seat-label">{t('Label')}</Label>
                        <Input id="seat-label" value={single.label} maxLength={20} onChange={(e) => onChange({ label: e.target.value })} />
                    </div>
                )}

                <SectionSelect
                    sections={sections}
                    value={sectionKey === undefined ? undefined : (sectionKey ?? NO_SECTION)}
                    placeholder={mixed}
                    onChange={(v) => onChange({ section_key: v === NO_SECTION ? null : v })}
                />

                <PriceInputs
                    member={memberPrice ?? ''}
                    nonmember={nonmemberPrice ?? ''}
                    placeholder={mixed}
                    onMember={(v) => onChange({ member_price: v })}
                    onNonmember={(v) => onChange({ nonmember_price: v })}
                />

                <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={accessible === undefined ? 'indeterminate' : accessible}
                            onCheckedChange={(v) => onChange({ is_accessible: v === true })} />
                        {t('Accessible seat')}
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={active === undefined ? 'indeterminate' : active}
                            onCheckedChange={(v) => onChange({ is_active: v === true })} />
                        {t('Available for sale')}
                    </label>
                </div>

                {seats.length > 1 && (
                    <div className="space-y-2 border-t pt-3">
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1" onClick={onAlign}>
                                <AlignVerticalJustifyCenter className="mr-1 h-4 w-4" />{t('Align')}
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1" onClick={onDistribute} disabled={seats.length < 3}>
                                <AlignHorizontalSpaceAround className="mr-1 h-4 w-4" />{t('Space evenly')}
                            </Button>
                        </div>
                        <div className="flex items-end gap-2">
                            <div className="space-y-1">
                                <Label htmlFor="relabel-row" className="text-xs">{t('Relabel as row')}</Label>
                                <Input id="relabel-row" className="h-8" value={relabel.row}
                                    onChange={(e) => setRelabel({ ...relabel, row: e.target.value.trim() })} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="relabel-start" className="text-xs">{t('From #')}</Label>
                                <Input id="relabel-start" className="h-8" type="number" min={1} value={relabel.start}
                                    onChange={(e) => setRelabel({ ...relabel, start: Math.max(1, Number(e.target.value) || 1) })} />
                            </div>
                            <Button size="sm" variant="outline" onClick={onRelabel}>{t('Apply')}</Button>
                        </div>
                        <p className="text-xs text-muted-foreground">{t('Seats are numbered left to right.')}</p>
                    </div>
                )}

                <Button variant="destructive" size="sm" className="w-full" onClick={onDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />{seats.length === 1 ? t('Delete seat') : t('Delete seats')}
                </Button>
            </CardContent>
        </Card>
    );
}

function ChartDetailsDialog({ chart, open, onOpenChange }: { chart: SeatingChart; open: boolean; onOpenChange: (open: boolean) => void }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, progress } = useForm<{ _method: 'put'; name: string; description: string; image: File | null }>({
        _method: 'put',
        name: chart.name,
        description: chart.description ?? '',
        image: null,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(`/admin/seating-charts/${chart.id}`, {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setData('image', null);
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={submit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>{t('Chart Details')}</DialogTitle>
                        <DialogDescription>
                            {t('Upload a floor plan of the sanctuary (PNG, JPG or WebP). Seats are positioned relative to the image, so replacing it with one of the same proportions keeps them in place.')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-1">
                        <Label htmlFor="chart-name">{t('Name')}</Label>
                        <Input id="chart-name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="chart-description">{t('Description')}</Label>
                        <Textarea id="chart-description" rows={2} value={data.description} onChange={(e) => setData('description', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="chart-image">{chart.image_url ? t('Replace floor plan image') : t('Floor plan image')}</Label>
                        <Input id="chart-image" type="file" accept="image/png,image/jpeg,image/webp,image/gif"
                            onChange={(e) => setData('image', e.target.files?.[0] ?? null)} />
                        {errors.image && <p className="text-sm text-destructive">{errors.image}</p>}
                        {progress && <p className="text-xs text-muted-foreground">{t('Uploading...')} {progress.percentage}%</p>}
                        {!chart.image_url && <p className="text-xs text-muted-foreground">{t('You can also place seats on a blank grid and add an image later.')}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('Cancel')}</Button>
                        <Button type="submit" disabled={processing}>{t('Save')}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
