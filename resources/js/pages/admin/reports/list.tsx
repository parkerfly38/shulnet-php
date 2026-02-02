import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, FileText } from 'lucide-react';
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
  reports: Report[];
  reportable: Reportable;
  reportableType: 'committee' | 'board';
}

export default function ReportList({ reports, reportable, reportableType }: Readonly<Props>) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const entityName = reportableType === 'committee' ? 'Committee' : 'Board';
  const backUrl = `/admin/${reportableType}s/${reportable.id}`;

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: `${entityName}s`, href: `/admin/${reportableType}s` },
    { title: reportable.name, href: backUrl },
    { title: 'Reports', href: `/admin/reports/${reportableType}/${reportable.id}` },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`${reportable.name} - Reports`} />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={backUrl}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{reportable.name} - Reports</h1>
              <p className="text-muted-foreground mt-2">
                {reports.length} report{reports.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <Link href={`/admin/reports/${reportableType}/${reportable.id}/create`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Report
            </Button>
          </Link>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>All Reports</CardTitle>
              <CardDescription>Reports submitted for this {reportableType}</CardDescription>
            </CardHeader>
            <CardContent>
              {reports.length > 0 ? (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4" />
                            <h3 className="font-semibold text-lg">{report.title}</h3>
                          </div>
                          <div className="text-sm text-muted-foreground mb-3">
                            {formatDate(report.report_date)}
                          </div>
                          <div className="text-sm line-clamp-2">
                            {report.content.substring(0, 200)}
                            {report.content.length > 200 ? '...' : ''}
                          </div>
                        </div>
                        <Link href={`/admin/reports/${reportableType}/${reportable.id}/${report.id}`}>
                          <Button variant="outline" size="sm">
                            View Report
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No reports created yet</p>
                  <Link href={`/admin/reports/${reportableType}/${reportable.id}/create`}>
                    <Button className="mt-4" variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Report
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
