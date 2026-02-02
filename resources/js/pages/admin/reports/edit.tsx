import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
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

export default function ReportsEdit({ report, reportable, reportableType }: Readonly<Props>) {
  const { data, setData, put, processing, errors } = useForm({
    title: report.title,
    report_date: report.report_date,
    content: report.content,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/reports/${reportableType}/${reportable.id}/${report.id}`);
  };

  const entityName = reportableType === 'committee' ? 'Committee' : 'Board';
  const backUrl = `/admin/reports/${reportableType}/${reportable.id}/${report.id}`;

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: `${entityName}s`, href: `/admin/${reportableType}s` },
    { title: reportable.name, href: `/admin/${reportableType}s/${reportable.id}` },
    { title: 'Reports', href: `/admin/reports/${reportableType}/${reportable.id}` },
    { title: report.title, href: backUrl },
    { title: 'Edit', href: `/admin/reports/${reportableType}/${reportable.id}/${report.id}/edit` },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Report - ${report.title}`} />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center gap-4">
          <Link href={backUrl}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Report</h1>
            <p className="text-muted-foreground mt-2">{reportable.name}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Report Title *</Label>
                <Input
                  id="title"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  placeholder="e.g., Q1 2026 Financial Report, Annual Summary"
                  required
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="report_date">Report Date *</Label>
                <Input
                  id="report_date"
                  type="date"
                  value={data.report_date}
                  onChange={(e) => setData('report_date', e.target.value)}
                  required
                />
                {errors.report_date && (
                  <p className="text-sm text-destructive">{errors.report_date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Report Content *</Label>
                <Textarea
                  id="content"
                  value={data.content}
                  onChange={(e) => setData('content', e.target.value)}
                  placeholder="Enter the full report content here..."
                  rows={15}
                  required
                />
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content}</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Link href={backUrl}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
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
