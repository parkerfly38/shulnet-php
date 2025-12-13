import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit, Plus, Search, Eye, Calendar, Star } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface Member {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    hebrew_name?: string;
    pivot: {
        relationship: string;
    };
}

interface Yahrzeit {
    id: number;
    members: Member[];
    name: string;
    hebrew_name?: string;
    date_of_death: string;
    hebrew_day_of_death: number;
    hebrew_month_of_death: number;
    observance_type: 'standard' | 'kaddish' | 'memorial_candle' | 'other';
    created_at: string;
    updated_at: string;
}

interface PaginationData {
  current_page: number;
  data: Yahrzeit[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url?: string;
    label: string;
    active: boolean;
  }>;
  next_page_url?: string;
  path: string;
  per_page: number;
  prev_page_url?: string;
  to: number;
  total: number;
}

interface Props {
  yahrzeits: PaginationData;
  filters: {
    search?: string;
  };
}

const HEBREW_MONTHS = [
    '', // 0 index placeholder
    'Tishrei', 'Cheshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar',
    'Nissan', 'Iyar', 'Sivan', 'Tammuz', 'Av', 'Elul'
];

const OBSERVANCE_COLORS = {
    standard: 'bg-blue-100 text-blue-800',
    kaddish: 'bg-purple-100 text-purple-800',
    memorial_candle: 'bg-yellow-100 text-yellow-800',
    other: 'bg-gray-100 text-gray-800'
} as const;

const OBSERVANCE_LABELS = {
    standard: 'Standard Yahrzeit',
    kaddish: 'Kaddish Recitation',
    memorial_candle: 'Memorial Candle',
    other: 'Other Observance'
} as const;

export default function YahrzeitIndex({ yahrzeits, filters }: Readonly<Props>) {
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/admin/yahrzeits', { search }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleDelete = (yahrzeit: Yahrzeit) => {
    if (confirm(`Are you sure you want to delete the yahrzeit record for ${yahrzeit.name}?`)) {
      router.delete(`/admin/yahrzeits/${yahrzeit.id}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
  };

  const formatHebrewDate = (day: number, month: number) => {
    const monthName = HEBREW_MONTHS[month] || 'Unknown';
    return `${day} ${monthName}`;
  };

  return (
    <AppLayout>
      <Head title="Yahrzeit Management" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Yahrzeit Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage memorial observances and remembrance dates
            </p>
          </div>
          <Link href="/admin/yahrzeits/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Yahrzeit
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search yahrzeit records by name or relationship..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
          {filters.search && (
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                router.get('/admin/yahrzeits');
              }}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <span>
            Showing {yahrzeits.from} to {yahrzeits.to} of {yahrzeits.total} yahrzeit records
          </span>
          {filters.search && (
            <span>
              Search results for: <strong>"{filters.search}"</strong>
            </span>
          )}
        </div>

        {/* Yahrzeits Table */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Deceased
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date of Death
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Hebrew Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Observance
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {yahrzeits.data.length > 0 ? (
                  yahrzeits.data.map((yahrzeit) => (
                    <tr key={yahrzeit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {yahrzeit.name}
                          </div>
                          {yahrzeit.hebrew_name && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {yahrzeit.hebrew_name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDate(yahrzeit.date_of_death)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-2 text-gray-400" />
                          {formatHebrewDate(yahrzeit.hebrew_day_of_death, yahrzeit.hebrew_month_of_death)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={OBSERVANCE_COLORS[yahrzeit.observance_type]}>
                          {OBSERVANCE_LABELS[yahrzeit.observance_type]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/admin/yahrzeits/${yahrzeit.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/yahrzeits/${yahrzeit.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(yahrzeit)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          No yahrzeit records found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          {filters.search ? 'No records match your search criteria.' : 'Get started by adding your first yahrzeit record.'}
                        </p>
                        <Link href="/admin/yahrzeits/create">
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Yahrzeit Record
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {yahrzeits.last_page > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                {yahrzeits.prev_page_url && (
                  <Button variant="outline" onClick={() => router.get(yahrzeits.prev_page_url!)}>
                    Previous
                  </Button>
                )}
                {yahrzeits.next_page_url && (
                  <Button variant="outline" onClick={() => router.get(yahrzeits.next_page_url!)}>
                    Next
                  </Button>
                )}
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{yahrzeits.from}</span> to{' '}
                    <span className="font-medium">{yahrzeits.to}</span> of{' '}
                    <span className="font-medium">{yahrzeits.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {yahrzeits.links.map((link, index) => (
                      <Button
                        key={index}
                        variant={link.active ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => link.url && router.get(link.url)}
                        disabled={!link.url}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          index === 0 ? 'rounded-l-md' : ''
                        } ${
                          index === yahrzeits.links.length - 1 ? 'rounded-r-md' : ''
                        }`}
                      />
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}