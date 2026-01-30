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

interface CampaignEmail {
  id: number;
  campaign_id: number;
  subject: string;
  content: string;
  status: 'pending' | 'sent';
  sent_at: string | null;
  created_at: string;
}

interface AvailableMember {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Props {
  campaign: EmailCampaign;
  campaignEmails: CampaignEmail[];
  templates: EmailTemplate[];
  availableMembers: AvailableMember[];
}

export default function CampaignShow({ campaign, campaignEmails, templates, availableMembers }: Readonly<Props>) {
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeTab, setSubscribeTab] = useState<'existing' | 'new'>('existing');
  const [newSubscriber, setNewSubscriber] = useState({ email: '', first_name: '', last_name: '' });
  const [viewingEmail, setViewingEmail] = useState<CampaignEmail | null>(null);

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

  const handleAddSubscriber = () => {
    if (subscribeTab === 'existing' && !selectedMember) {
      return;
    }
    
    if (subscribeTab === 'new' && (!newSubscriber.email || !newSubscriber.first_name || !newSubscriber.last_name)) {
      return;
    }

    setIsSubscribing(true);
    
    const data = subscribeTab === 'existing'
      ? { member_id: selectedMember }
      : newSubscriber;
    
    router.post(
      `/admin/campaigns/${campaign.id}/subscribe`,
      data,
      {
        onSuccess: () => {
          setShowSubscribeDialog(false);
          setSelectedMember(null);
          setSearchTerm('');
          setNewSubscriber({ email: '', first_name: '', last_name: '' });
          setSubscribeTab('existing');
        },
        onFinish: () => {
          setIsSubscribing(false);
        },
      }
    );
  };

  const handleSend = () => {
    if (confirm(`Send this campaign to ${confirmedCount} confirmed subscribers?`)) {
      router.post(`/admin/campaigns/${campaign.id}/send`);
    }
  };

  const handleSaveEmail = () => {
    router.put(`/admin/campaigns/${campaign.id}`, {
    }, {
      onSuccess: () => {
        setIsEditingEmail(false);
      },
    });
  };

  const handleCancelEdit = () => {
    setIsEditingEmail(false);
  };

  const handleLoadTemplate = (templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
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
            <h2 className="text-lg font-semibold">Campaign Emails</h2>
            <Button variant="outline" size="sm" onClick={() => router.visit(`/admin/campaigns/${campaign.id}/emails/create`)}>
              Create Email
            </Button>
          </div>
          
          {campaignEmails.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No campaign emails yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sent</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {campaignEmails.map((email) => (
                    <tr key={email.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4">
                        <div className="font-medium">{email.subject}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {email.content.replace(/<[^>]*>/g, ' ').substring(0, 100)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={email.status === 'sent' ? 'default' : 'secondary'}>
                          {email.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(email.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {email.sent_at ? new Date(email.sent_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex gap-2 justify-end">
                          {email.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.visit(`/admin/campaigns/${campaign.id}/emails/${email.id}/edit`)}
                            >
                              Edit
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingEmail(email)}
                          >
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Subscriber</DialogTitle>
            <DialogDescription>
              Add a member or new contact to this campaign.
              {campaign.opt_in_type === 'double' && ' A confirmation email will be sent.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex border-b">
            <button
              className={`px-4 py-2 font-medium transition-colors ${
                subscribeTab === 'existing'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setSubscribeTab('existing')}
            >
              Existing Member
            </button>
            <button
              className={`px-4 py-2 font-medium transition-colors ${
                subscribeTab === 'new'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setSubscribeTab('new')}
            >
              New Contact
            </button>
          </div>

          {subscribeTab === 'existing' ? (
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="search">Search Members</Label>
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {availableMembers.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  All members with email addresses are already subscribed to this campaign.
                </p>
              ) : (
                <div className="border rounded-lg max-h-96 overflow-y-auto">
                  <div className="space-y-1 p-2">
                    {availableMembers
                      .filter((member) => {
                        if (!searchTerm) return true;
                        const search = searchTerm.toLowerCase();
                        return (
                          member.first_name.toLowerCase().includes(search) ||
                          member.last_name.toLowerCase().includes(search) ||
                          member.email.toLowerCase().includes(search)
                        );
                      })
                      .map((member) => (
                        <div
                          key={member.id}
                          className={`p-3 rounded-md cursor-pointer transition-colors ${
                            selectedMember === member.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => setSelectedMember(member.id)}
                        >
                          <div className="font-medium">
                            {member.first_name} {member.last_name}
                          </div>
                          <div className="text-sm opacity-80">{member.email}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="new-email">Email Address *</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="subscriber@example.com"
                  value={newSubscriber.email}
                  onChange={(e) => setNewSubscriber({ ...newSubscriber, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-first-name">First Name *</Label>
                  <Input
                    id="new-first-name"
                    placeholder="John"
                    value={newSubscriber.first_name}
                    onChange={(e) => setNewSubscriber({ ...newSubscriber, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-last-name">Last Name *</Label>
                  <Input
                    id="new-last-name"
                    placeholder="Doe"
                    value={newSubscriber.last_name}
                    onChange={(e) => setNewSubscriber({ ...newSubscriber, last_name: e.target.value })}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                This will create a minimal contact record in your member database.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowSubscribeDialog(false);
              setSelectedMember(null);
              setSearchTerm('');
              setNewSubscriber({ email: '', first_name: '', last_name: '' });
              setSubscribeTab('existing');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddSubscriber} 
              disabled={
                isSubscribing || 
                (subscribeTab === 'existing' && !selectedMember) ||
                (subscribeTab === 'new' && (!newSubscriber.email || !newSubscriber.first_name || !newSubscriber.last_name))
              }
            >
              {isSubscribing ? 'Adding...' : 'Add Subscriber'}
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

      {/* View Email Dialog */}
      <Dialog open={!!viewingEmail} onOpenChange={() => setViewingEmail(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              {viewingEmail?.subject}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Subject</Label>
              <p className="text-sm mt-1">{viewingEmail?.subject}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <div className="mt-1">
                <Badge variant={viewingEmail?.status === 'sent' ? 'default' : 'secondary'}>
                  {viewingEmail?.status}
                </Badge>
              </div>
            </div>
            
            {viewingEmail?.sent_at && (
              <div>
                <Label className="text-sm font-medium">Sent At</Label>
                <p className="text-sm mt-1">
                  {new Date(viewingEmail.sent_at).toLocaleString()}
                </p>
              </div>
            )}
            
            <div>
              <Label className="text-sm font-medium">Email Content</Label>
              <div 
                className="mt-2 border rounded-lg p-4 bg-white"
                dangerouslySetInnerHTML={{ __html: viewingEmail?.content || '' }}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingEmail(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
