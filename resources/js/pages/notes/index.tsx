import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Eye, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { type Note, type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Notes',
        href: '/admin/notes',
    },
];

interface PaginationData {
    current_page: number;
    data: Note[];
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
    notes: PaginationData;
    filters: {
        search?: string;
        assigned?: string;
    };
}

export default function NotesIndex({notes, filters}: Readonly<Props>) {
    const [search, setSearch] = useState(filters.search ?? '');
    
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/notes', { search }, {
            preserveState: true,
            replace: true
        });
    };

    const handleDelete = (note: Note) => {
        if (confirm(`Are you sure you want to delete ${note.name}?`)) {
            router.delete(`/admin/notes/${note.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notes Management" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
          {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {filters.assigned ? 'My Notes' : 'Notes'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {filters.assigned ? 'Notes assigned to you' : 'Manage notes and tasks'}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {filters.assigned && (
                            <Link href="/admin/notes">
                                <Button variant="outline">
                                    View All Notes
                                </Button>
                            </Link>
                        )}
                        <Link href="/admin/notes/create">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Note
                            </Button>
                        </Link>
                    </div>
                </div>
                {/* Search */}
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="outline" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {filters.search && (
            <Button variant="outline" onClick={() => {
              setSearch('');
              router.get('/admin/notes');
            }}>
              Clear Filters
            </Button>
          )}
        </div>

        {/* Notes Table */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Note
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {notes.data.length > 0 ? (
                  notes.data.map((note) => (
                    <tr key={note.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {note.name}
                          </div>
                          {note.note_text && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {note.note_text}
                            </div>
                          )}
                          {note.label && (
                            <div className="mt-1">
                              <Badge variant="outline" className="text-xs">
                                {note.label}
                              </Badge>
                            </div>
                          )}
                          {note.member && (
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Member: {note.member.first_name} {note.member.last_name}
                            </div>
                          )}
                          {note.user && (
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Assigned: {note.user.name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={note.priority === 'high' ? 'destructive' : note.priority === 'medium' ? 'default' : 'secondary'}>
                          {note.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {note.deadline_date ? (
                          <div className="flex items-center text-gray-900 dark:text-gray-100">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm">
                              {new Date(note.deadline_date).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">No deadline</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {note.completed_date ? (
                          <Badge variant="default">Completed</Badge>
                        ) : note.deadline_date && new Date(note.deadline_date) < new Date() ? (
                          <Badge variant="destructive">Overdue</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/admin/notes/${note.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/notes/${note.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(note)}
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
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <FileText className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No notes found</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {filters.search
                            ? 'No notes match your search criteria.'
                            : 'Get started by creating your first note.'}
                        </p>
                        <Link href="/admin/notes/create">
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Note
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
          {notes.last_page > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  {notes.prev_page_url && (
                    <Link href={notes.prev_page_url}>
                      <Button variant="outline">Previous</Button>
                    </Link>
                  )}
                  {notes.next_page_url && (
                    <Link href={notes.next_page_url}>
                      <Button variant="outline">Next</Button>
                    </Link>
                  )}
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing <span className="font-medium">{notes.from}</span> to{' '}
                      <span className="font-medium">{notes.to}</span> of{' '}
                      <span className="font-medium">{notes.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {notes.links.map((link, index) => {
                        if (!link.url) {
                          return (
                            <span
                              key={index}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400"
                              dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                          );
                        }

                        return (
                          <Link
                            key={index}
                            href={link.url}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              link.active
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                          />
                        );
                      })}
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
        </AppLayout>
    );
}