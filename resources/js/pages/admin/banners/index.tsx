import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, AlertCircle, Info, CheckCircle, AlertTriangle, BarChart3, Eye, MousePointerClick, XCircle } from 'lucide-react';
import { type BreadcrumbItem, type Banner } from '@/types';

interface PaginationData {
  current_page: number;
  data: Banner[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url?: string;
    label: string;
    active: boolean;
  }>;
  next_page_url?: string;
  path: string;
  per_page: number;
  prev_page_url?: string;
  to: number;
  total: number;
}

interface Props {
  banners: PaginationData;
  filters: {
    status?: string;
    audience?: string;
  };
}

export default function BannersIndex({ banners, filters }: Readonly<Props>) {
  const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
  const [selectedAudience, setSelectedAudience] = useState(filters.audience || 'all');

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    router.get('/admin/banners', { 
      status: status === 'all' ? '' : status,
      audience: selectedAudience === 'all' ? '' : selectedAudience
    }, { preserveState: true });
  };

  const handleAudienceFilter = (audience: string) => {
    setSelectedAudience(audience);
    router.get('/admin/banners', { 
      status: selectedStatus === 'all' ? '' : selectedStatus,
      audience: audience === 'all' ? '' : audience
    }, { preserveState: true });
  };

  const clearFilters = () => {
    setSelectedStatus('all');
    setSelectedAudience('all');
    router.get('/admin/banners', {}, { preserveState: true });
  };

  const handleDelete = (banner: Banner) => {
    if (confirm(`Are you sure you want to delete "${banner.title}"?`)) {
      router.delete(`/admin/banners/${banner.id}`);
    }
  };

  const toggleActive = (banner: Banner) => {
    router.post(`/admin/banners/${banner.id}/toggle-active`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getTypeBadgeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Banners', href: '/admin/banners' },
  ];

  const activeBanners = banners.data.filter(b => b.is_active);
  const totalViews = banners.data.reduce((sum, b) => sum + b.view_count, 0);
  const totalClicks = banners.data.reduce((sum, b) => sum + b.click_count, 0);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Banners" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Banner Messages</h1>
            <p className="text-muted-foreground mt-2">
              Manage system-wide banner messages for users
            </p>
          </div>
          <Link href="/admin/banners/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Banner
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Banners</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{banners.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBanners.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <Select value={selectedStatus} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select value={selectedAudience} onValueChange={handleAudienceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Audiences</SelectItem>
                <SelectItem value="members">Members</SelectItem>
                <SelectItem value="students">Students</SelectItem>
                <SelectItem value="parents">Parents</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(selectedStatus !== 'all' || selectedAudience !== 'all') && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {/* Banners List */}
        <div className="grid gap-4">
          {banners.data.length > 0 ? (
            banners.data.map((banner) => (
              <Card key={banner.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{banner.title}</CardTitle>
                        <Badge variant={getTypeBadgeVariant(banner.type)}>
                          {getTypeIcon(banner.type)}
                          <span className="ml-1 capitalize">{banner.type}</span>
                        </Badge>
                        {banner.is_active ? (
                          <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 dark:bg-gray-950">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {banner.message}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Audience:</span>
                        <span className="ml-2 font-medium capitalize">{banner.target_audience}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Start:</span>
                        <span className="ml-2 font-medium">
                          {new Date(banner.start_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">End:</span>
                        <span className="ml-2 font-medium">
                          {banner.end_date ? new Date(banner.end_date).toLocaleDateString() : 'None'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created by:</span>
                        <span className="ml-2 font-medium">{banner.creator?.name || 'Unknown'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{banner.view_count} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MousePointerClick className="h-3 w-3" />
                        <span>{banner.click_count} clicks</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        <span>{banner.dismiss_count} dismissed</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(banner)}
                      >
                        {banner.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Link href={`/admin/banners/${banner.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(banner)}
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
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No banners found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first banner message
              </p>
              <Link href="/admin/banners/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Banner
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        {banners.links.length > 3 && (
          <div className="flex justify-center gap-1 mt-4">
            {banners.links.map((link) => (
              <Button
                key={link.url || link.label}
                variant={link.active ? 'default' : 'outline'}
                size="sm"
                disabled={!link.url}
                onClick={() => link.url && router.get(link.url)}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
