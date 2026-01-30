import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
import { Edit, Eye, FileText, Globe, Trash2, Download } from 'lucide-react';

interface HtmlTemplate {
  id: number;
  name: string;
}

interface HtmlPage {
  id: number;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  template: HtmlTemplate | null;
  published_at: string | null;
  show_in_nav: boolean;
  sort_order: number;
}

interface Props {
  pages: HtmlPage[];
}

export default function HtmlPagesIndex({ pages }: Readonly<Props>) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'HTML Publisher', href: '/admin/html-pages' },
    { title: 'Pages', href: '/admin/html-pages' },
  ];

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this page?')) {
      router.delete(`/admin/html-pages/${id}`);
    }
  };

  const handlePublish = (id: number) => {
    if (confirm('Publish this page?')) {
      router.post(`/admin/html-pages/${id}/publish`);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="HTML Pages" />

      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">HTML Pages</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                window.location.href = '/admin/html-pages/export-all';
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export All as ZIP
            </Button>
            <Link href="/admin/html-pages/create">
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Create Page
              </Button>
            </Link>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Template</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">In Navigation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Published</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
              {pages.length === 0 ? (
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No pages yet. Create your first page to get started.
                  </td>
                </tr>
              ) : (
                pages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{page.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{page.slug}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{page.template?.name || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          page.status === 'published'
                            ? 'default'
                            : page.status === 'draft'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {page.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{page.show_in_nav ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {page.published_at
                        ? new Date(page.published_at).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a
                            href={`/admin/html-pages/${page.id}/preview`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Link href={`/admin/html-pages/${page.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        {page.status !== 'published' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePublish(page.id)}
                          >
                            <Globe className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(page.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
