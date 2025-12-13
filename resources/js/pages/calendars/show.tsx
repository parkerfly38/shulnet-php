import React, { useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Users, Globe, Plus, Edit, Trash2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BreadcrumbItem } from '@/types';



interface Calendar {
    id: number;
    name: string;
    members_only: boolean;
    public: boolean;
    created_at: string;
    updated_at: string;
}

interface CalendarShowProps {
    calendar: Calendar;
}

export default function CalendarShow({ calendar }: CalendarShowProps) {
    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Calendars',
        href: '/admin/calendars',
    },
    {
        title: calendar.name,
        href: `/admin/calendars/${calendar.id}`,
    }
    ], [calendar.name, calendar.id]);
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete the calendar "${calendar.name}"? This will also delete all associated events.`)) {
            router.delete(`/admin/calendars/${calendar.id}`);
        }
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

    const getVisibilityBadges = () => {
        const badges = [];
        
        if (calendar.public) {
            badges.push(
                <Badge key="public" variant="default" className="bg-green-100 text-green-800">
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                </Badge>
            );
        }
        
        if (calendar.members_only) {
            badges.push(
                <Badge key="members" variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    Members Only
                </Badge>
            );
        }
        
        if (!calendar.public && !calendar.members_only) {
            badges.push(
                <Badge key="private" variant="outline">
                    Private
                </Badge>
            );
        }
        
        return badges;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={calendar.name} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.get('/admin/calendars')}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Calendars
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Calendar className="h-6 w-6" />
                                {calendar.name}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                {getVisibilityBadges()}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href={`/admin/events?calendar=${calendar.id}`}>
                            <Button variant="outline">
                                <Calendar className="h-4 w-4 mr-2" />
                                View Events
                            </Button>
                        </Link>
                        <Link href={`/admin/calendars/${calendar.id}/edit`}>
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
                    {/* Calendar Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Calendar Details</CardTitle>
                            <CardDescription>
                                Information about this calendar
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Calendar Name</label>
                                <p className="text-gray-900 font-medium">{calendar.name}</p>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-gray-500">Visibility</label>
                                <div className="flex items-center gap-2 mt-1">
                                    {getVisibilityBadges()}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">Created</label>
                                <p className="text-gray-900">{formatDate(calendar.created_at)}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                                <p className="text-gray-900">{formatDate(calendar.updated_at)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                Common actions for this calendar
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href={`/admin/events/create?calendar=${calendar.id}`} className="block">
                                <Button variant="outline" className="w-full justify-start">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Event to this Calendar
                                </Button>
                            </Link>

                            <Link href={`/admin/events?calendar=${calendar.id}`} className="block">
                                <Button variant="outline" className="w-full justify-start">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    View All Events
                                </Button>
                            </Link>

                            <Link href={`/admin/calendars/${calendar.id}/edit`} className="block">
                                <Button variant="outline" className="w-full justify-start">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Calendar Settings
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Visibility Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Visibility Information</CardTitle>
                        <CardDescription>
                            Understanding calendar visibility settings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-3">
                                <Globe className="h-4 w-4 mt-0.5 text-green-600" />
                                <div>
                                    <p className="font-medium">Public Calendar</p>
                                    <p className="text-gray-600">
                                        {calendar.public 
                                            ? "This calendar is visible to everyone, including non-members."
                                            : "This calendar is not public."
                                        }
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <Users className="h-4 w-4 mt-0.5 text-blue-600" />
                                <div>
                                    <p className="font-medium">Members Only</p>
                                    <p className="text-gray-600">
                                        {calendar.members_only 
                                            ? "This calendar requires member authentication to view."
                                            : "This calendar does not require member authentication."
                                        }
                                    </p>
                                </div>
                            </div>

                            {!calendar.public && !calendar.members_only && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-700">
                                        <strong>Private Calendar:</strong> This calendar is only accessible to administrators and will not be visible to members or the public.
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}