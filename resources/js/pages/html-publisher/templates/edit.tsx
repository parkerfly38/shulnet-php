import { Head, router } from '@inertiajs/react';
import { useState, FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/rich-text-editor';
import { type BreadcrumbItem } from '@/types';

interface HtmlTemplate {
  id: number;
  name: string;
  description: string | null;
  header: string | null;
  footer: string | null;
  pages_count: number;
  created_at: string;
  updated_at: string;
}

interface Props {
  template: HtmlTemplate;
}

export default function HtmlTemplateEdit({ template }: Readonly<Props>) {
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description || '');
  const [header, setHeader] = useState(template.header || '');
  const [footer, setFooter] = useState(template.footer || '');

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'HTML Publisher',
      href: '/admin/html-pages',
    },
    {
      title: 'Templates',
      href: '/admin/html-templates',
    },
    {
      title: template.name,
      href: `/admin/html-templates/${template.id}`,
    },
    {
      title: 'Edit',
      href: `/admin/html-templates/${template.id}/edit`,
    },
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.put(`/admin/html-templates/${template.id}`, {
      name,
      description,
      header,
      footer,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit ${template.name}`} />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div>
          <h1 className="text-3xl font-bold">Edit HTML Template</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update your HTML template • Used by {template.pages_count} page{template.pages_count !== 1 ? 's' : ''}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g., Main Site Template"
                />
                <p className="text-sm text-gray-500">A descriptive name for this template</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Optional description of when to use this template"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="header">Header HTML</Label>
                <RichTextEditor
                  value={header}
                  onChange={setHeader}
                  placeholder="Enter header HTML (navigation, logo, etc.)..."
                  className="min-h-[200px]"
                />
                <p className="text-sm text-gray-500">
                  This will appear at the top of all pages using this template
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer">Footer HTML</Label>
                <RichTextEditor
                  value={footer}
                  onChange={setFooter}
                  placeholder="Enter footer HTML (copyright, links, etc.)..."
                  className="min-h-[200px]"
                />
                <p className="text-sm text-gray-500">
                  This will appear at the bottom of all pages using this template
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Update Template</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.visit('/admin/html-templates')}
                >
                  Cancel
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900 min-h-[600px]">
                <div className="bg-white rounded shadow-sm">
                  <div className="border-b-2 border-blue-500 bg-blue-50 p-4">
                    <p className="text-xs font-semibold text-blue-700 mb-2">HEADER</p>
                    <div 
                      dangerouslySetInnerHTML={{ __html: header || '<p class="text-gray-400">Header preview will appear here...</p>' }}
                      className="prose prose-sm max-w-none"
                    />
                  </div>
                  <div className="p-8">
                    <p className="text-gray-400 italic text-center">Page content will appear here</p>
                  </div>
                  <div className="border-t-2 border-gray-300 bg-gray-50 p-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2">FOOTER</p>
                    <div 
                      dangerouslySetInnerHTML={{ __html: footer || '<p class="text-gray-400">Footer preview will appear here...</p>' }}
                      className="prose prose-sm max-w-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
