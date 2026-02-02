import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, CalendarDays, FileText, Mail, MapPin } from 'lucide-react';
import type { CommitteeMembership, Meeting, Report } from '@/types';

interface Committee {
  id: number;
  name: string;
  description?: string;
  members: CommitteeMembership[];
}

interface Props {
  committee: Committee;
  upcomingMeetings: Meeting[];
  reports: Report[];
}

export default function CommitteeShow({ committee, upcomingMeetings, reports }: Readonly<Props>) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <AppLayout>
      <Head title={committee.name} />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/member/committees">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{committee.name}</h1>
              {committee.description && (
                <p className="text-muted-foreground mt-2">{committee.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Meetings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                <CardTitle>Upcoming Meetings</CardTitle>
              </div>
              <CardDescription>
                {upcomingMeetings.length} upcoming meeting{upcomingMeetings.length === 1 ? '' : 's'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingMeetings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <h3 className="font-semibold mb-2">{meeting.title}</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          <span>
                            {formatDate(meeting.meeting_date)} at {formatTime(meeting.meeting_date)}
                          </span>
                        </div>
                        {meeting.meeting_link && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <a
                              href={meeting.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Join Meeting
                            </a>
                          </div>
                        )}
                        {meeting.agenda && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-xs font-medium mb-1">Agenda:</p>
                            <p className="whitespace-pre-wrap">{meeting.agenda}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarDays className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No upcoming meetings scheduled</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Committee Members */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Committee Members</CardTitle>
              </div>
              <CardDescription>
                {committee.members.length} member{committee.members.length === 1 ? '' : 's'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {committee.members.map((member) => {
                  const isActive = !member.pivot?.term_end_date ||
                    new Date(member.pivot.term_end_date) >= new Date();

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {member.first_name} {member.last_name}
                          </p>
                          {!isActive && (
                            <Badge variant="secondary" className="text-xs">
                              Past Member
                            </Badge>
                          )}
                        </div>
                        {member.pivot?.title && (
                          <p className="text-sm text-muted-foreground">{member.pivot.title}</p>
                        )}
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                          >
                            <Mail className="h-3 w-3" />
                            {member.email}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Recent Reports</CardTitle>
            </div>
            <CardDescription>
              {reports.length} report{reports.length === 1 ? '' : 's'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{report.title}</h3>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(report.report_date)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                      {report.content}
                    </p>
                    {report.content.length > 200 && (
                      <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                        Read more
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">No reports available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
