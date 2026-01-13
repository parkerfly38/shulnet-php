import React, { useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Edit, Trash2, Globe, Ticket } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BreadcrumbItem } from '@/types';

const baseBreadcrumbs: BreadcrumbItem[] = [
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

interface RSVP {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    guests: number;
    status: string;
    notes: string | null;
    created_at: string;
    member: {
        id: number;
        first_name: string;
        last_name: string;
    } | null;
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
    rsvps: RSVP[];
}

interface EventShowProps {
    event: Event;
}

export default function EventShow({ event }: EventShowProps) {
    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Events',
            href: '/admin/events',
        },
        {
            title: event.title,
            href: `/admin/events/${event.id}`
        }
    ], [event.title, event.id]);

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete the event "${event.title}"?`)) {
            router.delete(`/admin/events/${event.id}`);
        }
    };
    const getStatusBadge = (status: string) => {
        const colors = {
            confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    };
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        if (event.all_day) {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } else {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    const formatDateRange = () => {
        const start = formatDateTime(event.start_date);
        if (event.end_date) {
            const end = formatDateTime(event.end_date);
            if (event.all_day) {
                // For all-day events, show date range
                const startDate = new Date(event.start_date).toDateString();
                const endDate = new Date(event.end_date).toDateString();
                if (startDate === endDate) {
                    return start;
                } else {
                    return `${start} - ${end}`;
                }
            } else {
                return `${start} - ${end}`;
            }
        }
        return start;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={event.title} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {event.calendar.name}
                                </Badge>
                            </div>
                            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                {event.title}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                {event.members_only ? (
                                    <Badge variant="secondary">
                                        <Users className="h-3 w-3 mr-1" />
                                        Members Only
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">
                                        <Globe className="h-3 w-3 mr-1" />
                                        Public
                                    </Badge>
                                )}
                                {event.all_day && (
                                    <Badge variant="outline">
                                        All Day
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href={`/admin/events/${event.id}/ticket-types`}>
                            <Button variant="outline">
                                <Ticket className="h-4 w-4 mr-2" />
                                Manage Tickets
                            </Button>
                        </Link>
                        <Link href={`/admin/events/${event.id}/edit`}>
                            <Button variant="outline">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                        <Button 
                            variant="outline"
                            onClick={handleDelete}
                            className="text-red-600 hover:text-red-800"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Event Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Event Details</CardTitle>
                            <CardDescription>
                                Information about this event
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Title</label>
                                <p className="text-gray-900 dark:text-gray-100 font-medium">{event.title}</p>
                            </div>

                            {event.description && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Description</label>
                                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{event.description}</p>
                                </div>
                            )}
                            
                            <div>
                                <label className="text-sm font-medium text-gray-500">Calendar</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-900 dark:text-gray-100">{event.calendar.name}</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">Date & Time</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-gray-900 dark:text-gray-100">{formatDateRange()}</p>
                                        {event.all_day && (
                                            <p className="text-sm text-gray-500">All day event</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {event.location && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Location</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-900 dark:text-gray-100">{event.location}</span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-gray-500">Visibility</label>
                                <div className="flex items-center gap-2 mt-1">
                                    {event.members_only ? (
                                        <>
                                            <Users className="h-4 w-4 text-blue-500" />
                                            <span className="text-gray-900 dark:text-gray-100">Members Only</span>
                                        </>
                                    ) : (
                                        <>
                                            <Globe className="h-4 w-4 text-green-500" />
                                            <span className="text-gray-900 dark:text-gray-100">Public Event</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Metadata */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Metadata</CardTitle>
                            <CardDescription>
                                Creation and modification information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Created</label>
                                <p className="text-gray-900 dark:text-gray-100">{formatDate(event.created_at)}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                                <p className="text-gray-900 dark:text-gray-100">{formatDate(event.updated_at)}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">Event ID</label>
                                <p className="text-gray-900 dark:text-gray-100 font-mono text-sm">{event.id}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common actions for this event
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Link href={`/admin/events/${event.id}/edit`} className="block">
                                <Button variant="outline" className="w-full justify-start">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Event
                                </Button>
                            </Link>

                            <Link href={`/admin/calendars/${event.calendar.id}`} className="block">
                                <Button variant="outline" className="w-full justify-start">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    View Calendar
                                </Button>
                            </Link>

                            <Link href={`/admin/events?calendar=${event.calendar.id}`} className="block">
                                <Button variant="outline" className="w-full justify-start">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Other Events
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* RSVPs */}
                {event.rsvps && event.rsvps.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Event RSVPs ({event.rsvps.length})</CardTitle>
                            <CardDescription>
                                Registered attendees for this event
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b">
                                        <tr className="text-left">
                                            <th className="pb-3 text-sm font-medium text-gray-500">Name</th>
                                            <th className="pb-3 text-sm font-medium text-gray-500">Email</th>
                                            <th className="pb-3 text-sm font-medium text-gray-500">Phone</th>
                                            <th className="pb-3 text-sm font-medium text-gray-500">Guests</th>
                                            <th className="pb-3 text-sm font-medium text-gray-500">Status</th>
                                            <th className="pb-3 text-sm font-medium text-gray-500">Registered</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {event.rsvps.map((rsvp) => (
                                            <tr key={rsvp.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                                <td className="py-3">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                                            {rsvp.name}
                                                        </p>
                                                        {rsvp.member && (
                                                            <p className="text-xs text-gray-500">
                                                                Member: {rsvp.member.first_name} {rsvp.member.last_name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 text-gray-900 dark:text-gray-100">
                                                    {rsvp.email}
                                                </td>
                                                <td className="py-3 text-gray-900 dark:text-gray-100">
                                                    {rsvp.phone || '-'}
                                                </td>
                                                <td className="py-3 text-gray-900 dark:text-gray-100">
                                                    {rsvp.guests > 0 ? rsvp.guests : '-'}
                                                </td>
                                                <td className="py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(rsvp.status)}`}>
                                                        {rsvp.status.charAt(0).toUpperCase() + rsvp.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-sm text-gray-500">
                                                    {new Date(rsvp.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {event.rsvps.some(rsvp => rsvp.notes) && (
                                <div className="mt-6 space-y-3">
                                    <h4 className="text-sm font-medium text-gray-500">Special Requests / Notes</h4>
                                    {event.rsvps.filter(rsvp => rsvp.notes).map((rsvp) => (
                                        <div key={rsvp.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {rsvp.name}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {rsvp.notes}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}