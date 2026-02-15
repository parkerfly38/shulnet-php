import React, { useState, useRef } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Edit, Plus, Search, Eye, Calendar, Star, Upload, Download, Mail, Printer } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { type BreadcrumbItem } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Yahrzeits',
    href: '/admin/yahrzeits',
  },
];

interface Member {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    hebrew_name?: string;
    email?: string;
    pivot: {
        relationship: string;
    };
}

interface Yahrzeit {
    id: number;
    members: Member[];
    name: string;
    hebrew_name?: string;
    date_of_death: string;
    hebrew_day_of_death: number;
    hebrew_month_of_death: number;
    observance_type: 'standard' | 'kaddish' | 'memorial_candle' | 'other';
    created_at: string;
    updated_at: string;
}

interface PaginationData {
  current_page: number;
  data: Yahrzeit[];
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

interface Props {
  yahrzeits: PaginationData;
  filters: {
    search?: string;
  };
}

const HEBREW_MONTHS = [
    '', // 0 index placeholder
    'Tishrei', 'Cheshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar',
    'Nissan', 'Iyar', 'Sivan', 'Tammuz', 'Av', 'Elul'
];

const OBSERVANCE_COLORS = {
    standard: 'bg-blue-100 text-blue-800',
    kaddish: 'bg-purple-100 text-purple-800',
    memorial_candle: 'bg-yellow-100 text-yellow-800',
    other: 'bg-gray-100 text-gray-800'
} as const;

const OBSERVANCE_LABELS = {
    standard: 'Standard Yahrzeit',
    kaddish: 'Kaddish Recitation',
    memorial_candle: 'Memorial Candle',
    other: 'Other Observance'
} as const;

export default function YahrzeitIndex({ yahrzeits, filters }: Readonly<Props>) {
  const [search, setSearch] = useState(filters.search || '');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [selectedYahrzeit, setSelectedYahrzeit] = useState<Yahrzeit | null>(null);
  const [reminderType, setReminderType] = useState<'email' | 'print'>('email');
  const [familyMembers, setFamilyMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [gregorianDate, setGregorianDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { flash } = usePage().props as any;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/admin/yahrzeits', { search }, {
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

    router.post('/admin/yahrzeits/import', formData, {
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
    window.location.href = '/admin/yahrzeits/template/download';
  };

  const handleDelete = (yahrzeit: Yahrzeit) => {
    if (confirm(`Are you sure you want to delete the yahrzeit record for ${yahrzeit.name}?`)) {
      router.delete(`/admin/yahrzeits/${yahrzeit.id}`);
    }
  };

  const handleSendReminder = async (yahrzeit: Yahrzeit) => {
    setSelectedYahrzeit(yahrzeit);
    setReminderType('email');
    setFamilyMembers([]);
    setSelectedMembers([]);
    setGregorianDate('');
    setShowReminderDialog(true);

    // Fetch family members and calculated Gregorian date
    try {
      const response = await fetch(`/admin/yahrzeits/${yahrzeit.id}/prepare-reminder`);
      const data = await response.json();
      
      // Set the calculated Gregorian date
      if (data.gregorian_date) {
        setGregorianDate(data.gregorian_date);
      }

      // Set family members and select all by default
      if (data.family_members && data.family_members.length > 0) {
        setFamilyMembers(data.family_members);
        setSelectedMembers(data.family_members.map((m: Member) => m.id));
      }
    } catch (error) {
      console.error('Failed to fetch reminder data:', error);
    }
  };

  const submitReminder = () => {
    if (!selectedYahrzeit || selectedMembers.length === 0) return;

    const selectedFamilyMembers = familyMembers.filter(m => selectedMembers.includes(m.id));

    if (reminderType === 'email') {
      // Send email to each selected member
      selectedFamilyMembers.forEach((member, index) => {
        if (!member.email) return;
        
        router.post(`/admin/yahrzeits/${selectedYahrzeit.id}/send-reminder`, {
          recipient_email: member.email,
          recipient_name: `${member.first_name} ${member.last_name}`,
          gregorian_date: gregorianDate,
        }, {
          preserveState: true,
          onSuccess: () => {
            // Close dialog after last email is sent
            if (index === selectedFamilyMembers.length - 1) {
              setShowReminderDialog(false);
              setSelectedYahrzeit(null);
            }
          },
        });
      });
    } else {
      // Generate PDF with one page per selected member
      const memberIdsParam = selectedMembers.join(',');
      const url = `/admin/yahrzeits/${selectedYahrzeit.id}/print-reminder?member_ids=${encodeURIComponent(memberIdsParam)}&gregorian_date=${encodeURIComponent(gregorianDate)}`;
      window.open(url, '_blank');
      
      setShowReminderDialog(false);
      setSelectedYahrzeit(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
  };

  const formatHebrewDate = (day: number, month: number) => {
    const monthName = HEBREW_MONTHS[month] || 'Unknown';
    return `${day} ${monthName}`;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Yahrzeits" />

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
        {flash?.import_errors && flash.import_errors.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
            <p className="font-semibold mb-2">Import completed with some errors:</p>
            <ul className="list-disc list-inside space-y-1">
              {flash.import_errors.map((error: any, idx: number) => (
                <li key={idx} className="text-sm">
                  Row {error.row}: {error.errors.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Yahrzeit Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage memorial observances and remembrance dates
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Import Yahrzeits
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Yahrzeits from CSV</DialogTitle>
                  <DialogDescription>
                    Upload a CSV file to import or update yahrzeit records. Download the template to see the required format.
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
                    Import Yahrzeits
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Link href="/admin/yahrzeits/create">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Yahrzeit
              </Button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search yahrzeit records by name or relationship..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
          {filters.search && (
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                router.get('/admin/yahrzeits');
              }}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <span>
            Showing {yahrzeits.from} to {yahrzeits.to} of {yahrzeits.total} yahrzeit records
          </span>
          {filters.search && (
            <span>
              Search results for: <strong>"{filters.search}"</strong>
            </span>
          )}
        </div>

        {/* Yahrzeits Table */}
        <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Deceased
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date of Death
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Hebrew Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Observance
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
                {yahrzeits.data.length > 0 ? (
                  yahrzeits.data.map((yahrzeit) => (
                    <tr key={yahrzeit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {yahrzeit.name}
                          </div>
                          {yahrzeit.hebrew_name && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {yahrzeit.hebrew_name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDate(yahrzeit.date_of_death)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-2 text-gray-400" />
                          {formatHebrewDate(yahrzeit.hebrew_day_of_death, yahrzeit.hebrew_month_of_death)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={OBSERVANCE_COLORS[yahrzeit.observance_type]}>
                          {OBSERVANCE_LABELS[yahrzeit.observance_type]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendReminder(yahrzeit)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Send/Print Reminder"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Link href={`/admin/yahrzeits/${yahrzeit.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/yahrzeits/${yahrzeit.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(yahrzeit)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          No yahrzeit records found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          {filters.search ? 'No records match your search criteria.' : 'Get started by adding your first yahrzeit record.'}
                        </p>
                        <Link href="/admin/yahrzeits/create">
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Yahrzeit Record
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {yahrzeits.last_page > 1 && (
            <div className="bg-white dark:bg-black px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                {yahrzeits.prev_page_url && (
                  <Button variant="outline" onClick={() => router.get(yahrzeits.prev_page_url!)}>
                    Previous
                  </Button>
                )}
                {yahrzeits.next_page_url && (
                  <Button variant="outline" onClick={() => router.get(yahrzeits.next_page_url!)}>
                    Next
                  </Button>
                )}
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{yahrzeits.from}</span> to{' '}
                    <span className="font-medium">{yahrzeits.to}</span> of{' '}
                    <span className="font-medium">{yahrzeits.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {yahrzeits.links.map((link, index) => (
                      <Button
                        key={index}
                        variant={link.active ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => link.url && router.get(link.url)}
                        disabled={!link.url}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          index === 0 ? 'rounded-l-md' : ''
                        } ${
                          index === yahrzeits.links.length - 1 ? 'rounded-r-md' : ''
                        }`}
                      />
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Yahrzeit Reminder Dialog */}
        <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Yahrzeit Reminder</DialogTitle>
              <DialogDescription>
                Send a reminder for {selectedYahrzeit?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-3">
                <Label>Reminder Method</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="reminder-email"
                      name="reminder-method"
                      value="email"
                      checked={reminderType === 'email'}
                      onChange={(e) => setReminderType(e.target.value as 'email' | 'print')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <Label htmlFor="reminder-email" className="cursor-pointer font-normal flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Send via Email
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="reminder-print"
                      name="reminder-method"
                      value="print"
                      checked={reminderType === 'print'}
                      onChange={(e) => setReminderType(e.target.value as 'email' | 'print')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <Label htmlFor="reminder-print" className="cursor-pointer font-normal flex items-center gap-2">
                      <Printer className="h-4 w-4" />
                      Print Letter
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <Label>Select Recipients</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-3">
                  {familyMembers.length === 0 ? (
                    <p className="text-sm text-gray-500">Loading family members...</p>
                  ) : (
                    familyMembers.map((member) => (
                      <div key={member.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`member-${member.id}`}
                          checked={selectedMembers.includes(member.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembers([...selectedMembers, member.id]);
                            } else {
                              setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                            }
                          }}
                          className="h-4 w-4 text-blue-600"
                        />
                        <Label htmlFor={`member-${member.id}`} className="cursor-pointer font-normal flex-1">
                          <div className="flex flex-col">
                            <span>{member.first_name} {member.last_name}</span>
                            {reminderType === 'email' && (
                              <span className="text-xs text-gray-500">
                                {member.email || 'No email address'}
                              </span>
                            )}
                            <span className="text-xs text-gray-400 capitalize">
                              {member.pivot.relationship}
                            </span>
                          </div>
                        </Label>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {reminderType === 'email' 
                    ? 'One email will be sent per selected family member'
                    : 'One page will be printed per selected family member'}
                </p>
              </div>

              <div>
                <Label htmlFor="gregorian_date">Gregorian Date (This Year)</Label>
                <Input
                  id="gregorian_date"
                  type="text"
                  value={gregorianDate}
                  onChange={(e) => setGregorianDate(e.target.value)}
                  placeholder="e.g., January 15, 2026"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-calculated from Hebrew date for current Hebrew year
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowReminderDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitReminder}
                  disabled={selectedMembers.length === 0 || !gregorianDate || (reminderType === 'email' && !familyMembers.filter(m => selectedMembers.includes(m.id)).some(m => m.email))}
                >
                  {reminderType === 'email' ? `Send Email (${selectedMembers.length})` : `Print Letter (${selectedMembers.length})`}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}