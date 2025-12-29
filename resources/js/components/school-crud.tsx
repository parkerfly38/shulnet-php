import React from 'react';

type Field = {
    name: string;
    label?: string;
    type?: 'text' | 'number' | 'date' | 'select' | 'textarea';
    optionsEndpoint?: string; // for select
};

function fetchJson(url: string, opts: any = {}) {
    const tokenMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
    const token = tokenMeta?.content;
    const headers = Object.assign({ 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, opts.headers || {});
    if (token) headers['X-CSRF-TOKEN'] = token;
    return fetch(url, Object.assign({ credentials: 'same-origin', headers }, opts)).then((r) => r.ok ? r.json() : Promise.reject(r));
}

export default function SchoolCrud({ title, endpoint, fields }: { title: string; endpoint: string; fields: Field[] }) {
    const [items, setItems] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [editing, setEditing] = React.useState<any | null>(null);
    const [open, setOpen] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [options, setOptions] = React.useState<Record<string, any[]>>({});
    const [query, setQuery] = React.useState('');
    const [page, setPage] = React.useState(1);
    const pageSize = 25;
    const [total, setTotal] = React.useState(0);
    const [totalPages, setTotalPages] = React.useState(1);

    React.useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    // load when endpoint, page, or query change (debounce query)
    React.useEffect(() => {
        const t = setTimeout(() => load(), 300);
        return () => clearTimeout(t);
    }, [endpoint, page, query]);

    React.useEffect(() => {
        // preload select options
        fields.forEach((f) => {
            if (f.type === 'select' && f.optionsEndpoint) {
                fetchJson(`${f.optionsEndpoint}?per_page=1000`)
                    .then((json) => {
                        const list = Array.isArray(json) ? json : (json.data ?? []);
                        setOptions((s) => ({ ...s, [f.name]: list }));
                    })
                    .catch(() => {});
            }
        });
    }, [fields]);

    function load() {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('per_page', String(pageSize));
        if (query) params.set('q', query);
        fetchJson(`${endpoint}?${params.toString()}`)
            .then((json) => {
                if (json && Array.isArray(json.data)) {
                    setItems(json.data);
                    const t = Number(json.total ?? json.total ?? 0);
                    const tp = Number(json.last_page ?? Math.max(1, Math.ceil(t / pageSize)));
                    setTotal(t);
                    setTotalPages(tp);
                } else if (Array.isArray(json)) {
                    setItems(json);
                    setTotal(json.length);
                    setTotalPages(Math.max(1, Math.ceil(json.length / pageSize)));
                } else {
                    setItems([]);
                    setTotal(0);
                    setTotalPages(1);
                }
            })
            .catch(() => {
                setItems([]);
                setTotal(0);
                setTotalPages(1);
            })
            .finally(() => setLoading(false));
    }

    function openCreate() {
        const initial: any = {};
        fields.forEach((f) => (initial[f.name] = ''));
        setEditing(initial);
        setOpen(true);
    }

    function openEdit(item: any) {
        setEditing(item);
        setOpen(true);
    }

    async function doSave() {
        if (!editing) return;
        setSaving(true);
        try {
            if (editing.id) {
                await fetchJson(`${endpoint}/${editing.id}`, { method: 'PUT', body: JSON.stringify(editing) });
            } else {
                await fetchJson(endpoint, { method: 'POST', body: JSON.stringify(editing) });
            }
            setOpen(false);
            setEditing(null);
            load();
        } catch (e) {
            console.error(e);
            alert('Save failed');
        } finally {
            setSaving(false);
        }
    }

    async function doDelete(id: number) {
        if (!confirm('Delete item?')) return;
        try {
            await fetchJson(`${endpoint}/${id}`, { method: 'DELETE' });
            load();
        } catch (e) {
            console.error(e);
            alert('Delete failed');
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <div className="text-sm text-gray-500">Endpoint: {endpoint}</div>
                </div>
                <div className="flex items-center gap-3">
                    <input placeholder="Search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} className="border rounded p-1" />
                    <button onClick={openCreate} className="px-3 py-1 bg-blue-600 text-white rounded">Create</button>
                </div>
            </div>

            {loading && <p>Loading…</p>}

            {!loading && items.length === 0 && <p className="text-sm text-gray-500">No items found.</p>}

            {!loading && items.length > 0 && (
                <div>
                    {/* table */}
                    <div className="overflow-x-auto bg-white dark:bg-black rounded border">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left">
                                    <th className="p-2">#</th>
                                    {fields.slice(0, 4).map((f) => (
                                        <th key={f.name} className="p-2">{f.label ?? f.name}</th>
                                    ))}
                                    <th className="p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items
                                    .map((it, idx) => (
                                        <tr key={it.id} className="border-t">
                                            <td className="p-2 align-top">{(page - 1) * pageSize + idx + 1}</td>
                                            {fields.slice(0, 4).map((f) => (
                                                <td key={f.name} className="p-2 align-top">
                                                    {f.type === 'select' ? (options[f.name] || []).find((o: any) => String(o.id) === String(it[f.name]))?.name ?? it[f.name] : String(it[f.name] ?? '')}
                                                </td>
                                            ))}
                                            <td className="p-2 align-top">
                                                <div className="flex gap-2">
                                                    <button onClick={() => openEdit(it)} className="px-2 py-1 bg-yellow-500 text-white rounded">Edit</button>
                                                    <button onClick={() => doDelete(it.id)} className="px-2 py-1 bg-red-600 text-white rounded">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    {/* pagination */}
                    <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm text-gray-600">Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} of {total}</div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-2 py-1 border rounded disabled:opacity-50">Prev</button>
                            <div className="text-sm">Page {page} of {totalPages}</div>
                            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-2 py-1 border rounded disabled:opacity-50">Next</button>
                        </div>
                    </div>
                </div>
            )}

            {open && editing && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white dark:bg-black p-4 rounded w-full max-w-2xl">
                        <h2 className="text-lg font-semibold mb-2">{editing.id ? 'Edit' : 'Create'}</h2>
                        <div className="space-y-3">
                            {fields.map((f) => (
                                <div key={f.name}>
                                    <label className="block text-sm font-medium mb-1">{f.label ?? f.name}</label>
                                    {f.type === 'textarea' ? (
                                        <textarea value={editing[f.name] ?? ''} onChange={(e) => setEditing({ ...editing, [f.name]: e.target.value })} className="w-full rounded border p-2" />
                                    ) : f.type === 'select' ? (
                                        <select value={editing[f.name] ?? ''} onChange={(e) => setEditing({ ...editing, [f.name]: e.target.value })} className="w-full rounded border p-2">
                                            <option value="">—</option>
                                            {(options[f.name] || []).map((opt: any) => (
                                                <option key={opt.id} value={opt.id}>{opt.name ?? opt.first_name ?? opt.last_name ?? opt.id}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'} value={editing[f.name] ?? ''} onChange={(e) => setEditing({ ...editing, [f.name]: e.target.value })} className="w-full rounded border p-2" />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex gap-2 justify-end">
                            <button onClick={() => { setOpen(false); setEditing(null); }} className="px-3 py-1">Cancel</button>
                            <button onClick={doSave} disabled={saving} className="px-3 py-1 bg-blue-600 text-white rounded">{saving ? 'Saving…' : 'Save'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
