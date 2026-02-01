import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, ArrowLeft, User, CalendarDays } from 'lucide-react';
import { type BreadcrumbItem, type CommitteeMembership } from '@/types';

interface Committee {
  id: number;
  name: string;
  description?: string;
  members?: CommitteeMembership[];
  created_at: string;
  updated_at: string;
}

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Props {
  committee: Committee;
  availableMembers: Member[];
}

export default function CommitteesShow({ committee }: Readonly<Props>) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Committees', href: '/admin/committees' },
    { title: committee.name, href: `/admin/committees/${committee.id}` },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={committee.name} />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/committees">
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
          <div className="flex gap-2">
            <Link href={`/admin/meetings/committee/${committee.id}`}>
              <Button variant="outline">
                <CalendarDays className="mr-2 h-4 w-4" />
                Meetings
              </Button>
            </Link>
            <Link href={`/admin/committees/${committee.id}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Committee
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Committee Members</CardTitle>
              <CardDescription>
                {committee.members?.length || 0} member{committee.members?.length === 1 ? '' : 's'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {committee.members && committee.members.length > 0 ? (
                <div className="space-y-4">
                  {committee.members.map((member) => {
                    const isActive = !member.pivot?.term_end_date ||
                      new Date(member.pivot.term_end_date) >= new Date();

                    return (
                      <div
                        key={member.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4" />
                              <h3 className="font-medium">
                                {member.first_name} {member.last_name}
                              </h3>
                              <Badge variant={isActive ? 'default' : 'secondary'}>
                                {isActive ? 'Active' : 'Expired'}
                              </Badge>
                            </div>

                            {member.pivot?.title && (
                              <div className="text-sm text-muted-foreground mb-2">
                                <span className="font-medium">Position:</span> {member.pivot.title}
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="font-medium text-muted-foreground">Term Start:</span>
                                <div>
                                  {member.pivot?.term_start_date
                                    ? formatDate(member.pivot.term_start_date)
                                    : 'N/A'}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">Term End:</span>
                                <div>
                                  {member.pivot?.term_end_date
                                    ? formatDate(member.pivot.term_end_date)
                                    : 'Ongoing'}
                                </div>
                              </div>
                            </div>
                          </div>

                          <Link href={`/admin/members/${member.id}`}>
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    No members assigned to this committee yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
