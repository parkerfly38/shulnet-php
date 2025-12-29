import React, { useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Edit, Trash2, DollarSign, Ticket } from 'lucide-react';
import { BreadcrumbItem, EventTicketType } from '@/types';

interface Event {
  id: number;
  name: string;
  event_start: string;
  event_end?: string;
}

interface Props {
  event: Event;
  ticketTypes: EventTicketType[];
}

const categoryColors: Record<string, string> = {
  early_bird: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  adult: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  child: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  member: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  nonmember: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  general: 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400',
  vip: 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400',
};

const categoryLabels: Record<string, string> = {
  early_bird: 'Early Bird',
  adult: 'Adult',
  child: 'Child',
  member: 'Member',
  nonmember: 'Non-Member',
  general: 'General',
  vip: 'VIP',
};

export default function TicketTypesIndex({ event, ticketTypes }: Readonly<Props>) {
  const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Events', href: '/admin/events' },
    { title: event.name, href: `/admin/events/${event.id}` },
    { title: 'Ticket Types', href: `/admin/events/${event.id}/ticket-types` },
  ], [event.id, event.name]);

  const handleDelete = (ticketType: EventTicketType) => {
    if (confirm(`Are you sure you want to delete "${ticketType.name}"?`)) {
      router.delete(`/admin/events/${event.id}/ticket-types/${ticketType.id}`);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const getAvailability = (ticketType: EventTicketType) => {
    if (ticketType.quantity_available === null) {
      return 'Unlimited';
    }
    const remaining = (ticketType.quantity_available ?? 0) - ticketType.quantity_sold;
    return `${remaining} / ${ticketType.quantity_available}`;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Ticket Types - ${event.name}`} />
      
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                <Ticket className="inline h-6 w-6 mr-2" />
                Ticket Types
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{event.name}</p>
            </div>
          </div>
          <Link href={`/admin/events/${event.id}/ticket-types/create`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Ticket Type
            </Button>
          </Link>
        </div>

        {/* Ticket Types Table */}
        <div className="rounded-lg border bg-white dark:bg-black shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Availability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Sale Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
                {ticketTypes.length > 0 ? (
                  ticketTypes.map((ticketType) => (
                    <tr key={ticketType.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {ticketType.name}
                        </div>
                        {ticketType.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {ticketType.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={categoryColors[ticketType.category]}>
                          {categoryLabels[ticketType.category]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100">
                          <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                          {formatCurrency(ticketType.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {getAvailability(ticketType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {ticketType.sale_starts && ticketType.sale_ends ? (
                          <>
                            {new Date(ticketType.sale_starts).toLocaleDateString()} -{' '}
                            {new Date(ticketType.sale_ends).toLocaleDateString()}
                          </>
                        ) : ticketType.sale_starts ? (
                          `From ${new Date(ticketType.sale_starts).toLocaleDateString()}`
                        ) : ticketType.sale_ends ? (
                          `Until ${new Date(ticketType.sale_ends).toLocaleDateString()}`
                        ) : (
                          'Always available'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={ticketType.active ? 'default' : 'secondary'}>
                          {ticketType.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/events/${event.id}/ticket-types/${ticketType.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(ticketType)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <Ticket className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">No ticket types found</p>
                        <p className="text-sm mt-1">Get started by creating your first ticket type.</p>
                        <Link href={`/admin/events/${event.id}/ticket-types/create`} className="mt-4 inline-block">
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Ticket Type
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
