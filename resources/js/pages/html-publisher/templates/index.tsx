import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Edit, FileText, Trash2 } from 'lucide-react';

interface HtmlTemplate {
  id: number;
  name: string;
  description: string | null;
  pages_count: number;
}

interface Props {
  templates: HtmlTemplate[];
}

export default function HtmlTemplatesIndex({ templates }: Readonly<Props>) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'HTML Publisher', href: '/admin/html-pages' },
    { title: 'Templates', href: '/admin/html-templates' },
  ];

  const handleDelete = (id: number, pagesCount: number) => {
    if (pagesCount > 0) {
      alert(`Cannot delete template. ${pagesCount} page(s) are using this template.`);
      return;
    }
    if (confirm('Are you sure you want to delete this template?')) {
      router.delete(`/admin/html-templates/${id}`);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="HTML Templates" />

      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">HTML Templates</h1>
          <Link href="/admin/html-templates/create">
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </Link>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pages Using</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
              {templates.length === 0 ? (
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No templates yet. Create a template to reuse headers, footers, and navigation.
                  </td>
                </tr>
              ) : (
                templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{template.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {template.description || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{template.pages_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/html-templates/${template.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(template.id, template.pages_count)}
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
