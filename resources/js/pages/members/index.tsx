import React, { useState, useRef } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit, Plus, Search, Eye, Users, UserCheck, UserPlus, UserMinus, UserX, Upload, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Member, type BreadcrumbItem } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Members',
    href: '/admin/members',
  }
];

interface PaginationData {
  current_page: number;
  data: Member[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url?: string;
    label: string;
    active: boolean;
  }>;
  next_page_url?: string;
  path: string;
  per_page: number;
  prev_page_url?: string;
  to: number;
  total: number;
}

interface Stats {
  total: number;
  member: number;
  contact: number;
  prospect: number;
  former: number;
}

interface Props {
  members: PaginationData;
  stats: Stats;
  filters: {
    search?: string;
    member_type?: string;
  };
}

export default function MembersIndex({ members, stats, filters }: Readonly<Props>) {
  const [search, setSearch] = useState(filters.search || '');
  const [memberType, setMemberType] = useState(filters.member_type || '');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { flash } = usePage().props as any;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/admin/members', { search, member_type: memberType || undefined }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleMemberTypeChange = (value: string) => {
    setMemberType(value);
    router.get('/admin/members', { search, member_type: value || undefined }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    router.post('/admin/members/import', formData, {
      onSuccess: () => {
        setShowImportDialog(false);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
    });
  };

  const handleDownloadTemplate = () => {
    window.location.href = '/admin/members/template/download';
  };

  const handleDelete = (member: Member) => {
    if (confirm(`Are you sure you want to delete ${member.first_name} ${member.last_name}?`)) {
      router.delete(`/admin/members/${member.id}`);
    }
  };

  const statCards = [
    {
      title: 'Total Members',
      value: stats.total,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Active Members',
      value: stats.member,
      icon: UserCheck,
      color: 'bg-green-500',
      textColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Contacts',
      value: stats.contact,
      icon: UserPlus,
      color: 'bg-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Prospects',
      value: stats.prospect,
      icon: UserMinus,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      title: 'Former Members',
      value: stats.former,
      icon: UserX,
      color: 'bg-gray-500',
      textColor: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Member Management" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {flash?.success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
            {flash.success}
          </div>
        )}
        {flash?.error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {flash.error}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Member Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage synagogue members and their information
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Import Members
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Members from CSV</DialogTitle>
                  <DialogDescription>
                    Upload a CSV file to import or update members. Download the template to see the required format.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Button
                      variant="outline"
                      onClick={handleDownloadTemplate}
                      className="w-full flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download CSV Template
                    </Button>
                  </div>
                  <div className="border-t pt-4">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileSelect}
                      className="cursor-pointer"
                    />
                    {selectedFile && (
                      <p className="text-sm text-gray-600 mt-2">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleImport}
                    disabled={!selectedFile}
                    className="w-full"
                  >
                    Import Members
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Link href="/admin/members/create">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.title}
              className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${stat.textColor}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex gap-4 items-end">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search members by name, email, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
          <div className="w-48">
            <Select value={memberType ?? ' '} onValueChange={handleMemberTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All Types</SelectItem>
                <SelectItem value="member">Members</SelectItem>
                <SelectItem value="contact">Contacts</SelectItem>
                <SelectItem value="prospect">Prospects</SelectItem>
                <SelectItem value="former">Former Members</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(filters.search || filters.member_type) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setMemberType('');
                router.get('/admin/members');
              }}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <span>
            Showing {members.from} to {members.to} of {members.total} members
          </span>
          {filters.search && (
            <span>
              Search results for: <strong>"{filters.search}"</strong>
            </span>
          )}
        </div>

        {/* Members Table */}
        <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
                {members.data.length > 0 ? (
                  members.data.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {member.first_name} {member.last_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {member.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset capitalize
                          ${member.member_type === 'member' ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-500/20' : ''}
                          ${member.member_type === 'contact' ? 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-500/20' : ''}
                          ${member.member_type === 'prospect' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-900/20 dark:text-yellow-400 dark:ring-yellow-500/20' : ''}
                          ${member.member_type === 'former' ? 'bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-900/20 dark:text-gray-400 dark:ring-gray-500/20' : ''}`}
                        >
                          {member.member_type === 'former' ? 'Former' : member.member_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {member.email}
                        </div>
                        {member.phone1 && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {member.phone1}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {member.city && member.state ? `${member.city}, ${member.state}` : 
                           member.city || member.state || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(member.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex gap-2 justify-end">
                          <Link href={`/admin/members/${member.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/members/${member.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(member)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        {filters.search ? 'No members found matching your search.' : 'No members found.'}
                      </div>
                      {!filters.search && (
                        <Link href="/admin/members/create" className="mt-2 inline-block">
                          <Button>Add your first member</Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {members.last_page > 1 && (
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {members.prev_page_url && (
                <Link href={members.prev_page_url} preserveState>
                  <Button variant="outline">Previous</Button>
                </Link>
              )}
              {members.next_page_url && (
                <Link href={members.next_page_url} preserveState>
                  <Button variant="outline">Next</Button>
                </Link>
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {members.current_page} of {members.last_page}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}