import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/rich-text-editor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import { Edit2, Save, X, FileText, Copy, Check } from 'lucide-react';

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  pivot: {
    status: 'pending' | 'confirmed' | 'unsubscribed';
    confirmed_at: string | null;
    unsubscribed_at: string | null;
  };
}

interface EmailCampaign {
  id: number;
  name: string;
  description: string | null;
  subject: string;
  content: string;
  opt_in_type: 'single' | 'double';
  is_active: boolean;
  subscribers: Member[];
}

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  content: string;
}

interface Props {
  campaign: EmailCampaign;
  templates: EmailTemplate[];
}

export default function CampaignShow({ campaign, templates }: Readonly<Props>) {
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailSubject, setEmailSubject] = useState(campaign.subject);
  const [emailContent, setEmailContent] = useState(campaign.content);
  const [isCopied, setIsCopied] = useState(false);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Email Campaigns',
      href: '/admin/campaigns',
    },
    {
      title: campaign.name,
      href: `/admin/campaigns/${campaign.id}`,
    },
  ];

  const filteredSubscribers = campaign.subscribers.filter((sub) => {
    if (filterStatus === 'all') return true;
    return sub.pivot.status === filterStatus;
  });

  const confirmedCount = campaign.subscribers.filter(s => s.pivot.status === 'confirmed').length;
  const pendingCount = campaign.subscribers.filter(s => s.pivot.status === 'pending').length;
  const unsubscribedCount = campaign.subscribers.filter(s => s.pivot.status === 'unsubscribed').length;

  const generateEmbedCode = () => {
    const baseUrl = window.location.origin;
    const subscribeUrl = `${baseUrl}/admin/campaigns/${campaign.id}/subscribe`;
    
    return `<!-- Email Campaign Signup Form -->
<div style="max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: system-ui, -apple-system, sans-serif;">
  <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #111827;">Subscribe to ${campaign.name.replace(/"/g, '&quot;')}</h3>
  ${campaign.description ? `<p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">${campaign.description.replace(/"/g, '&quot;')}</p>` : ''}
  <form action="${subscribeUrl}" method="POST" style="display: flex; flex-direction: column; gap: 12px;">
    <input type="hidden" name="_token" value="{{ csrf_token() }}">
    <div>
      <label style="display: block; margin-bottom: 4px; font-size: 14px; font-weight: 500; color: #374151;">First Name</label>
      <input type="text" name="first_name" required style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
    </div>
    <div>
      <label style="display: block; margin-bottom: 4px; font-size: 14px; font-weight: 500; color: #374151;">Last Name</label>
      <input type="text" name="last_name" required style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
    </div>
    <div>
      <label style="display: block; margin-bottom: 4px; font-size: 14px; font-weight: 500; color: #374151;">Email Address</label>
      <input type="email" name="email" required style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
    </div>
    <button type="submit" style="width: 100%; padding: 10px 16px; background-color: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">Subscribe</button>
    ${campaign.opt_in_type === 'double' ? '<p style="margin: 8px 0 0 0; font-size: 12px; color: #6b7280; text-align: center;">You will receive a confirmation email.</p>' : ''}
  </form>
</div>`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateEmbedCode());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy code to clipboard');
    }
  };

  const handleSubscribe = () => {
    if (selectedMember) {
      router.post(`/admin/campaigns/${campaign.id}/subscribe`, {
        member_id: selectedMember,
      }, {
        onSuccess: () => {
          setShowSubscribeDialog(false);
          setSelectedMember(null);
        },
      });
    }
  };

  const handleUnsubscribe = (memberId: number) => {
    if (confirm('Unsubscribe this member from the campaign?')) {
      router.post(`/admin/campaigns/${campaign.id}/unsubscribe`, {
        member_id: memberId,
      });
    }
  };

  const handleSend = () => {
    if (confirm(`Send this campaign to ${confirmedCount} confirmed subscribers?`)) {
      router.post(`/admin/campaigns/${campaign.id}/send`);
    }
  };

  const handleSaveEmail = () => {
    router.put(`/admin/campaigns/${campaign.id}`, {
      subject: emailSubject,
      content: emailContent,
    }, {
      onSuccess: () => {
        setIsEditingEmail(false);
      },
    });
  };

  const handleCancelEdit = () => {
    setEmailSubject(campaign.subject);
    setEmailContent(campaign.content);
    setIsEditingEmail(false);
  };

  const handleLoadTemplate = (templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setEmailSubject(template.subject.replace('{campaign_name}', campaign.name));
      setEmailContent(template.content);
      setShowTemplateDialog(false);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={campaign.name} />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{campaign.name}</h1>
              <Badge variant={campaign.is_active ? 'default' : 'secondary'}>
                {campaign.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant={campaign.opt_in_type === 'double' ? 'default' : 'secondary'}>
                {campaign.opt_in_type === 'double' ? 'Double Opt-in' : 'Single Opt-in'}
              </Badge>
            </div>
            {campaign.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{campaign.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSend} disabled={confirmedCount === 0}>
              Send Campaign
            </Button>
            <Link href={`/admin/campaigns/${campaign.id}/edit`}>
              <Button variant="outline">Edit</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Total Subscribers</p>
            <p className="text-2xl font-bold">{campaign.subscribers.length}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Confirmed</p>
            <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
          </div>
          {campaign.opt_in_type === 'double' && (
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
          )}
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Unsubscribed</p>
            <p className="text-2xl font-bold text-gray-500">{unsubscribedCount}</p>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Email Content</h2>
            <div className="flex gap-2">
              {isEditingEmail ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setShowTemplateDialog(true)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Load Template
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveEmail}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditingEmail(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject" className="text-sm text-gray-500">Subject</Label>
              {isEditingEmail ? (
                <Input
                  id="subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="font-medium mt-1">{campaign.subject}</p>
              )}
            </div>
            <div>
              <Label htmlFor="content" className="text-sm text-gray-500">Body</Label>
              {isEditingEmail ? (
                <RichTextEditor
                  value={emailContent}
                  onChange={setEmailContent}
                  className="mt-1 min-h-[300px]"
                />
              ) : (
                <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                  <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: campaign.content }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Embeddable Signup Form</h2>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Copy this code and paste it into any webpage to allow visitors to subscribe to this campaign.
          </p>
          <Textarea
            value={generateEmbedCode()}
            readOnly
            className="font-mono text-xs h-64"
            onClick={(e) => e.currentTarget.select()}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Subscribers</h2>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ({campaign.subscribers.length})</SelectItem>
                  <SelectItem value="confirmed">Confirmed ({confirmedCount})</SelectItem>
                  {campaign.opt_in_type === 'double' && (
                    <SelectItem value="pending">Pending ({pendingCount})</SelectItem>
                  )}
                  <SelectItem value="unsubscribed">Unsubscribed ({unsubscribedCount})</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setShowSubscribeDialog(true)}>
                Add Subscriber
              </Button>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No subscribers found
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        <Link
                          href={`/admin/members/${subscriber.id}`}
                          className="hover:underline text-blue-600 dark:text-blue-400"
                        >
                          {subscriber.first_name} {subscriber.last_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{subscriber.email || 'No email'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            subscriber.pivot.status === 'confirmed'
                              ? 'default'
                              : subscriber.pivot.status === 'pending'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {subscriber.pivot.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {subscriber.pivot.status === 'confirmed' && subscriber.pivot.confirmed_at
                          ? new Date(subscriber.pivot.confirmed_at).toLocaleDateString()
                          : subscriber.pivot.status === 'unsubscribed' && subscriber.pivot.unsubscribed_at
                          ? new Date(subscriber.pivot.unsubscribed_at).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {subscriber.pivot.status !== 'unsubscribed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnsubscribe(subscriber.id)}
                          >
                            Unsubscribe
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subscriber</DialogTitle>
            <DialogDescription>
              Select a member to subscribe to this campaign.
              {campaign.opt_in_type === 'double' && ' A confirmation email will be sent.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-2">
              Note: You would typically integrate with your members list here.
              For now, please use the bulk subscribe feature or contact support.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubscribeDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Load Email Template</DialogTitle>
            <DialogDescription>
              Select a template to load into your campaign email. This will replace the current subject and content.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
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
