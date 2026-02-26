import React, { useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Mail, Phone, MapPin, Calendar, User, Plus, Trash2, CreditCard, TrendingUp, Users, DollarSign, Award, ShoppingCart } from 'lucide-react';
import { type Member, type BreadcrumbItem } from '@/types';

interface ContributionData {
  boards_count: number;
  committees_count: number;
  dues_total: number;
  donations_total: number;
  other_purchases_total: number;
}

interface Props {
  member: Member;
  contributionData: ContributionData;
}

export default function MembersShow({ member, contributionData }: Readonly<Props>) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

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
            <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
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

            {/* Jewish Details */}
            <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Jewish Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Hebrew Name</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">
                    {member.hebrew_name || <span className="text-gray-400 dark:text-gray-500">Not set</span>}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Father's Hebrew Name</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">
                    {member.father_hebrew_name || <span className="text-gray-400 dark:text-gray-500">Not set</span>}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Mother's Hebrew Name</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">
                    {member.mother_hebrew_name || <span className="text-gray-400 dark:text-gray-500">Not set</span>}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tribe</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">
                    {member.tribe ? <span className="capitalize">{member.tribe}</span> : <span className="text-gray-400 dark:text-gray-500">Not set</span>}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">B'nai Mitzvah Date</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">
                    {member.bnaimitzvahdate ? (
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(member.bnaimitzvahdate)}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">Not set</span>
                    )}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Aliyah</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">
                    {member.aliyah ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Chazanut</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">
                    {member.chazanut ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Dvar Torah</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">
                    {member.dvartorah ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Maftir</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">
                    {member.maftir ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </dd>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
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
              <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
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

            {/* Email Contact History */}
            <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Email Contact History
              </h2>
              
              {member.email_records && member.email_records.length > 0 ? (
                <div className="space-y-3">
                  {member.email_records.map((email: any) => (
                    <div 
                      key={email.id} 
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                            {email.subject}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(email.date_sent)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mt-3">
                        <div>
                          <span className="font-medium text-gray-500 dark:text-gray-400">From:</span>
                          <span className="ml-1 text-gray-900 dark:text-gray-100">{email.from}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500 dark:text-gray-400">To:</span>
                          <span className="ml-1 text-gray-900 dark:text-gray-100">{email.to}</span>
                        </div>
                        {email.cc && (
                          <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">CC:</span>
                            <span className="ml-1 text-gray-900 dark:text-gray-100">{email.cc}</span>
                          </div>
                        )}
                        {email.conversation_id && (
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-500 dark:text-gray-400">Conversation ID:</span>
                            <span className="ml-1 text-gray-900 dark:text-gray-100 font-mono text-xs">{email.conversation_id}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No email contact history recorded.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
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

            <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
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

        {/* Member Value Contribution Chart */}
        <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Member Value Contribution
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Boards Count */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                  {contributionData.boards_count}
                </span>
              </div>
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200">Boards</h3>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                Board memberships
              </p>
            </div>

            {/* Committees Count */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                  {contributionData.committees_count}
                </span>
              </div>
              <h3 className="text-sm font-medium text-purple-900 dark:text-purple-200">Committees</h3>
              <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
                Committee memberships
              </p>
            </div>

            {/* Dues Total */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {formatCurrency(contributionData.dues_total)}
                </span>
              </div>
              <h3 className="text-sm font-medium text-green-900 dark:text-green-200">Dues</h3>
              <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                Total membership dues paid
              </p>
            </div>

            {/* Donations Total */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-6 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-amber-500 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                  {formatCurrency(contributionData.donations_total)}
                </span>
              </div>
              <h3 className="text-sm font-medium text-amber-900 dark:text-amber-200">Donations</h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                Total donations contributed
              </p>
            </div>

            {/* Other Purchases Total */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                  {formatCurrency(contributionData.other_purchases_total)}
                </span>
              </div>
              <h3 className="text-sm font-medium text-indigo-900 dark:text-indigo-200">Other Purchases</h3>
              <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">
                Events, products, and services
              </p>
            </div>
          </div>
        </div>

        {/* Membership Periods Section */}
        <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Membership Periods
            </h2>
            <Link href={`/admin/members/${member.id}/membership-periods/create`}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Period
              </Button>
            </Link>
          </div>

          {member.membership_periods && member.membership_periods.length > 0 ? (
            <div className="space-y-4">
              {member.membership_periods.map((period) => {
                const isActive = !period.end_date || new Date(period.end_date) >= new Date();
                
                return (
                  <div 
                    key={period.id} 
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={isActive ? "default" : "secondary"}>
                            {isActive ? 'Active' : 'Expired'}
                          </Badge>
                          {period.membership_type && (
                            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {period.membership_type}
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <dt className="font-medium text-gray-500 dark:text-gray-400">Start Date</dt>
                            <dd className="text-gray-900 dark:text-gray-100">{formatDate(period.begin_date)}</dd>
                          </div>
                          <div>
                            <dt className="font-medium text-gray-500 dark:text-gray-400">End Date</dt>
                            <dd className="text-gray-900 dark:text-gray-100">
                              {period.end_date ? formatDate(period.end_date) : 'Ongoing'}
                            </dd>
                          </div>
                        </div>

                        {period.invoice && (
                          <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <CreditCard className="h-4 w-4 mr-1" />
                            <Link 
                              href={`/admin/invoices/${period.invoice.id}`}
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {period.invoice.invoice_number}
                            </Link>
                            <span className="mx-2">•</span>
                            <span>${period.invoice.total}</span>
                            <span className="mx-2">•</span>
                            <span className="capitalize">{period.invoice.status}</span>
                          </div>
                        )}

                        {period.notes && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {period.notes}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Link href={`/admin/members/${member.id}/membership-periods/${period.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this membership period?')) {
                              router.delete(`/admin/members/${member.id}/membership-periods/${period.id}`);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No membership periods recorded.</p>
              <Link href={`/admin/members/${member.id}/membership-periods/create`} className="inline-block mt-2">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Period
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Committee Memberships Section */}
        <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Committee Memberships
            </h2>
          </div>

          {member.committees && member.committees.length > 0 ? (
            <div className="space-y-4">
              {member.committees.map((committee) => {
                const isActive = !committee.pivot?.term_end_date || new Date(committee.pivot.term_end_date) >= new Date();
                
                return (
                  <div 
                    key={committee.id} 
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {committee.name}
                          </h3>
                          <Badge variant={isActive ? "default" : "secondary"}>
                            {isActive ? 'Active' : 'Expired'}
                          </Badge>
                        </div>
                        
                        {committee.pivot?.title && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span className="font-medium">Position:</span> {committee.pivot.title}
                          </div>
                        )}

                        {committee.description && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {committee.description}
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <dt className="font-medium text-gray-500 dark:text-gray-400">Term Start</dt>
                            <dd className="text-gray-900 dark:text-gray-100">
                              {committee.pivot?.term_start_date ? formatDate(committee.pivot.term_start_date) : 'N/A'}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium text-gray-500 dark:text-gray-400">Term End</dt>
                            <dd className="text-gray-900 dark:text-gray-100">
                              {committee.pivot?.term_end_date ? formatDate(committee.pivot.term_end_date) : 'Ongoing'}
                            </dd>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No committee memberships recorded.</p>
            </div>
          )}
        </div>

        {/* Board Memberships Section */}
        <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Board Memberships
            </h2>
          </div>

          {member.boards && member.boards.length > 0 ? (
            <div className="space-y-4">
              {member.boards.map((board) => {
                const isActive = !board.pivot?.term_end_date || new Date(board.pivot.term_end_date) >= new Date();
                
                return (
                  <div 
                    key={board.id} 
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {board.name}
                          </h3>
                          <Badge variant={isActive ? "default" : "secondary"}>
                            {isActive ? 'Active' : 'Expired'}
                          </Badge>
                        </div>
                        
                        {board.pivot?.title && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span className="font-medium">Position:</span> {board.pivot.title}
                          </div>
                        )}

                        {board.description && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {board.description}
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <dt className="font-medium text-gray-500 dark:text-gray-400">Term Start</dt>
                            <dd className="text-gray-900 dark:text-gray-100">
                              {board.pivot?.term_start_date ? formatDate(board.pivot.term_start_date) : 'N/A'}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium text-gray-500 dark:text-gray-400">Term End</dt>
                            <dd className="text-gray-900 dark:text-gray-100">
                              {board.pivot?.term_end_date ? formatDate(board.pivot.term_end_date) : 'Ongoing'}
                            </dd>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No board memberships recorded.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}