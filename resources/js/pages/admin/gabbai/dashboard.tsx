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

interface Anniversary {
    id: number;
    name: string;
    type: 'wedding' | 'bnai';
    date: string;
}

export default function GabbaiDashboard() {
    const { data, loading, error, fetchTorahReadings } = useTorahReadings();
    const [assignments, setAssignments] = useState<Array<{ honor: string; member_name: string | null }>>([]);
    const [config, setConfig] = useState<{ triennial: boolean } | null>(null);
    const [viewDate, setViewDate] = useState<string>(() => nextSaturdayISO());
    const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
    const [anniversariesLoading, setAnniversariesLoading] = useState(true);
    const [sefariaText, setSefariaText] = useState<string | null>(null);
    const [sefariaLoading, setSefariaLoading] = useState(false);

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

    const loadAnniversaries = useCallback(async () => {
        setAnniversariesLoading(true);
        try {
            const res = await fetch('/api/admin/gabbai/anniversaries');
            if (res.ok) {
                const json = await res.json();
                setAnniversaries(json);
            } else {
                setAnniversaries([]);
            }
        } catch (err) {
            setAnniversaries([]);
        } finally {
            setAnniversariesLoading(false);
        }
    }, []);

    const loadSefariaText = useCallback(async (parshaName: string) => {
        setSefariaLoading(true);
        setSefariaText(null);
        try {
            // Sefaria Calendar API: Get next reading info for a parsha
            // Format: parasha name, e.g., "Bereshit"
            const res = await fetch(`https://www.sefaria.org/api/calendars/next-read/${parshaName}`);
            
            if (res.ok) {
                const json = await res.json();
                // Extract description from the calendar response
                if (json.parasha.description.en) {
                    setSefariaText(json.parasha.description.en);
                } else if (json.summary) {
                    setSefariaText(json.summary);
                }
            }
        } catch (err) {
            console.error('Failed to fetch Sefaria text:', err);
        } finally {
            setSefariaLoading(false);
        }
    }, []);

    useEffect(() => {
        // fetch readings for selected date and load assignments
        fetchTorahReadings({ start: viewDate, end: viewDate }).catch(() => {});
        loadAssignments(viewDate);
        loadAnniversaries();
        (async () => {
            try {
                const r = await fetch('/api/admin/gabbai/config');
                if (r.ok) setConfig(await r.json());
            } catch (e) {
                setConfig(null);
            }
        })();
    }, [fetchTorahReadings, loadAssignments, loadAnniversaries, viewDate]);

    const upcomingParsha = data?.items?.find((i) => !!i.parshaNum || !!i.fullkriyah || !!i.summary) ?? null;

    // Load Sefaria text when parsha data changes
    useEffect(() => {
        if (upcomingParsha?.name?.en) {
            loadSefariaText(upcomingParsha.name.en);
        }
    }, [upcomingParsha?.name?.en, loadSefariaText]);

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
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 bg-white dark:bg-black rounded-lg p-6 border">
                        <h2 className="text-lg font-semibold mb-3">Upcoming Parashah</h2>
                        {triennialYear && (
                            <h2 className="text-md font-semibold mb-3">Using Triennial Year: {triennialYear}</h2>
                        )}
                        {loading && <p>Loading parashah...</p>}
                        {error && (
                            <div>
                                <p className="text-red-500 mb-2">{error}</p>
                                <p className="text-sm text-gray-500">Unable to fetch Torah reading data from Hebcal API. Please check your internet connection or try again later.</p>
                            </div>
                        )}
                        {!loading && !error && upcomingParsha && (
                            <div>
                                <p className="font-medium text-lg">{upcomingParsha.name?.en} {upcomingParsha.name?.he ? `(${upcomingParsha.name.he})` : ''}</p>
                                {upcomingParsha.hdate && <p className="text-sm text-gray-500">{upcomingParsha.hdate} — {formatDate(upcomingParsha.date)}</p>}
                                {upcomingParsha.summary && <p className="mt-2 text-sm">{upcomingParsha.summary}</p>}
                                {upcomingParsha.fullkriyah && <p className="mt-2 text-sm text-gray-500">Full kriyah available</p>}
                                
                                {/* Sefaria Summary */}
                                <div className="mt-4 pt-4 border-t">
                                    <h3 className="text-sm font-semibold mb-2">Summary from Sefaria</h3>
                                    {sefariaLoading && <p className="text-sm text-gray-500 italic">Loading summary...</p>}
                                    {!sefariaLoading && sefariaText && (
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{sefariaText}</p>
                                    )}
                                    {!sefariaLoading && !sefariaText && (
                                        <p className="text-sm text-gray-500 italic">No summary available from Sefaria</p>
                                    )}
                                    {upcomingParsha.name?.en && (
                                        <a 
                                            href={`https://www.sefaria.org/Parashat_${upcomingParsha.name.en.replace(/\s+/g, '_')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                                        >
                                            Read full text on Sefaria →
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                        {!loading && !error && !upcomingParsha && data && (
                            <div>
                                <p className="text-gray-500 mb-2">No parashah data available for the selected date.</p>
                                <p className="text-sm text-gray-500">Received {data.items?.length || 0} items from API. Date range: {data.range?.start} to {data.range?.end}</p>
                            </div>
                        )}
                        {!loading && !error && !upcomingParsha && !data && (
                            <p className="text-gray-500">No parashah data available. The API request may not have completed.</p>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white dark:bg-black rounded-lg p-6 border">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold">Upcoming Anniversaries & Bnai</h3>
                                <Link href="/admin/gabbai/anniversaries" className="text-sm text-blue-600">View all</Link>
                            </div>
                            {anniversariesLoading && <p className="text-sm text-gray-500">Loading...</p>}
                            {!anniversariesLoading && anniversaries.length === 0 && (
                                <p className="text-sm text-gray-500">No upcoming anniversaries or bnai mitzvah dates in the next 30 days.</p>
                            )}
                            {!anniversariesLoading && anniversaries.length > 0 && (
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {anniversaries.slice(0, 10).map((item) => (
                                        <div key={`${item.type}-${item.id}-${item.date}`} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded border">
                                            <div>
                                                <div className="font-medium text-sm">{item.name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {item.type === 'wedding' ? 'Anniversary' : 'Bnai Mitzvah'}
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                {formatDate(item.date)}
                                            </div>
                                        </div>
                                    ))}
                                    {anniversaries.length > 10 && (
                                        <p className="text-xs text-gray-500 text-center pt-2">
                                            ...and {anniversaries.length - 10} more
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-black rounded-lg p-6 border">
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
                                            <div key={h.key} className="flex items-center justify-between bg-white dark:bg-black p-2 rounded border">
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

                        <div className="bg-white dark:bg-black rounded-lg p-6 border">
                            <h3 className="font-semibold">Pledges (Aliyah)</h3>
                            <p className="text-sm text-gray-500 mt-2">Pledges from Torah honors will appear here (based on invoice components labeled "Aliyah").</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
