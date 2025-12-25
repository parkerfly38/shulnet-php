import React, { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Gabbai Management', href: '/admin/gabbai' },
    { title: 'Anniversaries & Bnai', href: '/admin/gabbai/anniversaries' },
];

interface MemberAnniversary {
    id: number;
    name: string;
    date: string; // ISO
    type: 'wedding' | 'bnai';
}

export default function GabbaiAnniversaries() {
    const [items, setItems] = useState<MemberAnniversary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Placeholder: try to load from a presumed API endpoint. Replace with real endpoint as needed.
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetch('/admin/api/gabbai/anniversaries');
                if (res.ok) {
                    const json = await res.json();
                    setItems(json as MemberAnniversary[]);
                } else {
                    // no API - show empty state
                    setItems([]);
                }
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Anniversaries & Bnai" />

            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Anniversaries & Bnai</h1>

                {loading && <p>Loading...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {!loading && items.length === 0 && <p className="text-sm text-gray-500">No upcoming items found. If you have an API, point this page to it at <code>/admin/api/gabbai/anniversaries</code>.</p>}

                {items.length > 0 && (
                    <div className="space-y-2">
                        {items.map((it) => (
                            <div key={it.id} className="bg-white dark:bg-gray-800 p-4 rounded border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{it.name}</p>
                                        <p className="text-sm text-gray-500">{new Date(it.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-sm text-gray-600">{it.type === 'wedding' ? 'Wedding Anniversary' : 'Bnai Mitzvah'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </AppLayout>
    );
}
