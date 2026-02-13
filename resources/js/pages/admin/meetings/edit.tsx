import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Committee, Board, Meeting, BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Props {
    meetable: Committee | Board;
    meetableType: 'committee' | 'board';
    meeting: Meeting;
}

export default function Edit({ meetable, meetableType, meeting }: Readonly<Props>) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: meetableType === 'committee' ? 'Committees' : 'Boards', href: `/admin/${meetableType}s` },
        { title: meetable.name, href: `/admin/${meetableType}s/${meetable.id}` },
        { title: 'Meetings', href: `/admin/meetings/${meetableType}/${meetable.id}` },
        { title: 'Edit', href: `/admin/meetings/${meetableType}/${meetable.id}/${meeting.id}/edit` },
    ];

    // Format datetime for input
    const formattedDateTime = new Date(meeting.meeting_date).toISOString().slice(0, 16);

    const { data, setData, put, processing, errors } = useForm({
        title: meeting.title || '',
        agenda: meeting.agenda || '',
        meeting_date: formattedDateTime,
        location: meeting.location || '',
        meeting_link: meeting.meeting_link || '',
        minutes: meeting.minutes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/meetings/${meetableType}/${meetable.id}/${meeting.id}`);
    };

    const getBackRoute = () => {
        return `/admin/meetings/${meetableType}/${meetable.id}/${meeting.id}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Meeting - ${meeting.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 max-w-2xl">
                <div className="mb-6">
                    <Link
                        href={getBackRoute()}
                        className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
                    >
                        ← Back to Meeting
                    </Link>
                    <h1 className="text-3xl font-bold">Edit Meeting</h1>
                    <p className="text-muted-foreground mt-1">{meetable.name}</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Meeting Details</CardTitle>
                        <CardDescription>Update meeting information and add minutes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Meeting Title *</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g., Monthly Planning Meeting"
                                    required
                                />
                                {errors.title && (
                                    <p className="text-sm text-destructive">{errors.title}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="meeting_date">Date & Time *</Label>
                                <Input
                                    id="meeting_date"
                                    type="datetime-local"
                                    value={data.meeting_date}
                                    onChange={(e) => setData('meeting_date', e.target.value)}
                                    required
                                />
                                {errors.meeting_date && (
                                    <p className="text-sm text-destructive">{errors.meeting_date}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    placeholder="e.g., Conference Room, Synagogue Office"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Optional: Physical location for in-person meetings
                                </p>
                                {errors.location && (
                                    <p className="text-sm text-destructive">{errors.location}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="meeting_link">Meeting Link</Label>
                                <Input
                                    id="meeting_link"
                                    type="url"
                                    value={data.meeting_link}
                                    onChange={(e) => setData('meeting_link', e.target.value)}
                                    placeholder="https://zoom.us/j/..."
                                />
                                <p className="text-xs text-muted-foreground">
                                    Optional: Zoom, Google Meet, or other video conferencing link
                                </p>
                                {errors.meeting_link && (
                                    <p className="text-sm text-destructive">{errors.meeting_link}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="agenda">Agenda</Label>
                                <Textarea
                                    id="agenda"
                                    value={data.agenda}
                                    onChange={(e) => setData('agenda', e.target.value)}
                                    placeholder="Meeting agenda and discussion topics..."
                                    rows={8}
                                />
                                {errors.agenda && (
                                    <p className="text-sm text-destructive">{errors.agenda}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="minutes">Meeting Minutes</Label>
                                <Textarea
                                    id="minutes"
                                    value={data.minutes}
                                    onChange={(e) => setData('minutes', e.target.value)}
                                    placeholder="Record meeting minutes, decisions, and action items..."
                                    rows={12}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Add meeting minutes after the meeting has concluded
                                </p>
                                {errors.minutes && (
                                    <p className="text-sm text-destructive">{errors.minutes}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={getBackRoute()}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
