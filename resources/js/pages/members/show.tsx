import React, { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, User } from 'lucide-react';
import { type Member, type BreadcrumbItem } from '@/types';

interface Props {
  member: Member;
}

export default function MembersShow({ member }: Readonly<Props>) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDisplayName = () => {
    const parts = [member.title, member.first_name, member.middle_name, member.last_name].filter(Boolean);
    return parts.join(' ');
  };

  const getFullAddress = () => {
    const addressParts = [
      member.address_line_1,
      member.address_line_2,
      member.city,
      member.state,
      member.zip,
      member.country
    ].filter(Boolean);
    
    if (addressParts.length === 0) return null;
    
    // Format as: Street, City State ZIP, Country
    const street = [member.address_line_1, member.address_line_2].filter(Boolean).join(', ');
    const cityState = [member.city, member.state].filter(Boolean).join(', ');
    const cityStateZip = [cityState, member.zip].filter(Boolean).join(' ');
    const fullAddress = [street, cityStateZip, member.country].filter(Boolean).join(', ');
    
    return fullAddress;
  };

  const breadcrums: BreadcrumbItem[] = useMemo(() => [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Members',
      href: '/admin/members',
    },
    { 
      title: 'Edit ' + getDisplayName(),
      href: `/admin/members/${member.id}/edit`
    }
  ], [member.id]);

  return (
    <AppLayout breadcrumbs={breadcrums}>
      <Head title={getDisplayName()} />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {getDisplayName()}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Member ID: {member.id}
              </p>
            </div>
          </div>
          <Link href={`/admin/members/${member.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Member
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">
                    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset capitalize
                      {member.member_type === 'member' ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-500/20' : ''}
                      {member.member_type === 'contact' ? 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-500/20' : ''}
                      {member.member_type === 'prospect' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-900/20 dark:text-yellow-400 dark:ring-yellow-500/20' : ''}
                      {member.member_type === 'former' ? 'bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-900/20 dark:text-gray-400 dark:ring-gray-500/20' : ''}"
                    >
                      {member.member_type === 'former' ? 'Former Member' : member.member_type}
                    </span>
                  </dd>
                </div>

                {member.title && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</dt>
                    <dd className="text-sm text-gray-900 dark:text-gray-100">{member.title}</dd>
                  </div>
                )}
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">First Name</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">{member.first_name}</dd>
                </div>
                
                {member.middle_name && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Middle Name</dt>
                    <dd className="text-sm text-gray-900 dark:text-gray-100">{member.middle_name}</dd>
                  </div>
                )}
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Name</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">{member.last_name}</dd>
                </div>
                
                {member.gender && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</dt>
                    <dd className="text-sm text-gray-900 dark:text-gray-100 capitalize">{member.gender}</dd>
                  </div>
                )}
                
                {member.dob && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</dt>
                    <dd className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(member.dob)}
                    </dd>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Contact Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    <a href={`mailto:${member.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                      {member.email}
                    </a>
                  </dd>
                </div>
                
                {member.phone1 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Primary Phone</dt>
                    <dd className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      <a href={`tel:${member.phone1}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {member.phone1}
                      </a>
                    </dd>
                  </div>
                )}
                
                {member.phone2 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Secondary Phone</dt>
                    <dd className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      <a href={`tel:${member.phone2}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {member.phone2}
                      </a>
                    </dd>
                  </div>
                )}
              </div>
            </div>

            {/* Address Information */}
            {getFullAddress() && (
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Address Information
                </h2>
                
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                    <div>
                      {member.address_line_1 && <div>{member.address_line_1}</div>}
                      {member.address_line_2 && <div>{member.address_line_2}</div>}
                      <div>
                        {[member.city, member.state].filter(Boolean).join(', ')}
                        {member.zip && ` ${member.zip}`}
                      </div>
                      {member.country && <div>{member.country}</div>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Member Status
              </h3>
              
              <div className="space-y-3">
                <div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    Active Member
                  </Badge>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Joined</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(member.created_at)}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(member.updated_at)}
                  </dd>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-2">
                <Link href={`/admin/members/${member.id}/edit`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Information
                  </Button>
                </Link>
                
                <a href={`mailto:${member.email}`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </a>
                
                {member.phone1 && (
                  <a href={`tel:${member.phone1}`} className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Primary
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}