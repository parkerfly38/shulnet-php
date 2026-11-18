import { useTranslation } from '@/hooks/use-translation';
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

interface SavedAssignment {
    id: number;
    honor: string;
    member_id: number | null;
    member_name: string | null;
    has_email: boolean;
    notified_at: string | null;
    reminded_at: string | null;
}

interface EmailResult {
    sent: number;
    no_email: string[];
    failed: string[];
}

function nextSaturdayISO(fromDate = new Date()) {
    const d = new Date(fromDate);
    const day = d.getDay();
    let daysUntil = (6 - day + 7) % 7;
    if (daysUntil === 0) daysUntil = 7;
    d.setDate(d.getDate() + daysUntil);
    // Local date, not toISOString(): that's UTC, which turns an evening Saturday in the Americas into Sunday.
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function csrfToken(): string {
    return document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

async function postJson(url: string, body: unknown) {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-TOKEN': csrfToken(),
        },
        body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(json.message || JSON.stringify(json.errors ?? json));
    }
    return json;
}

function formatShortDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function GabbaiHonors() {
    const { t } = useTranslation();
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
    const [assignments, setAssignments] = useState<Record<string, number | null>>({});
    const [saved, setSaved] = useState<Record<string, SavedAssignment>>({});
    const [dirty, setDirty] = useState(false);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const loadAssignments = useCallback(async (d: string) => {
        try {
            const res = await fetch(`/api/admin/gabbai/assignments?date=${d}`);
            if (res.ok) {
                const json: SavedAssignment[] = await res.json();
                const map: Record<string, number | null> = {};
                const byHonor: Record<string, SavedAssignment> = {};
                json.forEach((it) => {
                    map[it.honor] = it.member_id;
                    byHonor[it.honor] = it;
                });
                setAssignments(map);
                setSaved(byHonor);
                setDirty(false);
            }
        } catch (err) {
            // ignore
        }
    }, []);

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

    const reading = data?.items?.[0];

    const honors = useMemo(() => {
        if (!reading) return [];
        // if triennial setting is enabled, prefer triennial readings
        if (config?.triennial && reading.triennial && Object.keys(reading.triennial).length) {
            return Object.keys(reading.triennial).map((k) => ({ key: k, meta: reading.triennial![k] }));
        }
        // prefer fullkriyah, fallback to weekday
        const map = reading.fullkriyah ?? reading.weekday ?? {};
        return Object.keys(map).map((k) => ({ key: k, meta: map[k] }));
    }, [reading, config]);

    const triennialYear = config?.triennial && reading?.triYear ? reading.triYear : null;

    const assignedCount = Object.values(saved).filter((s) => s.member_id).length;

    const setAssignment = (honor: string, memberId: number | null) => {
        setAssignments((prev) => ({ ...prev, [honor]: memberId }));
        setDirty(true);
    };

    // One line summing up an email run, e.g. "Emailed 3. No email on file: Sam Levy."
    const describe = (verb: string, result: EmailResult) => {
        const parts = [t(verb, { count: result.sent })];
        if (result.no_email.length) parts.push(t('No email on file: :names.', { names: result.no_email.join(', ') }));
        if (result.failed.length) parts.push(t('Failed to send to: :names.', { names: result.failed.join(', ') }));
        return parts.join(' ');
    };

    const finish = (text: string) => {
        setMessage(text);
        setToast(text);
    };

    const save = async (notify: boolean) => {
        setBusy(true);
        setMessage(null);
        try {
            const meta = Object.fromEntries(honors.map((h) => [h.key, h.meta]));
            const payload = {
                date,
                notify,
                assignments: Object.keys(assignments).map((honor) => ({
                    honor,
                    member_id: assignments[honor],
                    portion: reading?.name?.en ?? null,
                    reading: meta[honor] ? `${meta[honor].k} ${meta[honor].b}-${meta[honor].e}` : null,
                })),
            };
            const json = await postJson('/api/admin/gabbai/assignments', payload);
            await loadAssignments(date);
            finish(json.notified ? `${t('Assignments saved.')} ${describe('Emailed :count honoree(s).', json.notified)}` : t('Assignments saved.'));
        } catch (err) {
            finish(t('Error saving: :error', { error: (err as Error).message }));
        } finally {
            setBusy(false);
        }
    };

    const sendReminders = async () => {
        if (!window.confirm(t('Email a reminder to everyone with an honor on this date?'))) return;
        setBusy(true);
        setMessage(null);
        try {
            const json = await postJson('/api/admin/gabbai/reminders', { date });
            await loadAssignments(date);
            finish(describe('Sent :count reminder(s).', json.reminded));
        } catch (err) {
            finish(t('Error sending reminders: :error', { error: (err as Error).message }));
        } finally {
            setBusy(false);
        }
    };

    const printLetters = (type: 'notice' | 'reminder') => {
        window.open(`/admin/gabbai/honors/letters?date=${date}&type=${type}`, '_blank');
    };

    const rowStatus = (honor: string) => {
        const s = saved[honor];
        if (!s?.member_id || s.member_id !== assignments[honor]) return null;
        if (!s.has_email) return <span className="text-amber-600">{t('No email on file')}</span>;
        const parts: string[] = [];
        if (s.notified_at) parts.push(t('Emailed :date', { date: formatShortDate(s.notified_at) }));
        if (s.reminded_at) parts.push(t('Reminded :date', { date: formatShortDate(s.reminded_at) }));
        return parts.length ? <span className="text-green-700 dark:text-green-400">{parts.join(' · ')}</span> : <span className="text-gray-500">{t('Not emailed yet')}</span>;
    };

    const secondary = 'px-4 py-2 rounded border bg-white dark:bg-black disabled:opacity-50';
    const savedActionsDisabled = busy || dirty || assignedCount === 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Assign Torah Honors')} />

            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">{t('Assign Torah Honors')}</h1>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">{t('Date')}</label>
                    <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setMessage(null); }} className="mt-1 block w-48 rounded-md border" />
                </div>

                {triennialYear && (
                    <div className="mb-4">
                        <span className="text-sm text-gray-600">Triennial Year: {triennialYear}</span>
                    </div>
                )}

                {loading && <p>{t('Loading readings...')}</p>}
                {error && <p className="text-red-500">{error}</p>}

                <div className="space-y-3">
                    {honors.length === 0 && <p className="text-sm text-gray-500">{t('No honors found for this date.')}</p>}
                    {honors.map((h) => (
                        <div key={h.key} className="flex flex-wrap items-center gap-4 bg-white dark:bg-black p-3 rounded border">
                            <div className="w-40">
                                <div className="font-medium">{h.key === 'M' ? 'Maftir' : `Aliyah ${h.key}`}</div>
                                <div className="text-sm text-gray-500">{h.meta.k} {h.meta.b} - {h.meta.e}</div>
                            </div>

                            <div className="flex-1 min-w-48">
                                <AsyncMemberSelect
                                    value={assignments[h.key] ?? null}
                                    onChange={(id) => setAssignment(h.key, id)}
                                    placeholder={`Assign Aliyah ${h.key}...`}
                                />
                            </div>

                            <div className="w-48 text-sm">{rowStatus(h.key)}</div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button onClick={() => save(false)} disabled={busy} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
                        {busy ? t('Working…') : t('Save Assignments')}
                    </button>
                    <button
                        onClick={() => save(true)}
                        disabled={busy}
                        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                        title={t('Saves, then emails honorees who are new or whose honor changed')}
                    >
                        {t('Save & Notify')}
                    </button>
                    <button onClick={sendReminders} disabled={savedActionsDisabled} className={secondary}>
                        {t('Email Reminders')}
                    </button>
                    <button onClick={() => printLetters('notice')} disabled={savedActionsDisabled} className={secondary}>
                        {t('Print Letters')}
                    </button>
                    <button onClick={() => printLetters('reminder')} disabled={savedActionsDisabled} className={secondary}>
                        {t('Print Reminders')}
                    </button>
                </div>

                {dirty && assignedCount > 0 && (
                    <p className="mt-2 text-sm text-amber-600">{t('Save your changes before emailing reminders or printing letters.')}</p>
                )}
                {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}

                {toast && <Toast message={toast} onClose={() => setToast(null)} />}
            </div>
        </AppLayout>
    );
}
