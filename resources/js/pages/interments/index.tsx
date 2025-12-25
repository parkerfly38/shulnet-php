import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Users, Calendar, FileText } from 'lucide-react';
import { BreadcrumbItem, Interment, Deed, Member } from '@/types';

interface PaginatedInterments {
  data: Interment[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface IntermentStats {
  total_count: number;
  this_year: number;
  last_year: number;
  this_month: number;
}

interface Props {
  interments: PaginatedInterments;
  deeds: Deed[];
  members: Member[];
  stats: IntermentStats;
  filters: {
    search?: string;
    deed?: string;
    member?: string;
  };
}

export default function IntermentsIndex({ interments, deeds, members, stats, filters }: Readonly<Props>) {
  const [search, setSearch] = useState(filters.search || '');
  const [deedId, setDeedId] = useState(filters.deed || '');
  const [memberId, setMemberId] = useState(filters.member || '');

  const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cemetery', href: '/admin/interments' },
    { title: 'Interments', href: '/admin/interments' },
  ], []);

  const handleFilter = () => {
    router.get('/admin/interments', {
      search: search || undefined,
      deed: deedId || undefined,
      member: memberId || undefined,
    }, { preserveState: true });
  };

  const handleClearFilters = () => {
    setSearch('');
    setDeedId('');
    setMemberId('');
    router.get('/admin/interments');
  };

  const handleDelete = (interment: Interment) => {
    if (confirm(`Are you sure you want to delete the interment record for ${interment.first_name} ${interment.last_name}?`)) {
      router.delete(`/admin/interments/${interment.id}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const statCards = [
    {
      title: 'Total Interments',
      count: stats.total_count,
      subtitle: 'All time',
      icon: Users,
      textColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'This Year',
      count: stats.this_year,
      subtitle: new Date().getFullYear().toString(),
      icon: Calendar,
      textColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Last Year',
      count: stats.last_year,
      subtitle: (new Date().getFullYear() - 1).toString(),
      icon: Calendar,
      textColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'This Month',
      count: stats.this_month,
      subtitle: new Date().toLocaleDateString('en-US', { month: 'long' }),
      icon: Calendar,
      textColor: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Interments" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Interments</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage burial and interment records</p>
          </div>
          <Link href="/admin/interments/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Interment
            </Button>
          </Link>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.title}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold mt-1 ${stat.textColor}`}>
                  {stat.count}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Select value={deedId ?? ' '} onValueChange={setDeedId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Deeds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">All Deeds</SelectItem>
                  {deeds.map((deed) => (
                    <SelectItem key={deed.id} value={deed.id.toString()}>
                      {deed.deed_number} - {deed.plot_location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={memberId ?? ' '} onValueChange={setMemberId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">All Members</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.first_name} {member.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleFilter} size="sm">
              Apply Filters
            </Button>
            <Button onClick={handleClearFilters} variant="outline" size="sm">
              Clear
            </Button>
          </div>
        </div>

        {/* Interments Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Hebrew Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date of Death
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Interment Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Deed Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Related Member
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {interments.data.map((interment) => (
                  <tr
                    key={interment.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/admin/interments/${interment.id}`}
                        className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {interment.first_name} {interment.middle_name} {interment.last_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {interment.hebrew_name || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(interment.date_of_death)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(interment.interment_date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {interment.deed ? (
                        <Link
                          href={`/admin/deeds/${interment.deed.id}`}
                          className="hover:underline"
                        >
                          {interment.deed.deed_number} - {interment.deed.plot_location}
                        </Link>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {interment.member ? (
                        <Link
                          href={`/admin/members/${interment.member.id}`}
                          className="hover:underline"
                        >
                          {interment.member.first_name} {interment.member.last_name}
                        </Link>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/interments/${interment.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(interment)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {interments.data.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No interments found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by creating your first interment record.</p>
              <Link href="/admin/interments/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Interment
                </Button>
              </Link>
            </div>
          )}

          {/* Pagination */}
          {interments.last_page > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {interments.current_page} of {interments.last_page}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={interments.current_page === 1}
                  onClick={() =>
                    router.get(`/admin/interments?page=${interments.current_page - 1}`)
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={interments.current_page === interments.last_page}
                  onClick={() =>
                    router.get(`/admin/interments?page=${interments.current_page + 1}`)
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
