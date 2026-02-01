import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Users2, Activity } from 'lucide-react';
import { type BreadcrumbItem, type Committee } from '@/types';

interface CommitteeWithCounts extends Committee {
  members_count: number;
  active_members_count: number;
}

interface Props {
  committees: CommitteeWithCounts[];
}

export default function CommitteesIndex({ committees }: Readonly<Props>) {
  const handleDelete = (committee: CommitteeWithCounts) => {
    if (confirm(`Are you sure you want to delete "${committee.name}"?`)) {
      router.delete(`/admin/committees/${committee.id}`);
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Committees', href: '/admin/committees' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Committees" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Committees</h1>
            <p className="text-muted-foreground mt-2">
              Manage committees and their members
            </p>
          </div>
          <Link href="/admin/committees/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Committee
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Committees</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{committees.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {committees.reduce((sum, c) => sum + c.members_count, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Memberships</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {committees.reduce((sum, c) => sum + c.active_members_count, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Committees List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {committees.length > 0 ? (
            committees.map((committee) => (
              <Card key={committee.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{committee.name}</span>
                  </CardTitle>
                  {committee.description && (
                    <CardDescription className="line-clamp-2">
                      {committee.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Members:</span>
                      <span className="font-medium">{committee.members_count}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Active:</span>
                      <span className="font-medium">{committee.active_members_count}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Link href={`/admin/committees/${committee.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/admin/committees/${committee.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(committee)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Users2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No committees found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first committee
              </p>
              <Link href="/admin/committees/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Committee
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
