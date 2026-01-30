import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RichTextEditor from '@/components/rich-text-editor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type BreadcrumbItem } from '@/types';
import { Save, FileText, Trash2 } from 'lucide-react';

interface EmailCampaign {
  id: number;
  name: string;
}

interface CampaignEmail {
  id: number;
  subject: string;
  content: string;
  status: 'pending' | 'sent';
  sent_at: string | null;
  created_at: string;
}

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  content: string;
}

interface Props {
  campaign: EmailCampaign;
  campaignEmail: CampaignEmail;
  templates: EmailTemplate[];
}

export default function EditCampaignEmail({ campaign, campaignEmail, templates }: Readonly<Props>) {
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const { data, setData, put, processing, errors, delete: deleteEmail } = useForm({
    subject: campaignEmail.subject,
    content: campaignEmail.content,
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Campaigns', href: '/admin/campaigns' },
    { title: campaign.name, href: `/admin/campaigns/${campaign.id}` },
    { title: 'Edit Email', href: `/admin/campaigns/${campaign.id}/emails/${campaignEmail.id}/edit` },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/campaigns/${campaign.id}/emails/${campaignEmail.id}`);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this campaign email?')) {
      deleteEmail(`/admin/campaigns/${campaign.id}/emails/${campaignEmail.id}`, {
        onSuccess: () => {
          window.location.href = `/admin/campaigns/${campaign.id}`;
        },
      });
    }
  };

  const handleLoadTemplate = (templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setData({
        subject: template.subject,
        content: template.content,
      });
      setShowTemplateDialog(false);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Email - ${campaign.name}`} />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Edit Campaign Email</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={campaignEmail.status === 'sent' ? 'default' : 'secondary'}>
                {campaignEmail.status}
              </Badge>
              {campaignEmail.sent_at && (
                <span className="text-sm text-gray-500">
                  Sent on {new Date(campaignEmail.sent_at).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowTemplateDialog(true)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Load Template
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={processing}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={processing}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Email Details</CardTitle>
                  <CardDescription>
                    Update the subject and content of this campaign email.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={data.subject}
                      onChange={(e) => setData('subject', e.target.value)}
                      placeholder="Enter email subject"
                      required
                    />
                    {errors.subject && <p className="text-sm text-red-600 mt-1">{errors.subject}</p>}
                  </div>

                  <div>
                    <Label htmlFor="content">Content</Label>
                    <RichTextEditor
                      value={data.content}
                      onChange={(value) => setData('content', value)}
                    />
                    {errors.content && <p className="text-sm text-red-600 mt-1">{errors.content}</p>}
                    <p className="text-sm text-gray-500 mt-1">
                      Available placeholders: {'{member_name}'}, {'{campaign_name}'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900 min-h-[600px] sticky top-4">
                <div className="bg-white dark:bg-gray-800 rounded shadow-sm p-4 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1"><strong>Subject:</strong></p>
                  <p className="text-lg">{data.subject || 'Email Subject'}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded shadow-sm">
                  <iframe
                    srcDoc={data.content || '<p style="padding: 20px; color: #666;">Email preview will appear here...</p>'}
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

      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Load Email Template</DialogTitle>
            <DialogDescription>
              Select a template to load. This will replace the current subject and content.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3 max-h-96 overflow-y-auto">
            {templates.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No templates available. <Link href="/admin/templates/create" className="text-blue-600 hover:underline">Create one</Link> to get started.
              </p>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => handleLoadTemplate(template.id)}
                >
                  <h3 className="font-semibold mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{template.subject}</p>
                  <div className="text-xs text-gray-500 line-clamp-2">
                    {template.content.replace(/<[^>]*>/g, ' ').substring(0, 150)}...
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
