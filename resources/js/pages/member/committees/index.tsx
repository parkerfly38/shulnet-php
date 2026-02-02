import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CalendarDays, FileText, ChevronRight } from 'lucide-react';

interface CommitteeMember {
  id: number;
  first_name: string;
  last_name: string;
  pivot?: {
    title?: string;
    term_start_date?: string;
    term_end_date?: string;
  };
}

interface Committee {
  id: number;
  name: string;
  description?: string;
  members: CommitteeMember[];
  meetings_count: number;
  upcoming_meetings_count: number;
  pivot?: {
    title?: string;
    term_start_date?: string;
    term_end_date?: string;
  };
}

interface Props {
  committees: Committee[];
}

export default function MyCommittees({ committees }: Readonly<Props>) {
  return (
    <AppLayout>
      <Head title="My Committees" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight">My Committees</h1>
          <p className="text-muted-foreground mt-2">
            Committees you are a member of
          </p>
        </div>

        {committees.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {committees.map((committee) => {
              const isActive = !committee.pivot?.term_end_date ||
                new Date(committee.pivot.term_end_date) >= new Date();

              return (
                <Card key={committee.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{committee.name}</CardTitle>
                        {committee.description && (
                          <CardDescription className="mt-2">
                            {committee.description}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant={isActive ? 'default' : 'secondary'}>
                        {isActive ? 'Active' : 'Expired'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {committee.pivot?.title && (
                      <div className="text-sm">
                        <span className="font-medium">Your Role:</span>{' '}
                        <span className="text-muted-foreground">{committee.pivot.title}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 py-3 border-y">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                          <Users className="h-4 w-4" />
                        </div>
                        <div className="text-2xl font-bold">{committee.members.length}</div>
                        <div className="text-xs text-muted-foreground">Members</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                          <CalendarDays className="h-4 w-4" />
                        </div>
                        <div className="text-2xl font-bold">{committee.upcoming_meetings_count}</div>
                        <div className="text-xs text-muted-foreground">Upcoming</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="text-2xl font-bold">{committee.meetings_count}</div>
                        <div className="text-xs text-muted-foreground">Total Mtgs</div>
                      </div>
                    </div>

                    <Link href={`/member/committees/${committee.id}`}>
                      <Button className="w-full">
                        View Details
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                You are not currently a member of any committees
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
