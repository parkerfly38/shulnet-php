import React, { useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Calendar } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Props {
  member: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  invoices: Array<{
    id: number;
    invoice_number: string;
    invoice_date: string;
    total: string;
    status: string;
  }>;
}

interface MembershipPeriodForm {
  begin_date: string;
  end_date: string;
  membership_type: string;
  invoice_id: string;
  notes: string;
}

export default function MembershipPeriodsCreate({ member, invoices }: Readonly<Props>) {
  const { data, setData, post, processing, errors } = useForm<MembershipPeriodForm>({
    begin_date: '',
    end_date: '',
    membership_type: 'annual',
    invoice_id: '',
    notes: '',
  });

  const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Members',
      href: '/admin/members',
    },
    {
      title: `${member.first_name} ${member.last_name}`,
      href: `/admin/members/${member.id}`,
    },
    {
      title: 'Add Membership Period',
      href: `/admin/members/${member.id}/membership-periods/create`,
    }
  ], [member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/admin/members/${member.id}/membership-periods`);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Add Membership Period - ${member.first_name} ${member.last_name}`} />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center gap-4">
          <Link href={`/admin/members/${member.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Add Membership Period
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add a new membership period for {member.first_name} {member.last_name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Membership Period Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="begin_date">Start Date *</Label>
                <Input
                  id="begin_date"
                  type="date"
                  value={data.begin_date}
                  onChange={(e) => setData('begin_date', e.target.value)}
                  className="mt-1"
                />
                {errors.begin_date && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.begin_date}</p>
                )}
              </div>

              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={data.end_date}
                  onChange={(e) => setData('end_date', e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Leave blank for ongoing membership
                </p>
                {errors.end_date && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.end_date}</p>
                )}
              </div>

              <div>
                <Label htmlFor="membership_type">Membership Type</Label>
                <Select value={data.membership_type} onValueChange={(value) => setData('membership_type', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="lifetime">Lifetime</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="honorary">Honorary</SelectItem>
                  </SelectContent>
                </Select>
                {errors.membership_type && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.membership_type}</p>
                )}
              </div>

              <div>
                <Label htmlFor="invoice_id">Associated Invoice (Optional)</Label>
                <Select value={data.invoice_id ?? " "} onValueChange={(value) => setData('invoice_id', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">None</SelectItem>
                    {invoices.map((invoice) => (
                      <SelectItem key={invoice.id} value={invoice.id.toString()}>
                        {invoice.invoice_number} - ${invoice.total} ({invoice.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.invoice_id && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.invoice_id}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={data.notes}
                  onChange={(e) => setData('notes', e.target.value)}
                  placeholder="Any additional notes about this membership period..."
                  className="mt-1"
                  rows={3}
                />
                {errors.notes && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.notes}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Link href={`/admin/members/${member.id}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={processing}>
              <Save className="h-4 w-4 mr-2" />
              {processing ? 'Saving...' : 'Save Membership Period'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
