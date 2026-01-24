import { router } from '@inertiajs/react';
import {
    Calendar,
    File,
    Mail,
    User,
    Users,
    GraduationCap,
    FileText,
} from 'lucide-react';
import * as React from 'react';

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { useDebounce } from '@/hooks/use-debounce';

type SearchResult = {
    id: number;
    name: string;
    url: string;
};

type MemberResult = SearchResult & {
    email?: string;
    phone?: string;
    type?: string;
};

type StudentResult = SearchResult & {
    email?: string;
    parent?: string;
    dob?: string;
};

type ParentResult = SearchResult & {
    email?: string;
    phone?: string;
};

type DeedResult = SearchResult & {
    number?: string;
    owner?: string;
    occupied?: number;
    purchase_date?: string;
};

type YahrzeitResult = SearchResult & {
    hebrew_name?: string;
    date?: string;
};

type EventRsvpResult = SearchResult & {
    email?: string;
    event?: string;
    status?: string;
    guests?: number;
};

type SearchResults = {
    members: MemberResult[];
    students: StudentResult[];
    parents: ParentResult[];
    deeds: DeedResult[];
    yahrzeits: YahrzeitResult[];
    event_rsvps: EventRsvpResult[];
};

export function GlobalSearchDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [query, setQuery] = React.useState('');
    const [results, setResults] = React.useState<SearchResults>({
        members: [],
        students: [],
        parents: [],
        deeds: [],
        yahrzeits: [],
        event_rsvps: [],
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const debouncedQuery = useDebounce(query, 300);

    React.useEffect(() => {
        if (debouncedQuery.length < 2) {
            setResults({
                members: [],
                students: [],
                parents: [],
                deeds: [],
                yahrzeits: [],
                event_rsvps: [],
            });
            return;
        }

        setIsLoading(true);
        fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
            .then((res) => res.json())
            .then((data) => {
                setResults(data);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error('Search error:', err);
                setIsLoading(false);
            });
    }, [debouncedQuery]);

    const handleSelect = (url: string) => {
        router.visit(url);
        onOpenChange(false);
        setQuery('');
    };

    const totalResults =
        results.members.length +
        results.students.length +
        results.parents.length +
        results.deeds.length +
        results.yahrzeits.length +
        results.event_rsvps.length;

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput
                placeholder="Search members, students, deeds, yahrzeits..."
                value={query}
                onValueChange={setQuery}
            />
            <CommandList>
                {isLoading && (
                    <div className="py-6 text-center text-sm">
                        Searching...
                    </div>
                )}
                {!isLoading && query.length >= 2 && totalResults === 0 && (
                    <CommandEmpty>No results found.</CommandEmpty>
                )}

                {results.members.length > 0 && (
                    <CommandGroup heading="Members">
                        {results.members.map((member) => (
                            <button
                                key={`member-${member.id}`}
                                onClick={() => handleSelect(member.url)}
                                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left"
                            >
                                <User className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                <div className="flex-1">
                                    <div className="font-medium">
                                        {member.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {member.email && (
                                            <span>{member.email}</span>
                                        )}
                                        {member.phone && member.email && (
                                            <span> • </span>
                                        )}
                                        {member.phone && (
                                            <span>{member.phone}</span>
                                        )}
                                        {member.type && (
                                            <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-xs dark:bg-blue-900/30">
                                                {member.type}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </CommandGroup>
                )}

                {results.students.length > 0 && (
                    <CommandGroup heading="Students">
                        {results.students.map((student) => (
                            <button
                                key={`student-${student.id}`}
                                onClick={() => handleSelect(student.url)}
                                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left"
                            >
                                <GraduationCap className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                <div className="flex-1">
                                    <div className="font-medium">
                                        {student.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {student.parent && (
                                            <span>Parent: {student.parent}</span>
                                        )}
                                        {student.email &&
                                            student.parent && <span> • </span>}
                                        {student.email && (
                                            <span>{student.email}</span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </CommandGroup>
                )}

                {results.parents.length > 0 && (
                    <CommandGroup heading="Parents">
                        {results.parents.map((parent) => (
                            <button
                                key={`parent-${parent.id}`}
                                onClick={() => handleSelect(parent.url)}
                                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left"
                            >
                                <Users className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                <div className="flex-1">
                                    <div className="font-medium">
                                        {parent.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {parent.email && (
                                            <span>{parent.email}</span>
                                        )}
                                        {parent.phone && parent.email && (
                                            <span> • </span>
                                        )}
                                        {parent.phone && (
                                            <span>{parent.phone}</span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </CommandGroup>
                )}

                {results.deeds.length > 0 && (
                    <CommandGroup heading="Deeds">
                        {results.deeds.map((deed) => (
                            <button
                                key={`deed-${deed.id}`}
                                onClick={() => handleSelect(deed.url)}
                                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left"
                            >
                                <FileText className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                <div className="flex-1">
                                    <div className="font-medium">
                                        Deed #{deed.number}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {deed.owner && (
                                            <span>{deed.owner}</span>
                                        )}
                                        {deed.occupied !== undefined && deed.owner && (
                                            <span> • </span>
                                        )}
                                        {deed.occupied !== undefined && (
                                            <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs dark:bg-green-900/30">
                                                {deed.occupied} occupied
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </CommandGroup>
                )}

                {results.yahrzeits.length > 0 && (
                    <CommandGroup heading="Yahrzeits">
                        {results.yahrzeits.map((yahrzeit) => (
                            <button
                                key={`yahrzeit-${yahrzeit.id}`}
                                onClick={() => handleSelect(yahrzeit.url)}
                                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left"
                            >
                                <Calendar className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                <div className="flex-1">
                                    <div className="font-medium">
                                        {yahrzeit.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {yahrzeit.hebrew_name && (
                                            <span>{yahrzeit.hebrew_name}</span>
                                        )}
                                        {yahrzeit.date &&
                                            yahrzeit.hebrew_name && (
                                                <span> • </span>
                                            )}
                                        {yahrzeit.date && (
                                            <span>{yahrzeit.date}</span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </CommandGroup>
                )}

                {results.event_rsvps.length > 0 && (
                    <CommandGroup heading="Event RSVPs">
                        {results.event_rsvps.map((rsvp) => (
                            <button
                                key={`rsvp-${rsvp.id}`}
                                onClick={() => handleSelect(rsvp.url)}
                                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left"
                            >
                                <Mail className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                <div className="flex-1">
                                    <div className="font-medium">
                                        {rsvp.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {rsvp.event && (
                                            <span>{rsvp.event}</span>
                                        )}
                                        {rsvp.status && rsvp.event && (
                                            <span> • </span>
                                        )}
                                        {rsvp.status && (
                                            <span className="rounded bg-purple-100 px-1.5 py-0.5 dark:bg-purple-900/30">
                                                {rsvp.status}
                                            </span>
                                        )}
                                        {rsvp.guests !== undefined && (
                                            <span> • {rsvp.guests} guests</span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </CommandDialog>
    );
}
