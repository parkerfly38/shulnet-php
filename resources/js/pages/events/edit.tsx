import { useState, useEffect, useMemo } from 'react';
import { router, useForm, Head } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Type } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    calendar_id: number;
    title: string;
    description?: string;
    start_date: string;
    end_date?: string;
    all_day: boolean;
    location?: string;
    members_only: boolean;
}

interface EventEditProps {
    event: Event;
    calendars: Calendar[];
}

interface EventFormData {
    calendar_id: string;
    title: string;
    description: string;
    start_date: string;
    start_time: string;
    end_date: string;
    end_time: string;
    all_day: boolean;
    location: string;
    members_only: boolean;
}

export default function EventEdit({ event, calendars }: EventEditProps) {
    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        ...baseBreadcrumbs,
        { title: `Edit ${event.title}`, href: `/admin/events/${event.id}/edit` }
    ], [event.title, event.id]);

    // Parse existing dates
    const parseDateTime = (dateTimeString?: string) => {
        if (!dateTimeString) return { date: '', time: '' };
        
        const dateTime = new Date(dateTimeString);
        const date = dateTime.toISOString().split('T')[0];
        const time = dateTime.toTimeString().substring(0, 5);
        
        return { date, time };
    };

    const startDateTime = parseDateTime(event.start_date);
    const endDateTime = parseDateTime(event.end_date);

    const { data, setData, put, processing, errors } = useForm<EventFormData>({
        calendar_id: event.calendar_id.toString(),
        title: event.title,
        description: event.description || '',
        start_date: startDateTime.date,
        start_time: event.all_day ? '' : startDateTime.time,
        end_date: endDateTime.date,
        end_time: event.all_day ? '' : endDateTime.time,
        all_day: event.all_day,
        location: event.location || '',
        members_only: event.members_only,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Combine date and time for start and end
        const submitData = {
            ...data,
            start_date: data.all_day 
                ? data.start_date 
                : `${data.start_date} ${data.start_time || '00:00'}`,
            end_date: data.end_date 
                ? (data.all_day 
                    ? data.end_date 
                    : `${data.end_date} ${data.end_time || '23:59'}`)
                : null,
        };
        
        // Remove separate time fields
        const { start_time, end_time, ...finalData } = submitData;
        
        put(`/admin/events/${event.id}`, finalData);
    };

    const handleAllDayChange = (checked: boolean) => {
        setData('all_day', checked);
        if (checked) {
            setData('start_time', '');
            setData('end_time', '');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${event.title}`} />
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
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
                        <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
                        <p className="text-gray-600">Update event details</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Type className="h-5 w-5" />
                                Basic Information
                            </CardTitle>
                            <CardDescription>
                                General details about the event
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="calendar_id">Calendar *</Label>
                                <Select value={data.calendar_id} onValueChange={(value) => setData('calendar_id', value)}>
                                    <SelectTrigger className={errors.calendar_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select a calendar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {calendars.map((calendar) => (
                                            <SelectItem key={calendar.id} value={calendar.id.toString()}>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    {calendar.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.calendar_id && <p className="text-sm text-red-600 mt-1">{errors.calendar_id}</p>}
                            </div>

                            <div>
                                <Label htmlFor="title">Event Title *</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className={errors.title ? 'border-red-500' : ''}
                                    placeholder="Enter event title..."
                                />
                                {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className={errors.description ? 'border-red-500' : ''}
                                    placeholder="Enter event description..."
                                    rows={3}
                                />
                                {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Date and Time */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Date and Time
                            </CardTitle>
                            <CardDescription>
                                When the event takes place
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="all_day"
                                    checked={data.all_day}
                                    onCheckedChange={handleAllDayChange}
                                />
                                <Label htmlFor="all_day">All Day Event</Label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="start_date">Start Date *</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className={errors.start_date ? 'border-red-500' : ''}
                                    />
                                    {errors.start_date && <p className="text-sm text-red-600 mt-1">{errors.start_date}</p>}
                                </div>

                                {!data.all_day && (
                                    <div>
                                        <Label htmlFor="start_time">Start Time</Label>
                                        <Input
                                            id="start_time"
                                            type="time"
                                            value={data.start_time}
                                            onChange={(e) => setData('start_time', e.target.value)}
                                            className={errors.start_time ? 'border-red-500' : ''}
                                        />
                                        {errors.start_time && <p className="text-sm text-red-600 mt-1">{errors.start_time}</p>}
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="end_date">End Date</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        className={errors.end_date ? 'border-red-500' : ''}
                                    />
                                    {errors.end_date && <p className="text-sm text-red-600 mt-1">{errors.end_date}</p>}
                                </div>

                                {!data.all_day && (
                                    <div>
                                        <Label htmlFor="end_time">End Time</Label>
                                        <Input
                                            id="end_time"
                                            type="time"
                                            value={data.end_time}
                                            onChange={(e) => setData('end_time', e.target.value)}
                                            className={errors.end_time ? 'border-red-500' : ''}
                                        />
                                        {errors.end_time && <p className="text-sm text-red-600 mt-1">{errors.end_time}</p>}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Additional Details
                            </CardTitle>
                            <CardDescription>
                                Location and visibility settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    type="text"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    className={errors.location ? 'border-red-500' : ''}
                                    placeholder="Event location or address..."
                                />
                                {errors.location && <p className="text-sm text-red-600 mt-1">{errors.location}</p>}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="members_only"
                                    checked={data.members_only}
                                    onCheckedChange={(checked) => setData('members_only', checked as boolean)}
                                />
                                <Label htmlFor="members_only" className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Members Only Event
                                </Label>
                            </div>
                            <p className="text-sm text-gray-600">
                                Members only events require authentication to view
                            </p>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.get('/admin/events')}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Updating...' : 'Update Event'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}