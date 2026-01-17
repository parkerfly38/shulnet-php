import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Search, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Users',
    href: '/admin/users',
  },
];

interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  role_labels: string;
  is_admin: boolean;
  is_teacher: boolean;
  is_parent: boolean;
  is_student: boolean;
  is_member: boolean;
  is_default_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface PaginationData {
  current_page: number;
  data: User[];
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
  users: PaginationData;
  available_roles: { [key: string]: string };
  filters: {
    search?: string;
    role?: string;
  };
}

export default function AdminUsers({ users, available_roles, filters }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedRole, setSelectedRole] = useState(filters.role || 'all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/admin/users', { 
      search: searchTerm, 
      role: selectedRole === 'all' ? '' : selectedRole
    }, { preserveState: true });
  };

  const handleRoleFilter = (role: string) => {
    setSelectedRole(role);
    router.get('/admin/users', { 
      search: searchTerm, 
      role: role === 'all' ? '' : role
    }, { preserveState: true });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRole('all');
    router.get('/admin/users', {}, { preserveState: true });
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const updateUserRoles = async (userId: number, roles: string[]) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/roles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ roles }),
      });

      if (response.ok) {
        // Refresh the current page
        router.reload();
        setShowRoleModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error updating roles:', error);
    }
  };

  const setDefaultAdmin = async (userId: number) => {
    if (!confirm('Are you sure you want to set this user as the default admin? The current default admin will be unset.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/set-default-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      if (response.ok) {
        router.reload();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to set default admin');
      }
    } catch (error) {
      console.error('Error setting default admin:', error);
      alert('An error occurred while setting default admin');
    }
  };

  const getRoleBadgeClass = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      teacher: 'bg-blue-100 text-blue-800',
      parent: 'bg-green-100 text-green-800',
      student: 'bg-yellow-100 text-yellow-800',
      member: 'bg-gray-100 text-gray-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Admin - User Management" />
      
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Users</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage user accounts and roles</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="outline" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <Select value={selectedRole || "all"} onValueChange={handleRoleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {Object.entries(available_roles).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(filters.search || (filters.role && filters.role !== '')) && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Default Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
                {users.data.length > 0 ? (
                  users.data.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <Badge key={role} variant="outline">
                                {available_roles[role] || role}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">No roles assigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.is_default_admin ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Default Admin
                          </Badge>
                        ) : user.is_admin ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDefaultAdmin(user.id)}
                            className="text-xs"
                          >
                            Set as Default
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRoleModal(user)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Roles
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Users className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No users found</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {filters.search || filters.role 
                            ? 'No users match your search criteria.' 
                            : 'No users have been created yet.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {users.last_page > 1 && (
            <div className="bg-white dark:bg-black px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  {users.prev_page_url && (
                    <Link href={users.prev_page_url}>
                      <Button variant="outline">Previous</Button>
                    </Link>
                  )}
                  {users.next_page_url && (
                    <Link href={users.next_page_url}>
                      <Button variant="outline">Next</Button>
                    </Link>
                  )}
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing <span className="font-medium">{users.from}</span> to{' '}
                      <span className="font-medium">{users.to}</span> of{' '}
                      <span className="font-medium">{users.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {users.links.map((link, index) => {
                        if (!link.url) {
                          return (
                            <span
                              key={index}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black text-sm font-medium text-gray-500 dark:text-gray-400"
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
                                : 'bg-white dark:bg-black border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
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

      {/* Role Edit Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-black">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
              Edit Roles for {selectedUser.name}
            </h3>
            <div className="space-y-2">
              {Object.entries(available_roles).map(([value, label]) => (
                <label key={value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedUser.roles.includes(value)}
                    onChange={(e) => {
                      const newRoles = e.target.checked
                        ? [...selectedUser.roles, value]
                        : selectedUser.roles.filter(r => r !== value);
                      setSelectedUser({ ...selectedUser, roles: newRoles });
                    }}
                    className="rounded border shadow-sm"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => updateUserRoles(selectedUser.id, selectedUser.roles)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}