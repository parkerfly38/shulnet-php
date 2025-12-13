import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit, Plus, Search, Eye, Calendar, Users, Globe } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Calendars',
    href: '/admin/calendars',
  },
];

interface Calendar {
    id: number;
    name: string;
    members_only: boolean;
    public: boolean;
    created_at: string;
    updated_at: string;
}

interface PaginationData {
  current_page: number;
  data: Calendar[];
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
  calendars: PaginationData;
  filters: {
    search?: string;
  };
}

export default function CalendarsIndex({ calendars, filters }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/admin/calendars', { search: searchTerm }, { preserveState: true });
  };

  const clearSearch = () => {
    setSearchTerm('');
    router.get('/admin/calendars', {}, { preserveState: true });
  };

  const handleDelete = (calendar: Calendar) => {
    if (confirm(`Are you sure you want to delete the calendar "${calendar.name}"? This will also delete all associated events.`)) {
      router.delete(`/admin/calendars/${calendar.id}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Calendars" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calendars</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage event calendars and their visibility settings</p>
          </div>
          <Link href="/admin/calendars/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Calendar
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search calendars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="outline" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            {filters.search && (
              <Button type="button" variant="outline" size="sm" onClick={clearSearch}>
                Clear
              </Button>
            )}
          </form>
        </div>

        {/* Calendar Table */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Calendar Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Visibility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {calendars.data.length > 0 ? (
                  calendars.data.map((calendar) => (
                    <tr key={calendar.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {calendar.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {calendar.public && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <Globe className="h-3 w-3 mr-1" />
                              Public
                            </Badge>
                          )}
                          {calendar.members_only && (
                            <Badge variant="secondary">
                              <Users className="h-3 w-3 mr-1" />
                              Members Only
                            </Badge>
                          )}
                          {!calendar.public && !calendar.members_only && (
                            <Badge variant="outline">
                              Private
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                        {formatDate(calendar.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/admin/calendars/${calendar.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/calendars/${calendar.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/events?calendar=${calendar.id}`}>
                            <Button variant="outline" size="sm">
                              <Calendar className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(calendar)}
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
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No calendars found</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {filters.search ? 'No calendars match your search criteria.' : 'Get started by creating your first calendar.'}
                        </p>
                        <Link href="/admin/calendars/create">
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Calendar
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
          {calendars.last_page > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  {calendars.prev_page_url && (
                    <Link href={calendars.prev_page_url}>
                      <Button variant="outline">Previous</Button>
                    </Link>
                  )}
                  {calendars.next_page_url && (
                    <Link href={calendars.next_page_url}>
                      <Button variant="outline">Next</Button>
                    </Link>
                  )}
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing <span className="font-medium">{calendars.from}</span> to{' '}
                      <span className="font-medium">{calendars.to}</span> of{' '}
                      <span className="font-medium">{calendars.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {calendars.links.map((link, index) => {
                        if (!link.url) {
                          return (
                            <span
                              key={index}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400"
                              dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                          );
                        }

                        return (
                          <Link
                            key={index}
                            href={link.url}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              link.active
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                          />
                        );
                      })}
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}