import React, { useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, User, MapPin, Calendar } from 'lucide-react';
import { BreadcrumbItem, Interment } from '@/types';

interface Props {
  interment: Interment;
}

export default function IntermentsShow({ interment }: Readonly<Props>) {
  const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cemetery', href: '/admin/interments' },
    { title: 'Interments', href: '/admin/interments' },
    { title: `${interment.first_name} ${interment.last_name}`, href: `/admin/interments/${interment.id}` },
  ], [interment]);

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete the interment record for ${interment.first_name} ${interment.last_name}?`)) {
      router.delete(`/admin/interments/${interment.id}`, {
        onSuccess: () => router.visit('/admin/interments'),
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`${interment.first_name} ${interment.last_name}`} />

      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {interment.first_name} {interment.middle_name} {interment.last_name}
              </h1>
              {interment.hebrew_name && (
                <p className="text-gray-600 dark:text-gray-400">{interment.hebrew_name}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/interments/${interment.id}/edit`}>
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
            <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Personal Information</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {interment.first_name} {interment.middle_name} {interment.last_name}
                  </p>
                </div>

                {interment.hebrew_name && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Hebrew Name</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{interment.hebrew_name}</p>
                  </div>
                )}

                {interment.date_of_birth && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(interment.date_of_birth)}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date of Death</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(interment.date_of_death)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Interment Date</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(interment.interment_date)}</p>
                  </div>
                </div>

                {interment.cause_of_death && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cause of Death</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{interment.cause_of_death}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Service Information</h2>
              
              <div className="grid grid-cols-2 gap-4">
                {interment.funeral_home && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Funeral Home</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{interment.funeral_home}</p>
                  </div>
                )}

                {interment.rabbi_officiating && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Rabbi Officiating</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{interment.rabbi_officiating}</p>
                  </div>
                )}

                {interment.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{interment.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {interment.deed && (
              <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Plot Location</h2>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <Link
                      href={`/admin/deeds/${interment.deed.id}`}
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {interment.deed.deed_number}
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {interment.deed.plot_location}
                      {interment.deed.section && ` - ${interment.deed.section}`}
                      {interment.deed.row && `-${interment.deed.row}`}
                      {` #${interment.deed.plot_number}`}
                    </p>
                    {interment.deed.member && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Owned by{' '}
                        <Link
                          href={`/admin/members/${interment.deed.member.id}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {interment.deed.member.first_name} {interment.deed.member.last_name}
                        </Link>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {interment.member && (
              <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Related Member</h2>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-full">
                    <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <Link
                      href={`/admin/members/${interment.member.id}`}
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {interment.member.first_name} {interment.member.last_name}
                    </Link>
                    {interment.member.email && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{interment.member.email}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Metadata</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{formatDate(interment.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{formatDate(interment.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
