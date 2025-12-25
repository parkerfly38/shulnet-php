import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { useTorahReadings } from '@/hooks/use-torah-readings';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Gabbai Management', href: '/admin/gabbai' },
];

function formatDate(d: string) {
    return new Date(d).toLocaleDateString();
}

function nextSaturdayISO(fromDate = new Date()) {
    const d = new Date(fromDate);
    const day = d.getDay(); // 0 Sun ... 6 Sat
    let daysUntil = (6 - day + 7) % 7;
    if (daysUntil === 0) daysUntil = 7;
    d.setDate(d.getDate() + daysUntil);
    return d.toISOString().slice(0, 10);
}

export default function GabbaiDashboard() {
    const { data, loading, error, fetchTorahReadings } = useTorahReadings();
    const [assignments, setAssignments] = useState<Array<{ honor: string; member_name: string | null }>>([]);
    const [config, setConfig] = useState<{ triennial: boolean } | null>(null);
    const [viewDate, setViewDate] = useState<string>(() => nextSaturdayISO());

    const loadAssignments = useCallback(async (date: string) => {
        try {
            const res = await fetch(`/api/admin/gabbai/assignments?date=${date}`);
            if (res.ok) {
                const json = await res.json();
                setAssignments(json.map((it: any) => ({ honor: it.honor, member_name: it.member_name })));
            } else {
                setAssignments([]);
            }
        } catch (err) {
            setAssignments([]);
        }
    }, []);

    useEffect(() => {
        // fetch readings for selected date and load assignments
        fetchTorahReadings({ start: viewDate, end: viewDate }).catch(() => {});
        loadAssignments(viewDate);
        (async () => {
            try {
                const r = await fetch('/api/admin/gabbai/config');
                if (r.ok) setConfig(await r.json());
            } catch (e) {
                setConfig(null);
            }
        })();
    }, [fetchTorahReadings, loadAssignments, viewDate]);

    const upcomingParsha = data?.items?.find((i) => !!i.parshaNum || !!i.fullkriyah || !!i.summary) ?? null;

    const honors = useMemo(() => {
        const item = data?.items?.[0];
        if (!item) return [];
        if (config?.triennial && item.triennial && Object.keys(item.triennial).length) {
            return Object.keys(item.triennial).map((k) => ({ key: k, meta: item.triennial![k] }));
        }
        const map = item.fullkriyah ?? item.weekday ?? {};
        return Object.keys(map).map((k) => ({ key: k, meta: map[k] }));
    }, [data, config]);

    const triennialYear = useMemo(() => {
        const item = data?.items?.[0];
        if (!item) return null;
        return config?.triennial && item.triYear ? item.triYear : null;
    }, [data, config]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gabbai Dashboard" />

            <div className="p-4 space-y-4">
                <h1 className="text-2xl font-bold">Gabbai Dashboard</h1>
                {triennialYear && (
                    <div className="text-sm text-gray-600 mt-1">Triennial Year: {triennialYear}</div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 border">
                        <h2 className="text-lg font-semibold mb-3">Upcoming Parashah</h2>
                        {loading && <p>Loading parashah...</p>}
                        {error && <p className="text-red-500">{error}</p>}
                        {!loading && !error && upcomingParsha && (
                            <div>
                                <p className="font-medium text-lg">{upcomingParsha.name?.en} {upcomingParsha.name?.he ? `(${upcomingParsha.name.he})` : ''}</p>
                                {upcomingParsha.hdate && <p className="text-sm text-gray-500">{upcomingParsha.hdate} — {formatDate(upcomingParsha.date)}</p>}
                                {upcomingParsha.summary && <p className="mt-2">{upcomingParsha.summary}</p>}
                                {upcomingParsha.fullkriyah && <p className="mt-2 text-sm text-gray-500">Full kriyah available</p>}
                            </div>
                        )}
                        {!loading && !error && !upcomingParsha && <p>No parashah data available.</p>}
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
                            <h3 className="font-semibold">Upcoming Anniversaries & Bnai</h3>
                            <p className="text-sm text-gray-500 mt-2">See details on the <Link href="/admin/gabbai/anniversaries" className="text-blue-600">Anniversaries & Bnai page</Link>.</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
                            <h3 className="font-semibold">Assign Honors — Next Shabbos</h3>
                            <div className="mt-2">
                                <label className="block text-sm text-gray-500">View assignments for date</label>
                                <input type="date" value={viewDate} onChange={(e) => setViewDate(e.target.value)} className="mt-1 rounded border p-1" />
                                <div className="mt-2 text-sm">
                                    <Link href={`/admin/gabbai/honors?date=${viewDate}`} className="text-blue-600">Edit assignments for this date</Link>
                                </div>
                            </div>

                            <div className="mt-3">
                                <h4 className="font-medium">Assignments</h4>
                                {honors.length === 0 && <p className="text-sm text-gray-500">No honors found for this date.</p>}
                                <div className="mt-2 space-y-1">
                                    {honors.map((h) => {
                                        const found = assignments.find((a) => a.honor === h.key);
                                        return (
                                            <div key={h.key} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded border">
                                                <div>
                                                    <div className="font-medium">{h.key === 'M' ? 'Maftir' : `Aliyah ${h.key}`}</div>
                                                    <div className="text-xs text-gray-500">{h.meta.k} {h.meta.b}–{h.meta.e}</div>
                                                </div>
                                                <div className="text-sm text-gray-700 dark:text-gray-300">{found?.member_name ?? '— Unassigned —'}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
                            <h3 className="font-semibold">Pledges (Aliyah)</h3>
                            <p className="text-sm text-gray-500 mt-2">Pledges from Torah honors will appear here (based on invoice components labeled "Aliyah").</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
