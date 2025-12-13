import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit, Plus, Search, Eye, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Events',
    href: '/admin/events',
  }
];

interface Calendar {
    id: number;
    name: string;
    members_only: boolean;
    public: boolean;
}

interface Event {
    id: number;
    title: string;
    description?: string;
    start_date: string;
    end_date?: string;
    all_day: boolean;
    location?: string;
    members_only: boolean;
    calendar: Calendar;
    created_at: string;
    updated_at: string;
}

interface PaginationData {
  current_page: number;
  data: Event[];
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
  events: PaginationData;
  calendars: Calendar[];
  filters: {
    search?: string;
    calendar?: string;
  };
}

export default function EventsIndex({ events, calendars, filters }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedCalendar, setSelectedCalendar] = useState(filters.calendar || 'all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/admin/events', { 
      search: searchTerm, 
      calendar: selectedCalendar === 'all' ? '' : selectedCalendar
    }, { preserveState: true });
  };

  const handleCalendarFilter = (calendarId: string) => {
    setSelectedCalendar(calendarId);
    router.get('/admin/events', { 
      search: searchTerm, 
      calendar: calendarId === 'all' ? '' : calendarId
    }, { preserveState: true });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCalendar('all');
    router.get('/admin/events', {}, { preserveState: true });
  };

  const handleDelete = (event: Event) => {
    if (confirm(`Are you sure you want to delete the event "${event.title}"?`)) {
      router.delete(`/admin/events/${event.id}`);
    }
  };

  const formatDateTime = (dateString: string, allDay: boolean) => {
    const date = new Date(dateString);
    if (allDay) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const formatDateRange = (event: Event) => {
    const start = formatDateTime(event.start_date, event.all_day);
    if (event.end_date) {
      const end = formatDateTime(event.end_date, event.all_day);
      return <>{start}<br />{end}</>;
    }
    return start;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Events" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Events</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage calendar events and their details</p>
          </div>
          <Link href="/admin/events/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="outline" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <Select value={selectedCalendar || "all"} onValueChange={handleCalendarFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All calendars" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All calendars</SelectItem>
              {calendars.map((calendar) => (
                <SelectItem key={calendar.id} value={calendar.id.toString()}>
                  {calendar.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(filters.search || (filters.calendar && filters.calendar !== '')) && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {/* Events Table */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Calendar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Visibility
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {events.data.length > 0 ? (
                  events.data.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {event.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline">
                          {event.calendar.name}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-gray-900 dark:text-gray-100">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <div>
                            <div className="text-sm">{formatDateRange(event)}</div>
                            {event.all_day ? (
                              <div className="text-xs text-gray-500">All day</div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {event.members_only ? (
                          <Badge variant="secondary">
                            <Users className="h-3 w-3 mr-1" />
                            Members Only
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            Public
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/admin/events/${event.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/events/${event.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(event)}
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
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No events found</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {filters.search || (filters.calendar && filters.calendar !== '') 
                            ? 'No events match your search criteria.' 
                            : 'Get started by creating your first event.'}
                        </p>
                        <Link href="/admin/events/create">
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Event
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
          {events.last_page > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  {events.prev_page_url && (
                    <Link href={events.prev_page_url}>
                      <Button variant="outline">Previous</Button>
                    </Link>
                  )}
                  {events.next_page_url && (
                    <Link href={events.next_page_url}>
                      <Button variant="outline">Next</Button>
                    </Link>
                  )}
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing <span className="font-medium">{events.from}</span> to{' '}
                      <span className="font-medium">{events.to}</span> of{' '}
                      <span className="font-medium">{events.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {events.links.map((link, index) => {
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