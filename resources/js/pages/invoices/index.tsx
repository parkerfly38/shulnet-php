import React, { useMemo, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, FileText, Edit, Trash2, RefreshCw, Clock, CheckCircle, AlertCircle, XCircle, Printer } from 'lucide-react';
import { BreadcrumbItem, Invoice, Member } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface PaginatedInvoices {
  data: Invoice[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface InvoiceStats {
  total_count: number;
  total_amount: number;
  draft_count: number;
  draft_amount: number;
  open_count: number;
  open_amount: number;
  paid_count: number;
  paid_amount: number;
  overdue_count: number;
  overdue_amount: number;
  unpaid_count: number;
  unpaid_amount: number;
}

interface Props {
  invoices: PaginatedInvoices;
  members: Member[];
  stats: InvoiceStats;
  filters: {
    search?: string;
    status?: string;
    member?: string;
  };
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  open: 'Open',
  partial: 'Partial',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

export default function InvoicesIndex({ invoices, members, stats, filters }: Readonly<Props>) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || '');
  const [memberId, setMemberId] = useState(filters.member || '');
  const { currency } = usePage().props as any;

  const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Invoices', href: '/admin/invoices' },
  ], []);

  const handleFilter = () => {
    router.get('/admin/invoices', {
      search: search || undefined,
      status: status || undefined,
      member: memberId || undefined,
    }, { preserveState: true });
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setMemberId('');
    router.get('/admin/invoices');
  };

  const handleDelete = (invoice: Invoice) => {
    if (confirm(`Are you sure you want to delete invoice ${invoice.invoice_number}?`)) {
      router.delete(`/admin/invoices/${invoice.id}`);
    }
  };

  const formatAmount = (amount: string | number) => {
    return formatCurrency(amount, currency);
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
      title: 'Total Invoices',
      count: stats.total_count,
      amount: stats.total_amount,
      icon: FileText,
      color: 'bg-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Unpaid/Open',
      count: stats.unpaid_count,
      amount: stats.unpaid_amount,
      icon: AlertCircle,
      color: 'bg-orange-500',
      textColor: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      highlight: true,
    },
    {
      title: 'Paid',
      count: stats.paid_count,
      amount: stats.paid_amount,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Overdue',
      count: stats.overdue_count,
      amount: stats.overdue_amount,
      icon: Clock,
      color: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      highlight: true,
    },
    {
      title: 'Draft',
      count: stats.draft_count,
      amount: stats.draft_amount,
      icon: FileText,
      color: 'bg-gray-500',
      textColor: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Invoices" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Invoices</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage member invoices and recurring billing</p>
          </div>
          <Link href="/admin/invoices/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </Link>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.title}
              className={`bg-white dark:bg-black rounded-lg border ${
                stat.highlight 
                  ? 'border-2 ' + stat.color.replace('bg-', 'border-') 
                  : 'border-gray-200 dark:border-gray-700'
              } p-4 shadow-sm`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {stat.count} {stat.count === 1 ? 'invoice' : 'invoices'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className={`text-xl font-bold mt-1 ${stat.textColor}`}>
                  {formatAmount(stat.amount || 0)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="rounded-lg border bg-white dark:bg-black p-4 shadow-sm">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
              />
            </div>
            <div className="w-[180px]">
              <Select value={status ?? " "} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[200px]">
              <Select value={memberId ?? " "} onValueChange={setMemberId}>
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
            <Button onClick={handleFilter} variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Filter
            </Button>
            {(search || status || memberId) && (
              <Button onClick={handleClearFilters} variant="ghost">
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Recurring
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
                {invoices.data.length > 0 ? (
                  invoices.data.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/admin/invoices/${invoice.id}`}
                          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {invoice.invoice_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {invoice.member?.first_name} {invoice.member?.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(invoice.invoice_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(invoice.due_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatAmount(invoice.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={statusColors[invoice.status]}>
                          {statusLabels[invoice.status]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {invoice.recurring && (
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            {invoice.recurring_interval_count > 1 && `Every ${invoice.recurring_interval_count} `}
                            {invoice.recurring_interval}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/invoices/${invoice.id}`}>
                            <Button variant="ghost" size="sm" title="View">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/admin/invoices/${invoice.id}/print`, '_blank')}
                            title="Print"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Link href={`/admin/invoices/${invoice.id}/edit`}>
                            <Button variant="ghost" size="sm" title="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(invoice)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">No invoices found</p>
                        <p className="text-sm mt-1">Create your first invoice to get started.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {invoices.last_page > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {((invoices.current_page - 1) * invoices.per_page) + 1} to{' '}
                {Math.min(invoices.current_page * invoices.per_page, invoices.total)} of {invoices.total} invoices
              </div>
              <div className="flex gap-2">
                {invoices.current_page > 1 && (
                  <Link
                    href={`/admin/invoices?page=${invoices.current_page - 1}`}
                    preserveState
                  >
                    <Button variant="outline" size="sm">Previous</Button>
                  </Link>
                )}
                {invoices.current_page < invoices.last_page && (
                  <Link
                    href={`/admin/invoices?page=${invoices.current_page + 1}`}
                    preserveState
                  >
                    <Button variant="outline" size="sm">Next</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
