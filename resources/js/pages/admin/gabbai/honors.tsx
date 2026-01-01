import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { useTorahReadings } from '@/hooks/use-torah-readings';
import AsyncMemberSelect from '@/components/async-member-select';
import Toast from '@/components/toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Gabbai Management', href: '/admin/gabbai' },
    { title: 'Assign Honors', href: '/admin/gabbai/honors' },
];

function nextSaturdayISO(fromDate = new Date()) {
    const d = new Date(fromDate);
    const day = d.getDay();
    let daysUntil = (6 - day + 7) % 7;
    if (daysUntil === 0) daysUntil = 7;
    d.setDate(d.getDate() + daysUntil);
    return d.toISOString().slice(0, 10);
}

export default function GabbaiHonors() {
    const [date, setDate] = useState<string>(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const q = params.get('date');
            return q ?? nextSaturdayISO();
        } catch (e) {
            return nextSaturdayISO();
        }
    });
    const { data, loading, error, fetchTorahReadings } = useTorahReadings();
    const [config, setConfig] = useState<{ triennial: boolean } | null>(null);
    const [members, setMembers] = useState<Array<any>>([]);
    const [assignments, setAssignments] = useState<Record<string, number | null>>({});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const loadMembers = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/members/search?limit=200');
            if (res.ok) {
                const json = await res.json();
                setMembers(json);
            }
        } catch (err) {
            // ignore
        }
    }, []);

    const loadAssignments = useCallback(async (d: string) => {
        try {
            const res = await fetch(`/api/admin/gabbai/assignments?date=${d}`);
            if (res.ok) {
                const json = await res.json();
                const map: Record<string, number | null> = {};
                json.forEach((it: any) => {
                    map[it.honor] = it.member_id;
                });
                setAssignments(map);
            }
        } catch (err) {
            // ignore
        }
    }, []);


    useEffect(() => {
        loadMembers();
    }, [loadMembers]);

    useEffect(() => {
        // fetch hebcal for date (single day)
        fetchTorahReadings({ start: date, end: date }).catch(() => {});
        // fetch config
        (async () => {
            try {
                const r = await fetch('/api/admin/gabbai/config');
                if (r.ok) setConfig(await r.json());
            } catch (e) {
                setConfig(null);
            }
        })();
        loadAssignments(date);
    }, [date, fetchTorahReadings, loadAssignments]);

    const honors = useMemo(() => {
        const items = data?.items?.[0];
        if (!items) return [];
        // if triennial setting is enabled, prefer triennial readings
        if (config?.triennial && items.triennial && Object.keys(items.triennial).length) {
            return Object.keys(items.triennial).map((k) => ({ key: k, meta: items.triennial![k] }));
        }
        // prefer fullkriyah, fallback to weekday
        const map = items.fullkriyah ?? items.weekday ?? {};
        return Object.keys(map).map((k) => ({ key: k, meta: map[k] }));
    }, [data, config]);

    const triennialYear = useMemo(() => {
        const items = data?.items?.[0];
        if (!items) return null;
        return config?.triennial && items.triYear ? items.triYear : null;
    }, [data, config]);

    const setAssignment = (honor: string, memberId: number | null) => {
        setAssignments((prev) => ({ ...prev, [honor]: memberId }));
    };

    const save = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const payload = {
                date,
                assignments: Object.keys(assignments).map((honor) => ({ honor, member_id: assignments[honor] })),
            };
            const token = document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/api/admin/gabbai/assignments', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setMessage('Assignments saved');
            } else {
                const json = await res.json();
                setMessage('Error saving: ' + (json.message || JSON.stringify(json)));
            }
        } catch (err) {
            setMessage((err as Error).message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assign Torah Honors" />

            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Assign Torah Honors</h1>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-48 rounded-md border" />
                </div>

                {triennialYear && (
                    <div className="mb-4">
                        <span className="text-sm text-gray-600">Triennial Year: {triennialYear}</span>
                    </div>
                )}

                {loading && <p>Loading readings...</p>}
                {error && <p className="text-red-500">{error}</p>}

                <div className="space-y-3">
                    {honors.length === 0 && <p className="text-sm text-gray-500">No honors found for this date.</p>}
                    {honors.map((h) => (
                        <div key={h.key} className="flex items-center gap-4 bg-white dark:bg-black p-3 rounded border">
                            <div className="w-40">
                                <div className="font-medium">{h.key === 'M' ? 'Maftir' : `Aliyah ${h.key}`}</div>
                                <div className="text-sm text-gray-500">{h.meta.k} {h.meta.b} - {h.meta.e}</div>
                            </div>

                            <div className="flex-1">
                                <AsyncMemberSelect
                                    value={assignments[h.key] ?? null}
                                    onChange={(id) => setAssignment(h.key, id)}
                                    placeholder={`Assign Aliyah ${h.key}...`}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    <button onClick={async () => { await save(); if (message) setToast(message); }} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? 'Saving…' : 'Save Assignments'}</button>
                    {message && <span className="ml-3 text-sm text-gray-600">{message}</span>}
                </div>

                {toast && <Toast message={toast} onClose={() => setToast(null)} />}
            </div>
        </AppLayout>
    );
}
