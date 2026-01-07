import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Eye, MapPin, CheckCircle, Clock, XCircle } from 'lucide-react';
import { type Gravesite, type BreadcrumbItem } from '@/types';

interface PaginatedGravesites {
    data: Gravesite[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface GravesiteStats {
    total: number;
    available: number;
    reserved: number;
    occupied: number;
    single: number;
    double: number;
    family: number;
    cremation: number;
}

interface Props {
    gravesites: PaginatedGravesites;
    cemeteries: string[];
    stats: GravesiteStats;
    filters: {
        search?: string;
        status?: string;
        cemetery?: string;
    };
}

const statusColors: Record<string, string> = {
    available: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    reserved: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    occupied: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
};

export default function GravesitesIndex({ gravesites, cemeteries, stats, filters }: Readonly<Props>) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [cemetery, setCemetery] = useState(filters.cemetery || '');

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Gravesites', href: '/admin/gravesites' },
    ], []);

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get('/admin/gravesites', {
            search: search || undefined,
            status: status || undefined,
            cemetery: cemetery || undefined,
        }, { preserveState: true, replace: true });
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatus('');
        setCemetery('');
        router.get('/admin/gravesites');
    };

    const handleDelete = (gravesite: Gravesite) => {
        if (confirm(`Are you sure you want to delete gravesite ${gravesite.plot_number}?`)) {
            router.delete(`/admin/gravesites/${gravesite.id}`);
        }
    };

    const statCards = [
        {
            title: 'Total Sites',
            count: stats.total,
            icon: MapPin,
            textColor: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
            title: 'Available',
            count: stats.available,
            icon: CheckCircle,
            textColor: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
        },
        {
            title: 'Reserved',
            count: stats.reserved,
            icon: Clock,
            textColor: 'text-yellow-600 dark:text-yellow-400',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        },
        {
            title: 'Occupied',
            count: stats.occupied,
            icon: XCircle,
            textColor: 'text-gray-600 dark:text-gray-400',
            bgColor: 'bg-gray-50 dark:bg-gray-900/20',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gravesites" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Cemetery Gravesites</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage cemetery plots and burial sites</p>
                    </div>
                    <Link href="/admin/gravesites/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Gravesite
                        </Button>
                    </Link>
                </div>

                {/* Stats Dashboard */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {statCards.map((stat) => (
                        <div
                            key={stat.title}
                            className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                                    <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {stat.title}
                                </p>
                                <p className={`text-2xl font-bold mt-1 ${stat.textColor}`}>
                                    {stat.count}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="rounded-lg border bg-white dark:bg-black p-4 shadow-sm">
                    <div className="flex flex-wrap gap-4">
                        <form onSubmit={handleFilter} className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by plot number, section, or deceased name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </form>
                        <div className="w-[150px]">
                            <Select value={status ?? " "} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value=" ">All Statuses</SelectItem>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="reserved">Reserved</SelectItem>
                                    <SelectItem value="occupied">Occupied</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {cemeteries.length > 0 && (
                            <div className="w-[200px]">
                                <Select value={cemetery ?? " "} onValueChange={setCemetery}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Cemeteries" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value=" ">All Cemeteries</SelectItem>
                                        {cemeteries.map((cem) => (
                                            <SelectItem key={cem} value={cem}>
                                                {cem}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <Button type="button" onClick={(e) => handleFilter() }>
                            <Search className="h-4 w-4 mr-2" />
                            Filter
                        </Button>
                        {(filters.search || filters.status || filters.cemetery) && (
                            <Button variant="outline" onClick={handleClearFilters}>
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {/* Results Summary */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {gravesites.from} to {gravesites.to} of {gravesites.total} gravesites
                </div>

                {/* Gravesites Table */}
                <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Location
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Owner/Deceased
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        Details
                                    </th>
                                    <th className="relative px-6 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
                                {gravesites.data.length > 0 ? (
                                    gravesites.data.map((gravesite) => (
                                        <tr key={gravesite.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    Plot {gravesite.plot_number}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {gravesite.section && `Section ${gravesite.section}`}
                                                    {gravesite.row && ` • Row ${gravesite.row}`}
                                                    {gravesite.cemetery_name && (
                                                        <div className="text-xs">{gravesite.cemetery_name}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm capitalize text-gray-900 dark:text-gray-100">
                                                    {gravesite.gravesite_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge className={statusColors[gravesite.status]}>
                                                    {gravesite.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                {gravesite.status === 'occupied' && gravesite.deceased_name && (
                                                    <div className="text-sm text-gray-900 dark:text-gray-100">
                                                        {gravesite.deceased_name}
                                                    </div>
                                                )}
                                                {gravesite.status === 'reserved' && gravesite.reserved_by && (
                                                    <div className="text-sm text-gray-900 dark:text-gray-100">
                                                        Reserved: {gravesite.reserved_by}
                                                    </div>
                                                )}
                                                {gravesite.member && (
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        Owner: {gravesite.member.first_name} {gravesite.member.last_name}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {gravesite.status === 'occupied' && gravesite.date_of_death && (
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        † {new Date(gravesite.date_of_death).toLocaleDateString()}
                                                    </div>
                                                )}
                                                {gravesite.perpetual_care && (
                                                    <div className="text-xs text-green-600 dark:text-green-400">
                                                        Perpetual Care
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex gap-2 justify-end">
                                                    <Link href={`/admin/gravesites/${gravesite.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/gravesites/${gravesite.id}/edit`}>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(gravesite)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="text-gray-500 dark:text-gray-400">
                                                {filters.search || filters.status || filters.cemetery
                                                    ? 'No gravesites found matching your filters.'
                                                    : 'No gravesites found.'}
                                            </div>
                                            {!filters.search && !filters.status && !filters.cemetery && (
                                                <Link href="/admin/gravesites/create" className="mt-2 inline-block">
                                                    <Button>Add your first gravesite</Button>
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {gravesites.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            {gravesites.prev_page_url && (
                                <Link href={gravesites.prev_page_url} preserveState>
                                    <Button variant="outline">Previous</Button>
                                </Link>
                            )}
                            {gravesites.next_page_url && (
                                <Link href={gravesites.next_page_url} preserveState>
                                    <Button variant="outline">Next</Button>
                                </Link>
                            )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Page {gravesites.current_page} of {gravesites.last_page}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
