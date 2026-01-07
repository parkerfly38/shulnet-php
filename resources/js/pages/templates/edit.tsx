import { Head, router } from '@inertiajs/react';
import { useState, FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/rich-text-editor';
import { type BreadcrumbItem } from '@/types';

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

export default function TemplateEdit({ template }: Readonly<Props>) {
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description || '');
  const [subject, setSubject] = useState(template.subject);
  const [content, setContent] = useState(template.content);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Dashboard',
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
    {
      title: 'Edit',
      href: `/admin/templates/${template.id}/edit`,
    },
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.put(`/admin/templates/${template.id}`, {
      name,
      description,
      subject,
      content,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit ${template.name}`} />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div>
          <h1 className="text-3xl font-bold">Edit Template</h1>
          <p className="text-gray-600 dark:text-gray-400">Update your email template</p>
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
                  placeholder="e.g., Welcome Email"
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
                <Label htmlFor="subject">Email Subject *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="e.g., Welcome to Our Community!"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Email Content *</Label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Enter your email content here..."
                  className="min-h-[400px]"
                />
                <p className="text-sm text-gray-500">
                  Available placeholders: {'{member_name}'}, {'{campaign_name}'}
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Update Template</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.visit('/admin/templates')}
                >
                  Cancel
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900 min-h-[600px]">
                <div className="bg-white rounded shadow-sm p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1"><strong>Subject:</strong></p>
                  <p className="text-lg">{subject || 'Email Subject'}</p>
                </div>
                <div className="bg-white rounded shadow-sm">
                  <iframe
                    srcDoc={content || '<p style="padding: 20px; color: #666;">Email preview will appear here...</p>'}
                    className="w-full min-h-[500px] border-0"
                    title="Email Preview"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
