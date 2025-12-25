import React, { useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, MapPin, User, Plus } from 'lucide-react';
import { BreadcrumbItem, Deed } from '@/types';

interface Props {
  deed: Deed;
}

export default function DeedsShow({ deed }: Readonly<Props>) {
  const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cemetery', href: '/admin/deeds' },
    { title: 'Deeds', href: '/admin/deeds' },
    { title: deed.deed_number, href: `/admin/deeds/${deed.id}` },
  ], [deed]);

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete deed ${deed.deed_number}?`)) {
      router.delete(`/admin/deeds/${deed.id}`, {
        onSuccess: () => router.visit('/admin/deeds'),
      });
    }
  };

  const formatCurrency = (amount: string | undefined) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const availableSpace = deed.capacity - deed.occupied;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Deed ${deed.deed_number}`} />

      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Deed {deed.deed_number}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">View and manage deed details</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/deeds/${deed.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button variant="outline" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Deed Information</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Deed Number</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{deed.deed_number}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Plot Type</p>
                  <Badge className="mt-1">
                    {deed.plot_type.charAt(0).toUpperCase() + deed.plot_type.slice(1)}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {deed.plot_location}
                      {deed.section && ` - ${deed.section}`}
                      {deed.row && `-${deed.row}`}
                      {` #${deed.plot_number}`}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Capacity</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {deed.occupied} / {deed.capacity} occupied
                    {availableSpace > 0 && (
                      <span className="text-green-600 dark:text-green-400 ml-2">
                        ({availableSpace} available)
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Purchase Date</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(deed.purchase_date)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Purchase Price</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(deed.purchase_price)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <Badge className="mt-1" variant={deed.is_active ? 'default' : 'secondary'}>
                    {deed.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {deed.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{deed.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Interments */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Interments</h2>
                <Link href={`/admin/interments/create?deed=${deed.id}`}>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Interment
                  </Button>
                </Link>
              </div>

              {deed.interments && deed.interments.length > 0 ? (
                <div className="space-y-3">
                  {deed.interments.map((interment) => (
                    <div
                      key={interment.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <Link
                            href={`/admin/interments/${interment.id}`}
                            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {interment.first_name} {interment.last_name}
                          </Link>
                          {interment.hebrew_name && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{interment.hebrew_name}</p>
                          )}
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(interment.date_of_death)} - {formatDate(interment.interment_date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No interments recorded yet
                </p>
              )}
            </div>

            {/* Gravesites */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Associated Gravesites</h2>

              {deed.gravesites && deed.gravesites.length > 0 ? (
                <div className="space-y-3">
                  {deed.gravesites.map((gravesite) => (
                    <div
                      key={gravesite.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link
                            href={`/admin/gravesites/${gravesite.id}`}
                            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Plot {gravesite.plot_number}
                          </Link>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {gravesite.cemetery_name && <div>{gravesite.cemetery_name}</div>}
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>
                                {gravesite.section && `Section ${gravesite.section}`}
                                {gravesite.row && `, Row ${gravesite.row}`}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <Badge 
                              className={
                                gravesite.status === 'available' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                  : gravesite.status === 'reserved'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              }
                            >
                              {gravesite.status}
                            </Badge>
                            <Badge className="ml-2" variant="outline">
                              {gravesite.gravesite_type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No gravesites associated with this deed
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Owner</h2>
              {deed.member ? (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <Link
                      href={`/admin/members/${deed.member.id}`}
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {deed.member.first_name} {deed.member.last_name}
                    </Link>
                    {deed.member.email && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{deed.member.email}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No owner assigned</p>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Metadata</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{formatDate(deed.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{formatDate(deed.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
