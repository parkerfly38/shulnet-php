import { Head, router } from '@inertiajs/react';
import { useState, FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { type BreadcrumbItem } from '@/types';

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
    title: 'Create Campaign',
    href: '/admin/campaigns/create',
  },
];

export default function CampaignCreate() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    content: '',
    opt_in_type: 'double' as 'single' | 'double',
    is_active: true,
    confirmation_subject: '',
    confirmation_content: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.post('/admin/campaigns', formData);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Campaign" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div>
          <h1 className="text-3xl font-bold">Create Email Campaign</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Set up a new email campaign with subscriber management
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 border rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="opt_in_type">Opt-in Type *</Label>
              <Select
                value={formData.opt_in_type}
                onValueChange={(value: 'single' | 'double') =>
                  setFormData({ ...formData, opt_in_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">
                    Single Opt-in (Immediate subscription)
                  </SelectItem>
                  <SelectItem value="double">
                    Double Opt-in (Requires email confirmation)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.opt_in_type === 'double'
                  ? 'Subscribers must confirm via email before receiving campaigns'
                  : 'Subscribers are immediately added without confirmation'}
              </p>
            </div>

            <div className="flex items-center justify-between border rounded-lg p-4">
              <div>
                <Label>Active Campaign</Label>
                <p className="text-sm text-gray-500">
                  {formData.is_active
                    ? 'Campaign is active and can accept subscribers'
                    : 'Campaign is inactive'}
                </p>
              </div>
              <Toggle
                pressed={formData.is_active}
                onPressedChange={(pressed) =>
                  setFormData({ ...formData, is_active: pressed })
                }
              >
                {formData.is_active ? 'Active' : 'Inactive'}
              </Toggle>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Email Content</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Email Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">Email Body *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  required
                  placeholder="Enter your email content here. You can use HTML formatting."
                />
                <p className="text-xs text-gray-500 mt-1">
                  HTML formatting is supported. Use {'{member_name}'} to personalize.
                </p>
              </div>
            </div>
          </div>

          {formData.opt_in_type === 'double' && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Confirmation Email (Double Opt-in)</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="confirmation_subject">Confirmation Subject</Label>
                  <Input
                    id="confirmation_subject"
                    value={formData.confirmation_subject}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmation_subject: e.target.value })
                    }
                    placeholder={`Please confirm your subscription to ${formData.name || 'our campaign'}`}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmation_content">Confirmation Body</Label>
                  <Textarea
                    id="confirmation_content"
                    value={formData.confirmation_content}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmation_content: e.target.value })
                    }
                    rows={6}
                    placeholder="Please click the link below to confirm your subscription..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    A confirmation link will be automatically included. Use {'{confirmation_url}'} to customize placement.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-end pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.visit('/admin/campaigns')}
            >
              Cancel
            </Button>
            <Button type="submit">Create Campaign</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
