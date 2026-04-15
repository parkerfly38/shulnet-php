import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

interface Parent {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface ParentSelectorProps {
    value: string | number;
    onChange: (parentId: string) => void;
    error?: string;
}

export default function ParentSelector({ value, onChange, error }: ParentSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [parents, setParents] = useState<Parent[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch parents on mount and when search changes
    useEffect(() => {
        const fetchParents = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (search) {
                    params.append('search', search);
                }
                
                const response = await fetch(`/api/admin/parents?${params.toString()}`, {
                    headers: {
                        'Accept': 'application/json',
                    },
                    credentials: 'include',
                });
                
                if (response.ok) {
                    const result = await response.json();
                    setParents(result.data || result);
                }
            } catch (err) {
                console.error('Failed to fetch parents:', err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchParents();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search]);

    // Fetch selected parent details when value changes
    useEffect(() => {
        if (value && !selectedParent) {
            const fetchParent = async () => {
                try {
                    const response = await fetch(`/api/admin/parents/${value}`, {
                        headers: {
                            'Accept': 'application/json',
                        },
                        credentials: 'include',
                    });
                    
                    if (response.ok) {
                        const parent = await response.json();
                        setSelectedParent(parent);
                    }
                } catch (err) {
                    console.error('Failed to fetch parent:', err);
                }
            };
            
            fetchParent();
        }
    }, [value, selectedParent]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (parent: Parent) => {
        setSelectedParent(parent);
        onChange(parent.id.toString());
        setIsOpen(false);
        setSearch('');
    };

    const handleClear = () => {
        setSelectedParent(null);
        onChange('');
        setSearch('');
    };

    const filteredParents = search
        ? parents.filter((p) =>
              `${p.first_name} ${p.last_name} ${p.email}`
                  .toLowerCase()
                  .includes(search.toLowerCase())
          )
        : parents;

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium mb-1">Parent</label>
            <div
                className={`w-full rounded border p-2 bg-white dark:bg-gray-900 cursor-pointer flex items-center justify-between ${
                    error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedParent ? (
                    <div className="flex items-center justify-between w-full">
                        <span>
                            {selectedParent.first_name} {selectedParent.last_name}
                            {selectedParent.email && <span className="text-gray-500 text-sm ml-2">({selectedParent.email})</span>}
                        </span>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                            className="text-gray-400 hover:text-gray-600 ml-2"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between w-full">
                        <span className="text-gray-400">Select a parent...</span>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                )}
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search parents..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-sm"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-48">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">Loading...</div>
                        ) : filteredParents.length > 0 ? (
                            <div className="p-1">
                                {filteredParents.map((parent) => (
                                    <div
                                        key={parent.id}
                                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm"
                                        onClick={() => handleSelect(parent)}
                                    >
                                        <div>
                                            {parent.first_name} {parent.last_name}
                                        </div>
                                        {parent.email && (
                                            <div className="text-xs text-gray-500">{parent.email}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                No parents found
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}
