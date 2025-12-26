import React, { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Eye, Edit } from 'lucide-react';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Subjects', href: '/admin/school/subjects' },
];

function fetchJson(url: string, opts: any = {}) {
    const tokenMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
    const token = tokenMeta?.content;
    const headers = Object.assign({ 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, opts.headers || {});
    if (token) headers['X-CSRF-TOKEN'] = token;
    return fetch(url, Object.assign({ credentials: 'same-origin', headers }, opts)).then((r) => r.ok ? r.json() : Promise.reject(r));
}

export default function SubjectsPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState<string>(new URLSearchParams(window.location.search).get('search') || '');
    const [page, setPage] = useState<number>(Number(new URLSearchParams(window.location.search).get('page')) || 1);
    const [perPage] = useState(25);
    const [total, setTotal] = useState(0);
    const [from, setFrom] = useState(0);
    const [to, setTo] = useState(0);
    const [lastPage, setLastPage] = useState(1);

    useEffect(() => { load(page, search); }, []);

    function load(p: number = 1, s: string = '') {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('page', String(p));
        params.set('per_page', String(perPage));
        if (s) params.set('q', s);
        fetchJson(`/api/admin/subjects?${params.toString()}`)
            .then((json) => {
                const list = Array.isArray(json.data) ? json.data : (json.data ?? []);
                setData(list);
                setTotal(Number(json.total ?? 0));
                setFrom(Number(json.from ?? 0));
                setTo(Number(json.to ?? 0));
                setLastPage(Number(json.last_page ?? 1));
                setPage(Number(json.current_page ?? p));
            })
            .catch(() => { setData([]); setTotal(0); setFrom(0); setTo(0); setLastPage(1); })
            .finally(() => setLoading(false));
    }

    function handleSearch(e: React.FormEvent) { e.preventDefault(); load(1, search); }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subjects" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Subjects</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Manage curriculum subjects</p>
                    </div>
                    <Link href="/admin/school/subjects/create"><Button className="flex items-center gap-2"><Plus className="h-4 w-4"/>Add Subject</Button></Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
                        <p className="text-sm text-gray-600">Total Subjects</p>
                        <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">{total}</p>
                    </div>
                </div>

                <div className="flex gap-4 items-end">
                    <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input type="text" placeholder="Search subjects by name, class, or teacher..." value={search} onChange={(e) => setSearch((e.target as HTMLInputElement).value)} className="pl-10" />
                        </div>
                        <Button type="submit" variant="outline">Search</Button>
                    </form>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">Showing {from || (data.length?1:0)} to {to || data.length} of {total} subjects</div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Class</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Teacher</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {data.length > 0 ? (
                                    data.map((it) => (
                                        <tr key={it.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{it.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{it.class_name ?? it.class_id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{it.teacher_name ?? it.teacher_id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex gap-2 justify-end">
                                                    <Link href={`/admin/school/subjects/${it.id}`}><Button variant="outline" size="sm"><Eye className="h-4 w-4"/></Button></Link>
                                                    <Link href={`/admin/school/subjects/${it.id}/edit`}><Button variant="outline" size="sm"><Edit className="h-4 w-4"/></Button></Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <div className="text-gray-500 dark:text-gray-400">No subjects found.</div>
                                            <Link href="/admin/school/subjects/create" className="mt-2 inline-block"><Button>Add your first subject</Button></Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {lastPage > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            {page > 1 && <Button variant="outline" onClick={() => load(page - 1, search)}>Previous</Button>}
                            {page < lastPage && <Button variant="outline" onClick={() => load(page + 1, search)}>Next</Button>}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Page {page} of {lastPage}</div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
