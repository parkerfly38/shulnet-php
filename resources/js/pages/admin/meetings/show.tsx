import { useTranslation } from '@/hooks/use-translation';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Committee, Board, Meeting, BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, Video, FileText, Mail, Pencil, Trash2 } from 'lucide-react';

interface Props {
    meetable: Committee | Board;
    meetableType: 'committee' | 'board';
    meeting: Meeting;
}

export default function Show({ meetable, meetableType, meeting }: Readonly<Props>) {
    const { t } = useTranslation();
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

    const isMeetingPast = new Date(meeting.meeting_date) < new Date();

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) {
            router.delete(`/admin/meetings/${meetableType}/${meetable.id}/${meeting.id}`);
        }
    };

    const handleSendInvitations = () => {
        router.post(`/admin/meetings/${meetableType}/${meetable.id}/${meeting.id}/send-invitations`);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: meetableType === 'committee' ? 'Committees' : 'Boards', href: `/admin/${meetableType}s` },
        { title: meetable.name, href: `/admin/${meetableType}s/${meetable.id}` },
        { title: 'Meetings', href: `/admin/meetings/${meetableType}/${meetable.id}` },
        { title: meeting.title, href: `/admin/meetings/${meetableType}/${meetable.id}/${meeting.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={meeting.title} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 max-w-4xl">
                <div className="mb-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">{meeting.title}</h1>
                            <p className="text-muted-foreground mt-1">{meetable.name}</p>
                        </div>
                        <Badge variant={isMeetingPast ? 'secondary' : 'default'}>
                            {isMeetingPast ? 'Past' : 'Upcoming'}
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-6">
                    {/* Meeting Details Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Meeting Details')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">
                                        {formatDate(meeting.meeting_date)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{t('Date')}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">{formatTime(meeting.meeting_date)}</p>
                                    <p className="text-sm text-muted-foreground">{t('Time')}</p>
                                </div>
                            </div>

                            {meeting.location && (
                                <>
                                    <Separator />
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{meeting.location}</p>
                                            <p className="text-sm text-muted-foreground">{t('Location')}</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {meeting.meeting_link && (
                                <>
                                    <Separator />
                                    <div className="flex items-center gap-3">
                                        <Video className="h-5 w-5 text-muted-foreground" />
                                        <div className="flex-1">
                                            <a
                                                href={meeting.meeting_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-primary hover:underline"
                                            >
                                                {t('Join Meeting')}
                                            </a>
                                            <p className="text-sm text-muted-foreground">{t('Video Conference Link')}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Agenda Card */}
                    {meeting.agenda && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('Agenda')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="whitespace-pre-line text-sm">{meeting.agenda}</div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Minutes Card */}
                    {meeting.minutes && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    <CardTitle>{t('Meeting Minutes')}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="whitespace-pre-line text-sm">{meeting.minutes}</div>
                            </CardContent>
                        </Card>
                    )}
                    
                    {!meeting.minutes && isMeetingPast && (
                        <Card className="border-dashed">
                            <CardContent className="py-8 text-center">
                                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                                <h3 className="font-semibold mb-2">{t('No Minutes Available')}</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {t('Add meeting minutes to document decisions and action items')}
                                </p>
                                <Button variant="outline" asChild>
                                    <Link href={`/admin/meetings/${meetableType}/${meetable.id}/${meeting.id}/edit`}>
                                        <Pencil className="me-2 h-4 w-4" />
                                        {t('Add Minutes')}
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Actions')}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {!isMeetingPast && (
                                <Button onClick={handleSendInvitations}>
                                    <Mail className="me-2 h-4 w-4" />
                                    {t('Send Invitations')}
                                </Button>
                            )}
                            <Button variant="outline" asChild>
                                <Link href={`/admin/meetings/${meetableType}/${meetable.id}/${meeting.id}/edit`}>
                                    <Pencil className="me-2 h-4 w-4" />
                                    {t('Edit Meeting')}
                                </Link>
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                <Trash2 className="me-2 h-4 w-4" />
                                {t('Delete Meeting')}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
