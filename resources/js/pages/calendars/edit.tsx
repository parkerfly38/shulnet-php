import { useMemo, useState } from 'react';
import { router, useForm, Head } from '@inertiajs/react';
import { ArrowLeft, Calendar, Users, Globe } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BreadcrumbItem } from '@/types';

interface Calendar {
    id: number;
    name: string;
    members_only: boolean;
    public: boolean;
}

interface CalendarEditProps {
    calendar: Calendar;
}

interface CalendarFormData {
    name: string;
    members_only: boolean;
    public: boolean;
}

export default function CalendarEdit({ calendar }: CalendarEditProps) {
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
    
    const { data, setData, put, processing, errors } = useForm<CalendarFormData>({
        name: calendar.name,
        members_only: calendar.members_only,
        public: calendar.public,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/calendars/${calendar.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${calendar.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
          {/* Header */}
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Calendar</h1>
                        <p className="text-gray-600 dark:text-gray-400">Update calendar settings</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Calendar Information
                            </CardTitle>
                            <CardDescription>
                                Basic details about the calendar
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="name">Calendar Name *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={errors.name ? 'border-red-500' : ''}
                                    placeholder="Enter calendar name..."
                                />
                                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Visibility Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Visibility Settings
                            </CardTitle>
                            <CardDescription>
                                Control who can view events in this calendar
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="public"
                                    checked={data.public}
                                    onCheckedChange={(checked) => setData('public', checked as boolean)}
                                />
                                <Label htmlFor="public" className="flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    Public Calendar
                                </Label>
                            </div>
                            <p className="text-sm text-gray-600">
                                Public calendars can be viewed by anyone, including non-members
                            </p>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="members_only"
                                    checked={data.members_only}
                                    onCheckedChange={(checked) => setData('members_only', checked as boolean)}
                                />
                                <Label htmlFor="members_only" className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Members Only
                                </Label>
                            </div>
                            <p className="text-sm text-gray-600">
                                Members only calendars require authentication to view
                            </p>

                            {!data.public && !data.members_only && (
                                <Alert>
                                    <AlertDescription>
                                        This calendar will be private and only accessible to administrators.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {data.public && data.members_only && (
                                <Alert>
                                    <AlertDescription>
                                        <strong>Note:</strong> This calendar will be visible to members only (members_only takes precedence over public).
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.get('/admin/calendars')}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Updating...' : 'Update Calendar'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}