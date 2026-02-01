import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Report {
  id: number;
  title: string;
  report_date: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface Reportable {
  id: number;
  name: string;
}

interface Props {
  report: Report;
  reportable: Reportable;
  reportableType: 'committee' | 'board';
}

export default function ReportsShow({ report, reportable, reportableType }: Readonly<Props>) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      router.delete(`/admin/reports/${reportableType}/${reportable.id}/${report.id}`);
    }
  };

  const entityName = reportableType === 'committee' ? 'Committee' : 'Board';
  const backUrl = `/admin/reports/${reportableType}/${reportable.id}`;

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: `${entityName}s`, href: `/admin/${reportableType}s` },
    { title: reportable.name, href: `/admin/${reportableType}s/${reportable.id}` },
    { title: 'Reports', href: backUrl },
    { title: report.title, href: `/admin/reports/${reportableType}/${reportable.id}/${report.id}` },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={report.title} />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={backUrl}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{report.title}</h1>
              <p className="text-muted-foreground mt-2">{reportable.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/reports/${reportableType}/${reportable.id}/${report.id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Report Date</h3>
                <p className="text-lg">{formatDate(report.report_date)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Content</h3>
                <div className="prose max-w-none whitespace-pre-wrap">
                  {report.content}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                  <p className="text-sm">{formatDate(report.created_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h3>
                  <p className="text-sm">{formatDate(report.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
