import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
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
];

interface EmailCampaign {
  id: number;
  name: string;
  description: string | null;
  opt_in_type: 'single' | 'double';
  is_active: boolean;
  subscribers_count: number;
  confirmed_subscribers_count: number;
  pending_subscribers_count: number;
  created_at: string;
  updated_at: string;
}

interface Props {
  campaigns: EmailCampaign[];
}

export default function CampaignIndex({ campaigns }: Readonly<Props>) {
  const [search, setSearch] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (selectedCampaign) {
      router.delete(`/admin/campaigns/${selectedCampaign.id}`, {
        onSuccess: () => {
          setDeleteDialog(false);
          setSelectedCampaign(null);
        },
      });
    }
  };

  const handleSend = (campaign: EmailCampaign) => {
    if (confirm(`Send this campaign to ${campaign.confirmed_subscribers_count} confirmed subscribers?`)) {
      router.post(`/admin/campaigns/${campaign.id}/send`);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Email Campaigns" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Email Campaigns</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage email campaigns with single or double opt-in
            </p>
          </div>
          <Link href="/admin/campaigns/create">
            <Button>Create Campaign</Button>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Input
            type="search"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Opt-in Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subscribers</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCampaigns.length === 0 ? (
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No campaigns found
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      <Link
                        href={`/admin/campaigns/${campaign.id}`}
                        className="hover:underline text-blue-600 dark:text-blue-400"
                      >
                        {campaign.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={campaign.opt_in_type === 'double' ? 'default' : 'secondary'}>
                        {campaign.opt_in_type === 'double' ? 'Double Opt-in' : 'Single Opt-in'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={campaign.is_active ? 'default' : 'secondary'}>
                        {campaign.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col text-sm">
                        <span className="font-medium">{campaign.confirmed_subscribers_count} confirmed</span>
                        {campaign.opt_in_type === 'double' && campaign.pending_subscribers_count > 0 && (
                          <span className="text-gray-500">{campaign.pending_subscribers_count} pending</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSend(campaign)}
                          disabled={campaign.confirmed_subscribers_count === 0}
                        >
                          Send
                        </Button>
                        <Link href={`/admin/campaigns/${campaign.id}/edit`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setDeleteDialog(true);
                          }}
                        >
                          Delete
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

      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCampaign?.name}"? This will also remove all subscriptions.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
