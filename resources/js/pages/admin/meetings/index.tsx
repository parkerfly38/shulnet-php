import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Committee, Board, Meeting, BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Plus, Video, FileText } from 'lucide-react';

interface Props {
    meetable: Committee | Board;
    meetableType: 'committee' | 'board';
    meetings: Meeting[];
}

export default function Index({ meetable, meetableType, meetings }: Readonly<Props>) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const isPast = (dateString: string) => {
        return new Date(dateString) < new Date();
    };

    const upcomingMeetings = meetings.filter(m => !isPast(m.meeting_date));
    const pastMeetings = meetings.filter(m => isPast(m.meeting_date));

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: meetableType === 'committee' ? 'Committees' : 'Boards', href: `/admin/${meetableType}s` },
        { title: meetable.name, href: `/admin/${meetableType}s/${meetable.id}` },
        { title: 'Meetings', href: `/admin/meetings/${meetableType}/${meetable.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${meetable.name} - Meetings`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{meetable.name} Meetings</h1>
                        <p className="text-muted-foreground mt-1">Manage meetings, agendas, and minutes</p>
                    </div>
                    <Button asChild>
                        <Link href={`/admin/meetings/${meetableType}/${meetable.id}/create`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Schedule Meeting
                        </Link>
                    </Button>
                </div>

                {/* Upcoming Meetings */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Upcoming Meetings</h2>
                    {upcomingMeetings.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                No upcoming meetings scheduled
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {upcomingMeetings.map((meeting) => (
                                <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-xl">{meeting.title}</CardTitle>
                                                <CardDescription className="mt-2 flex flex-wrap gap-4">
                                                    <span className="flex items-center">
                                                        <Calendar className="mr-1 h-4 w-4" />
                                                        {formatDate(meeting.meeting_date)}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <Clock className="mr-1 h-4 w-4" />
                                                        {formatTime(meeting.meeting_date)}
                                                    </span>
                                                    {meeting.location && (
                                                        <span className="flex items-center">
                                                            <MapPin className="mr-1 h-4 w-4" />
                                                            {meeting.location}
                                                        </span>
                                                    )}
                                                    {meeting.meeting_link && (
                                                        <span className="flex items-center">
                                                            <Video className="mr-1 h-4 w-4" />
                                                            <a 
                                                                href={meeting.meeting_link} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-primary hover:underline"
                                                            >
                                                                Join Meeting
                                                            </a>
                                                        </span>
                                                    )}
                                                </CardDescription>
                                            </div>
                                            <Badge variant="default">Upcoming</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" asChild>
                                                <Link href={`/admin/meetings/${meetableType}/${meetable.id}/${meeting.id}`}>View Details</Link>
                                            </Button>
                                            <Button variant="outline" asChild>
                                                <Link href={`/admin/meetings/${meetableType}/${meetable.id}/${meeting.id}/edit`}>Edit</Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Past Meetings */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Past Meetings</h2>
                    {pastMeetings.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                No past meetings
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {pastMeetings.map((meeting) => (
                                <Card key={meeting.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-xl">{meeting.title}</CardTitle>
                                                <CardDescription className="mt-2 flex flex-wrap gap-4">
                                                    <span className="flex items-center">
                                                        <Calendar className="mr-1 h-4 w-4" />
                                                        {formatDate(meeting.meeting_date)}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <Clock className="mr-1 h-4 w-4" />
                                                        {formatTime(meeting.meeting_date)}
                                                    </span>
                                                    {meeting.location && (
                                                        <span className="flex items-center">
                                                            <MapPin className="mr-1 h-4 w-4" />
                                                            {meeting.location}
                                                        </span>
                                                    )}
                                                    {meeting.minutes && (
                                                        <span className="flex items-center text-green-600">
                                                            <FileText className="mr-1 h-4 w-4" />
                                                            Minutes Available
                                                        </span>
                                                    )}
                                                </CardDescription>
                                            </div>
                                            <Badge variant="secondary">Past</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" asChild>
                                                <Link href={`/admin/meetings/${meetableType}/${meetable.id}/${meeting.id}`}>View Details</Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

