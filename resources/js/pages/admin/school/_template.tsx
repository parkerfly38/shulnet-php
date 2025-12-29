import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

type Props = { title: string; endpoint: string };

export default function SchoolIndex({ title, endpoint }: Props) {
    const [items, setItems] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        let mounted = true;
        setLoading(true);
        fetch(endpoint)
            .then((r) => r.ok ? r.json() : [])
            .then((json) => { if (mounted) setItems(json); })
            .catch(() => { if (mounted) setItems([]); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, [endpoint]);

    return (
        <AppLayout>
            <Head title={title} />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">{title}</h1>
                {loading && <p>Loading…</p>}
                {!loading && items.length === 0 && <p className="text-sm text-gray-500">No items found.</p>}
                {!loading && items.length > 0 && (
                    <div className="space-y-2">
                        {items.slice(0, 50).map((it: any) => (
                            <div key={it.id ?? JSON.stringify(it)} className="p-2 border rounded bg-white dark:bg-black">
                                <pre className="text-xs">{JSON.stringify(it, null, 2)}</pre>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
