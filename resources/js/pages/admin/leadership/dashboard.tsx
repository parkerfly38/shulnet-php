import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, CalendarDays, FileText, AlertCircle, Clock } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

// Helper function to get badge variant based on days until expiration
function getTermExpirationVariant(daysUntil: number): 'destructive' | 'default' | 'secondary' {
  if (daysUntil <= 14) return 'destructive';
  if (daysUntil <= 30) return 'default';
  return 'secondary';
}

interface Stats {
  total_committees: number;
  total_boards: number;
  total_committee_members: number;
  total_board_members: number;
  upcoming_meetings_count: number;
  recent_meetings_count: number;
  expiring_terms_count: number;
  monthly_reports_count: number;
}

interface Meeting {
  id: number;
  title: string;
  meeting_date: string;
  meeting_link?: string;
  entity_name: string;
  entity_type: string;
  entity_id: number;
  has_minutes?: boolean;
}

interface TermEnd {
  member_id: number;
  first_name: string;
  last_name: string;
  entity_id: number;
  entity_name: string;
  title?: string;
  term_end_date: string;
  entity_type: string;
}

interface Report {
  id: number;
  title: string;
  report_date: string;
  content: string;
  entity_name: string;
  entity_type: string;
  entity_id: number;
}

interface Props {
  stats: Stats;
  upcomingMeetings: Meeting[];
  recentMeetings: Meeting[];
  upcomingTermEnds: TermEnd[];
  recentReports: Report[];
}

export default function LeadershipDashboard({
  stats,
  upcomingMeetings,
  recentMeetings,
  upcomingTermEnds,
  recentReports,
}: Readonly<Props>) {
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

  const getDaysUntil = (dateString: string) => {
    const days = Math.ceil((new Date(dateString).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Leadership Dashboard', href: '/admin/leadership' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Leadership Dashboard" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Leadership Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of committees, boards, meetings, and member terms
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Committees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_committees}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total_committee_members} total members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Boards</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_boards}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total_board_members} total members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcoming_meetings_count}</div>
              <p className="text-xs text-muted-foreground">Next 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Terms</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.expiring_terms_count}</div>
              <p className="text-xs text-muted-foreground">Next 60 days</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Meetings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upcoming Meetings</CardTitle>
                  <CardDescription>Next 30 days</CardDescription>
                </div>
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {upcomingMeetings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="border-b last:border-0 pb-3 last:pb-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link
                            href={`/admin/reports/${meeting.entity_type.toLowerCase()}/${meeting.entity_id}`}
                            className="font-medium hover:underline"
                          >
                            {meeting.title}
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">
                            {meeting.entity_name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(meeting.meeting_date)} at {formatTime(meeting.meeting_date)}
                          </p>
                        </div>
                        <Badge variant="outline">{meeting.entity_type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No upcoming meetings scheduled
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Meetings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Meetings</CardTitle>
                  <CardDescription>Past 30 days</CardDescription>
                </div>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {recentMeetings.length > 0 ? (
                <div className="space-y-4">
                  {recentMeetings.map((meeting) => (
                    <div key={meeting.id} className="border-b last:border-0 pb-3 last:pb-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{meeting.title}</p>
                            {meeting.has_minutes && (
                              <Badge variant="secondary" className="text-xs">
                                Minutes
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {meeting.entity_name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(meeting.meeting_date)}
                          </p>
                        </div>
                        <Badge variant="outline">{meeting.entity_type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No recent meetings
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Term Ends */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Expiring Terms</CardTitle>
                  <CardDescription>Next 60 days</CardDescription>
                </div>
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {upcomingTermEnds.length > 0 ? (
                <div className="space-y-4">
                  {upcomingTermEnds.map((term) => {
                    const daysUntil = getDaysUntil(term.term_end_date);
                    return (
                      <div key={`${term.member_id}-${term.entity_id}-${term.entity_type}`} className="border-b last:border-0 pb-3 last:pb-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">
                              {term.first_name} {term.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {term.title || 'Member'} - {term.entity_name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Ends {formatDate(term.term_end_date)}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={getTermExpirationVariant(daysUntil)}
                            >
                              {daysUntil} days
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">{term.entity_type}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No terms expiring soon
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Reports</CardTitle>
                  <CardDescription>This month ({stats.monthly_reports_count} total)</CardDescription>
                </div>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {recentReports.length > 0 ? (
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div key={report.id} className="border-b last:border-0 pb-3 last:pb-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link
                            href={`/admin/reports/${report.entity_type.toLowerCase()}/${report.entity_id}/${report.id}`}
                            className="font-medium hover:underline"
                          >
                            {report.title}
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">
                            {report.entity_name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {report.content}...
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(report.report_date)}
                          </p>
                        </div>
                        <Badge variant="outline">{report.entity_type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No reports this month
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/committees">
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  View Committees
                </Button>
              </Link>
              <Link href="/admin/boards">
                <Button variant="outline">
                  <Briefcase className="mr-2 h-4 w-4" />
                  View Boards
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
