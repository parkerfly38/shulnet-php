import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
import { FileText } from 'lucide-react';

interface EmailTemplate {
  id: number;
  name: string;
  description: string | null;
  subject: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  template: EmailTemplate;
}

export default function TemplateShow({ template }: Readonly<Props>) {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'System',
      href: '/dashboard',
    },
    {
      title: 'Email Templates',
      href: '/admin/templates',
    },
    {
      title: template.name,
      href: `/admin/templates/${template.id}`,
    },
  ];

  const handleDelete = () => {
    if (confirm(`Delete template "${template.name}"?`)) {
      router.delete(`/admin/templates/${template.id}`, {
        onSuccess: () => router.visit('/admin/templates'),
      });
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={template.name} />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-gray-400" />
              <h1 className="text-3xl font-bold">{template.name}</h1>
            </div>
            {template.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{template.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/templates/${template.id}/edit`}>
              <Button variant="outline">Edit</Button>
            </Link>
            <Button variant="outline" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Created</p>
            <p className="text-lg font-medium">{new Date(template.created_at).toLocaleString()}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="text-lg font-medium">{new Date(template.updated_at).toLocaleString()}</p>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Email Preview</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-gray-500">Subject</Label>
              <p className="font-medium mt-1 text-lg">{template.subject}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Body</Label>
              <div className="mt-2 bg-white dark:bg-gray-800 rounded border">
                <iframe
                  srcDoc={template.content}
                  className="w-full min-h-[600px] border-0 rounded"
                  title="Email Preview"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6 bg-blue-50 dark:bg-blue-950">
          <h3 className="font-semibold mb-2">Available Placeholders</h3>
          <div className="space-y-1 text-sm">
            <p><Badge variant="secondary">{'{member_name}'}</Badge> - Subscriber's full name</p>
            <p><Badge variant="secondary">{'{campaign_name}'}</Badge> - Campaign name (auto-replaced on load)</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
