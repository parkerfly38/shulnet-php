import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem, type Banner } from '@/types';

interface Props {
  banner: Banner;
}

export default function BannersEdit({ banner }: Readonly<Props>) {
  const { data, setData, put, processing, errors } = useForm({
    title: banner.title || '',
    message: banner.message || '',
    type: banner.type || ('info' as 'info' | 'warning' | 'success' | 'error'),
    target_audience: banner.target_audience || ('all' as 'members' | 'students' | 'parents' | 'all'),
    start_date: banner.start_date ? banner.start_date.split('T')[0] : '',
    end_date: banner.end_date ? banner.end_date.split('T')[0] : '',
    display_duration_seconds: banner.display_duration_seconds || 10,
    is_active: banner.is_active ?? true,
    is_dismissible: banner.is_dismissible ?? true,
    show_on_login: banner.show_on_login ?? true,
    show_on_dashboard: banner.show_on_dashboard ?? true,
    send_as_push_notification: banner.send_as_push_notification ?? false,
    action_url: banner.action_url || '',
    action_text: banner.action_text || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/banners/${banner.id}`);
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Banners', href: '/admin/banners' },
    { title: 'Edit', href: `/admin/banners/${banner.id}/edit` },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit ${banner.title}`} />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Banner</h1>
            <p className="text-muted-foreground mt-2">
              Update banner message details
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Banner Information</CardTitle>
              <CardDescription>
                Update the details for {banner.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  type="text"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  className={errors.title ? 'border-red-500' : ''}
                  placeholder="Enter banner title"
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={data.message}
                  onChange={(e) => setData('message', e.target.value)}
                  rows={4}
                  className={errors.message ? 'border-red-500' : ''}
                  placeholder="Enter banner message (HTML supported)"
                />
                {errors.message && (
                  <p className="text-sm text-red-500">{errors.message}</p>
                )}
                <p className="text-sm text-muted-foreground">HTML tags are supported for formatting</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={data.type} onValueChange={(value: 'info' | 'warning' | 'success' | 'error') => setData('type', value)}>
                    <SelectTrigger id="type" className={errors.type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select banner type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-red-500">{errors.type}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_audience">Target Audience *</Label>
                  <Select value={data.target_audience} onValueChange={(value: 'members' | 'students' | 'parents' | 'all') => setData('target_audience', value)}>
                    <SelectTrigger id="target_audience" className={errors.target_audience ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="members">Members</SelectItem>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="parents">Parents</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.target_audience && (
                    <p className="text-sm text-red-500">{errors.target_audience}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={data.start_date}
                    onChange={(e) => setData('start_date', e.target.value)}
                    className={errors.start_date ? 'border-red-500' : ''}
                  />
                  {errors.start_date && (
                    <p className="text-sm text-red-500">{errors.start_date}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={data.end_date}
                    onChange={(e) => setData('end_date', e.target.value)}
                    className={errors.end_date ? 'border-red-500' : ''}
                  />
                  {errors.end_date && (
                    <p className="text-sm text-red-500">{errors.end_date}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Leave empty for no end date</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_duration_seconds">Display Duration (seconds) *</Label>
                <Input
                  id="display_duration_seconds"
                  type="number"
                  min="1"
                  max="300"
                  value={data.display_duration_seconds}
                  onChange={(e) => setData('display_duration_seconds', Number.parseInt(e.target.value, 10))}
                  className={errors.display_duration_seconds ? 'border-red-500' : ''}
                />
                {errors.display_duration_seconds && (
                  <p className="text-sm text-red-500">{errors.display_duration_seconds}</p>
                )}
                <p className="text-sm text-muted-foreground">How long the banner stays visible (1-300 seconds)</p>
              </div>
            </CardContent>
          </Card>

          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Action Button (Optional)</CardTitle>
              <CardDescription>
                Add a call-to-action button to the banner
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="action_text">Button Text</Label>
                <Input
                  id="action_text"
                  type="text"
                  value={data.action_text}
                  onChange={(e) => setData('action_text', e.target.value)}
                  className={errors.action_text ? 'border-red-500' : ''}
                  placeholder="e.g., Learn More, Sign Up"
                />
                {errors.action_text && (
                  <p className="text-sm text-red-500">{errors.action_text}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="action_url">Button URL</Label>
                <Input
                  id="action_url"
                  type="url"
                  value={data.action_url}
                  onChange={(e) => setData('action_url', e.target.value)}
                  className={errors.action_url ? 'border-red-500' : ''}
                  placeholder="https://example.com"
                />
                {errors.action_url && (
                  <p className="text-sm text-red-500">{errors.action_url}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Display Options</CardTitle>
              <CardDescription>
                Configure where and how the banner appears
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={data.is_active}
                  onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                />
                <Label htmlFor="is_active" className="font-normal cursor-pointer">
                  Active (banner will be displayed immediately)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_dismissible"
                  checked={data.is_dismissible}
                  onCheckedChange={(checked) => setData('is_dismissible', checked as boolean)}
                />
                <Label htmlFor="is_dismissible" className="font-normal cursor-pointer">
                  Dismissible (users can close the banner)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show_on_login"
                  checked={data.show_on_login}
                  onCheckedChange={(checked) => setData('show_on_login', checked as boolean)}
                />
                <Label htmlFor="show_on_login" className="font-normal cursor-pointer">
                  Show on login page
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show_on_dashboard"
                  checked={data.show_on_dashboard}
                  onCheckedChange={(checked) => setData('show_on_dashboard', checked as boolean)}
                />
                <Label htmlFor="show_on_dashboard" className="font-normal cursor-pointer">
                  Show on dashboard
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="send_as_push_notification"
                  checked={data.send_as_push_notification}
                  onCheckedChange={(checked) => setData('send_as_push_notification', checked as boolean)}
                />
                <Label htmlFor="send_as_push_notification" className="font-normal cursor-pointer">
                  Send as push notification (mobile apps)
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>
                Banner performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Views:</span>
                  <div className="text-lg font-semibold">{banner.view_count.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Clicks:</span>
                  <div className="text-lg font-semibold">{banner.click_count.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Dismissed:</span>
                  <div className="text-lg font-semibold">{banner.dismiss_count.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 max-w-3xl">
            <Button type="submit" disabled={processing}>
              {processing ? 'Updating...' : 'Update Banner'}
            </Button>
            <Link href="/admin/banners">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
