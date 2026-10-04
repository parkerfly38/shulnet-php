import { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

interface MemberOption {
    id: number;
    first_name: string;
    last_name: string;
    hebrew_name?: string;
}

interface Props {
    id?: string;
    members: MemberOption[];
    value: string;
    onChange: (value: string) => void;
    hasError?: boolean;
}

export default function MemberCombobox({ id, members, value, onChange, hasError }: Props) {
    const selected = members.find((m) => m.id.toString() === value);
    const selectedLabel = selected ? `${selected.first_name} ${selected.last_name}` : '';

    const [query, setQuery] = useState(selectedLabel);
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setQuery(selectedLabel);
    }, [selectedLabel]);

    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (containerRef.current && e.target instanceof Node && !containerRef.current.contains(e.target)) {
                setOpen(false);
                setQuery(selectedLabel);
            }
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [selectedLabel]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q || query === selectedLabel) return members;
        return members.filter((m) =>
            `${m.first_name} ${m.last_name}`.toLowerCase().includes(q) ||
            (m.hebrew_name ?? '').toLowerCase().includes(q)
        );
    }, [members, query, selectedLabel]);

    return (
        <div ref={containerRef} className="relative">
            <Input
                id={id}
                type="text"
                autoComplete="off"
                placeholder="Search by name or Hebrew name..."
                value={query}
                className={hasError ? 'border-red-500' : ''}
                onFocus={() => setOpen(true)}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                    if (value) onChange('');
                }}
            />
            {open && (
                <div className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-white shadow-lg dark:bg-gray-800">
                    {filtered.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">No members found</div>
                    ) : (
                        filtered.map((m) => (
                            <button
                                key={m.id}
                                type="button"
                                className="w-full border-b px-3 py-2 text-left last:border-b-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => {
                                    onChange(m.id.toString());
                                    setQuery(`${m.first_name} ${m.last_name}`);
                                    setOpen(false);
                                }}
                            >
                                <div>{m.first_name} {m.last_name}</div>
                                {m.hebrew_name && <div className="text-sm text-gray-600">{m.hebrew_name}</div>}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
