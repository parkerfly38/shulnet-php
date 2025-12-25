import React, { useEffect, useRef, useState } from 'react';

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
}

interface Props {
  value?: number | null;
  onChange: (id: number | null) => void;
  placeholder?: string;
}

export default function AsyncMemberSelect({ value = null, onChange, placeholder = 'Search members...' }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Member[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [highlighted, setHighlighted] = useState<number>(-1);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!query) {
      setResults([]);
      return;
    }
    setLoading(true);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/members/search?q=${encodeURIComponent(query)}&limit=20`);
        if (res.ok) {
          const json = await res.json();
          setResults(json);
          setOpen(true);
          setHighlighted(json.length ? 0 : -1);
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const onDocClick = (ev: MouseEvent) => {
      if (!open) return;
      if (!containerRef.current) return;
      if (!(ev.target instanceof Node)) return;
      if (!containerRef.current.contains(ev.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true);
      e.preventDefault();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlighted >= 0 && results[highlighted]) {
        const m = results[highlighted];
        onChange(m.id);
        setQuery(`${m.first_name} ${m.last_name}`);
        setOpen(false);
      } else if (results.length === 1) {
        const m = results[0];
        onChange(m.id);
        setQuery(`${m.first_name} ${m.last_name}`);
        setOpen(false);
      }
      return;
    }

    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); }}
        onFocus={() => { if (results.length) setOpen(true); }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full rounded border px-2 py-1"
      />
      {open && (
        <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-auto rounded border bg-white z-40">
          {loading && <div className="p-2 text-sm text-gray-500">Searching…</div>}
          {!loading && results.length === 0 && <div className="p-2 text-sm text-gray-500">No results</div>}
          {results.map((m, idx) => (
            <div
              key={m.id}
              className={`p-2 cursor-pointer ${idx === highlighted ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
              onMouseDown={() => { onChange(m.id); setQuery(`${m.first_name} ${m.last_name}`); setOpen(false); }}
              onMouseEnter={() => setHighlighted(idx)}
            >
              <div className="font-medium">{m.first_name} {m.last_name}</div>
              {m.email && <div className="text-xs text-gray-500">{m.email}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
