import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { Edit, Eye, Globe, Calendar, FileText, Layout } from 'lucide-react';

interface HtmlTemplate {
  id: number;
  name: string;
  description: string | null;
}

interface HtmlPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  header: string | null;
  footer: string | null;
  navigation: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  template: HtmlTemplate | null;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  show_in_nav: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface Props {
  page: HtmlPage;
}

export default function HtmlPageShow({ page }: Readonly<Props>) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'HTML Publisher', href: '/admin/html-pages' },
    { title: 'Pages', href: '/admin/html-pages' },
    { title: page.title, href: `/admin/html-pages/${page.id}` },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={page.title} />

      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{page.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">/{page.slug}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              asChild
            >
              <a
                href={`/admin/html-pages/${page.id}/preview`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </a>
            </Button>
            <Link href={`/admin/html-pages/${page.id}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Page
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: page.content || '<p class="text-gray-400 italic">No content yet</p>' }}
                />
              </CardContent>
            </Card>

            {page.header && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="h-4 w-4" />
                    Custom Header
                  </CardTitle>
                  <CardDescription>This page has a custom header (overriding template)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: page.header }}
                  />
                </CardContent>
              </Card>
            )}

            {page.navigation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="h-4 w-4" />
                    Custom Navigation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: page.navigation }}
                  />
                </CardContent>
              </Card>
            )}

            {page.footer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="h-4 w-4" />
                    Custom Footer
                  </CardTitle>
                  <CardDescription>This page has a custom footer (overriding template)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: page.footer }}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Page Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                  <Badge
                    variant={
                      page.status === 'published'
                        ? 'default'
                        : page.status === 'draft'
                        ? 'secondary'
                        : 'outline'
                    }
                    className="mt-1"
                  >
                    {page.status}
                  </Badge>
                </div>

                {page.template && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Template</p>
                    <p className="mt-1 font-medium">{page.template.name}</p>
                    {page.template.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{page.template.description}</p>
                    )}
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Navigation</p>
                  <p className="mt-1">
                    {page.show_in_nav ? (
                      <span className="text-green-600 dark:text-green-400">Visible (Order: {page.sort_order})</span>
                    ) : (
                      <span className="text-gray-600 dark:text-gray-400">Hidden</span>
                    )}
                  </p>
                </div>

                {page.published_at && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Published
                    </p>
                    <p className="mt-1 text-sm">
                      {new Date(page.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created
                  </p>
                  <p className="mt-1 text-sm">
                    {new Date(page.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
                  <p className="mt-1 text-sm">
                    {new Date(page.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {(page.meta_description || page.meta_keywords) && (
              <Card>
                <CardHeader>
                  <CardTitle>SEO Meta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {page.meta_description && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
                      <p className="mt-1 text-sm">{page.meta_description}</p>
                    </div>
                  )}
                  {page.meta_keywords && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Keywords</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {page.meta_keywords.split(',').map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
