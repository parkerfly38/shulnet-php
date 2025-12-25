import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, FileText, Edit, Trash2, MapPin, Users, CheckCircle, XCircle } from 'lucide-react';
import { BreadcrumbItem, Deed, Member } from '@/types';

interface PaginatedDeeds {
  data: Deed[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface DeedStats {
  total_count: number;
  available_space: number;
  total_capacity: number;
  total_occupied: number;
  single_plots: number;
  double_plots: number;
  family_plots: number;
}

interface Props {
  deeds: PaginatedDeeds;
  members: Member[];
  stats: DeedStats;
  filters: {
    search?: string;
    member?: string;
    plot_type?: string;
    has_space?: string;
  };
}

const plotTypeColors: Record<string, string> = {
  single: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  double: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  family: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
};

const plotTypeLabels: Record<string, string> = {
  single: 'Single',
  double: 'Double',
  family: 'Family',
};

export default function DeedsIndex({ deeds, members, stats, filters }: Readonly<Props>) {
  const [search, setSearch] = useState(filters.search || '');
  const [memberId, setMemberId] = useState(filters.member || '');
  const [plotType, setPlotType] = useState(filters.plot_type || '');
  const [hasSpace, setHasSpace] = useState(filters.has_space || '');

  const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cemetery', href: '/admin/deeds' },
    { title: 'Deeds', href: '/admin/deeds' },
  ], []);

  const handleFilter = () => {
    router.get('/admin/deeds', {
      search: search || undefined,
      member: memberId || undefined,
      plot_type: plotType || undefined,
      has_space: hasSpace || undefined,
    }, { preserveState: true });
  };

  const handleClearFilters = () => {
    setSearch('');
    setMemberId('');
    setPlotType('');
    setHasSpace('');
    router.get('/admin/deeds');
  };

  const handleDelete = (deed: Deed) => {
    if (confirm(`Are you sure you want to delete deed ${deed.deed_number}?`)) {
      router.delete(`/admin/deeds/${deed.id}`);
    }
  };

  const formatCurrency = (amount: string | number | undefined) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
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
      title: 'Total Deeds',
      count: stats.total_count,
      subtitle: `${stats.total_capacity} total spaces`,
      icon: FileText,
      textColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Available Space',
      count: stats.available_space,
      subtitle: `${stats.total_capacity - stats.total_occupied} spaces open`,
      icon: CheckCircle,
      textColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Single Plots',
      count: stats.single_plots,
      subtitle: '1 space each',
      icon: MapPin,
      textColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Double Plots',
      count: stats.double_plots,
      subtitle: '2 spaces each',
      icon: Users,
      textColor: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      title: 'Family Plots',
      count: stats.family_plots,
      subtitle: '4+ spaces each',
      icon: Users,
      textColor: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Deeds" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Cemetery Deeds</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage burial plot deeds and ownership</p>
          </div>
          <Link href="/admin/deeds/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Deed
            </Button>
          </Link>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search deeds, locations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                  className="pl-9"
                />
              </div>
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
            <div>
              <Select value={plotType ?? ' '} onValueChange={setPlotType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Plot Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">All Types</SelectItem>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="double">Double</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={hasSpace ?? ' '} onValueChange={setHasSpace}>
                <SelectTrigger>
                  <SelectValue placeholder="All Deeds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">All Deeds</SelectItem>
                  <SelectItem value="true">Has Space</SelectItem>
                  <SelectItem value="false">Full</SelectItem>
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

        {/* Deeds Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Deed Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Purchase Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {deeds.data.map((deed) => {
                  const availableSpace = deed.capacity - deed.occupied;
                  return (
                    <tr
                      key={deed.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm">
                        <Link
                          href={`/admin/deeds/${deed.id}`}
                          className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {deed.deed_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>
                            {deed.plot_location}
                            {deed.section && ` - ${deed.section}`}
                            {deed.row && `-${deed.row}`}
                            {` #${deed.plot_number}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {deed.member ? (
                          <Link
                            href={`/admin/members/${deed.member.id}`}
                            className="hover:underline"
                          >
                            {deed.member.first_name} {deed.member.last_name}
                          </Link>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge className={plotTypeColors[deed.plot_type]}>
                          {plotTypeLabels[deed.plot_type]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-2">
                          <span>{deed.occupied}/{deed.capacity}</span>
                          {availableSpace > 0 ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(deed.purchase_date)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {deed.is_active ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                            Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/deeds/${deed.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(deed)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {deeds.data.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No deeds found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by creating your first cemetery deed.</p>
              <Link href="/admin/deeds/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Deed
                </Button>
              </Link>
            </div>
          )}

          {/* Pagination */}
          {deeds.last_page > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {deeds.current_page} of {deeds.last_page}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={deeds.current_page === 1}
                  onClick={() =>
                    router.get(`/admin/deeds?page=${deeds.current_page - 1}`)
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={deeds.current_page === deeds.last_page}
                  onClick={() =>
                    router.get(`/admin/deeds?page=${deeds.current_page + 1}`)
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
