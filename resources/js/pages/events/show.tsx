import React, { useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Edit, Trash2, Globe } from 'lucide-react';
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
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.get('/admin/events')}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Events
                        </Button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {event.calendar.name}
                                </Badge>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">
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
                                <p className="text-gray-900 font-medium">{event.title}</p>
                            </div>

                            {event.description && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Description</label>
                                    <p className="text-gray-900 whitespace-pre-wrap">{event.description}</p>
                                </div>
                            )}
                            
                            <div>
                                <label className="text-sm font-medium text-gray-500">Calendar</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-900">{event.calendar.name}</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">Date & Time</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-gray-900">{formatDateRange()}</p>
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
                                        <span className="text-gray-900">{event.location}</span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-gray-500">Visibility</label>
                                <div className="flex items-center gap-2 mt-1">
                                    {event.members_only ? (
                                        <>
                                            <Users className="h-4 w-4 text-blue-500" />
                                            <span className="text-gray-900">Members Only</span>
                                        </>
                                    ) : (
                                        <>
                                            <Globe className="h-4 w-4 text-green-500" />
                                            <span className="text-gray-900">Public Event</span>
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
                                <p className="text-gray-900">{formatDate(event.created_at)}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                                <p className="text-gray-900">{formatDate(event.updated_at)}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">Event ID</label>
                                <p className="text-gray-900 font-mono text-sm">{event.id}</p>
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
            </div>
        </AppLayout>
    );
}