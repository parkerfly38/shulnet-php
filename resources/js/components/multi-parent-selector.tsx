import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

interface Parent {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface MultiParentSelectorProps {
    value: (string | number)[];
    onChange: (parentIds: (string | number)[]) => void;
    error?: string;
}

export default function MultiParentSelector({ value, onChange, error }: MultiParentSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [parents, setParents] = useState<Parent[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedParents, setSelectedParents] = useState<Parent[]>([]);
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
        if (value && value.length > 0) {
            const fetchSelectedParents = async () => {
                try {
                    const parentPromises = value.map(async (parentId) => {
                        const response = await fetch(`/api/admin/parents/${parentId}`, {
                            headers: {
                                'Accept': 'application/json',
                            },
                            credentials: 'include',
                        });
                        
                        if (response.ok) {
                            return await response.json();
                        }
                        return null;
                    });
                    
                    const fetchedParents = await Promise.all(parentPromises);
                    const validParents = fetchedParents.filter(p => p !== null);
                    setSelectedParents(validParents);
                } catch (err) {
                    console.error('Failed to fetch parents:', err);
                }
            };
            
            fetchSelectedParents();
        } else {
            setSelectedParents([]);
        }
    }, [value]);

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
        const isAlreadySelected = selectedParents.some(p => p.id === parent.id);
        
        if (isAlreadySelected) {
            // Remove from selection
            const newSelectedParents = selectedParents.filter(p => p.id !== parent.id);
            setSelectedParents(newSelectedParents);
            onChange(newSelectedParents.map(p => p.id));
        } else {
            // Add to selection
            const newSelectedParents = [...selectedParents, parent];
            setSelectedParents(newSelectedParents);
            onChange(newSelectedParents.map(p => p.id));
        }
    };

    const handleRemove = (parentId: number) => {
        const newSelectedParents = selectedParents.filter(p => p.id !== parentId);
        setSelectedParents(newSelectedParents);
        onChange(newSelectedParents.map(p => p.id));
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
            <label className="block text-sm font-medium mb-1">Parents</label>
            <div
                className={`w-full rounded border p-2 bg-white dark:bg-gray-900 cursor-pointer min-h-[42px] ${
                    error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedParents.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {selectedParents.map((parent) => (
                            <div
                                key={parent.id}
                                className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded text-sm"
                            >
                                <span>
                                    {parent.first_name} {parent.last_name}
                                </span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(parent.id);
                                    }}
                                    className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400">Select parents...</span>
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
                                {filteredParents.map((parent) => {
                                    const isSelected = selectedParents.some(p => p.id === parent.id);
                                    return (
                                        <div
                                            key={parent.id}
                                            className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm flex items-center justify-between ${
                                                isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                            }`}
                                            onClick={() => handleSelect(parent)}
                                        >
                                            <div>
                                                <div>
                                                    {parent.first_name} {parent.last_name}
                                                </div>
                                                {parent.email && (
                                                    <div className="text-xs text-gray-500">{parent.email}</div>
                                                )}
                                            </div>
                                            {isSelected && (
                                                <div className="text-blue-600 dark:text-blue-400">✓</div>
                                            )}
                                        </div>
                                    );
                                })}
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
