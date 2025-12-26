import React, { useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { type Member, type BreadcrumbItem } from '@/types';

interface Props {
  member: Member;
}

interface MemberForm {
  member_type: 'member' | 'contact' | 'prospect' | 'former';
  first_name: string;
  last_name: string;
  middle_name: string;
  title: string;
  email: string;
  phone1: string;
  phone2: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  dob: string;
  gender: string;
  aliyah: boolean;
  bnaimitzvahdate: Date | null;
  chazanut: boolean;
  tribe: string;
  dvartorah: boolean;
  deceased: boolean;
  father_hebrew_name: string;
  mother_hebrew_name: string;
  hebrew_name: string;
  brianbatorah: boolean;
  maftir: boolean;
  anniversary_date: Date | null;
}

export default function MembersEdit({ member }: Readonly<Props>) {
  const { data, setData, put, processing, errors } = useForm<MemberForm>({
    member_type: member.member_type || 'member',
    first_name: member.first_name || '',
    last_name: member.last_name || '',
    middle_name: member.middle_name || '',
    title: member.title || '',
    email: member.email || '',
    phone1: member.phone1 || '',
    phone2: member.phone2 || '',
    address_line_1: member.address_line_1 || '',
    address_line_2: member.address_line_2 || '',
    city: member.city || '',
    state: member.state || '',
    zip: member.zip || '',
    country: member.country || '',
    dob: member.dob || '',
    gender: member.gender || '',
    aliyah: (member as any).aliyah || false,
    bnaimitzvahdate: (member as any).bnaimitzvahdate ? new Date((member as any).bnaimitzvahdate) : null,
    chazanut: (member as any).chazanut || false,
    tribe: (member as any).tribe || '',
    dvartorah: (member as any).dvartorah || false,
    deceased: (member as any).deceased || false,
    father_hebrew_name: (member as any).father_hebrew_name || '',
    mother_hebrew_name: (member as any).mother_hebrew_name || '',
    hebrew_name: (member as any).hebrew_name || '',
    brianbatorah: (member as any).brianbatorah || false,
    maftir: (member as any).maftir || false,
    anniversary_date: (member as any).anniversary_date ? new Date((member as any).anniversary_date) : null,
  });

  const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Members',
      href: '/admin/members',
    },
    {
      title: `Edit ${member.first_name} ${member.last_name}`,
      href: `/admin/members/${member.id}/edit`,
    }
  ],[member.first_name, member.last_name, member.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/members/${member.id}`);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit ${member.first_name} ${member.last_name}`} />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Edit {member.first_name} {member.last_name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Update member information
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="member_type">Type *</Label>
                <Select value={data.member_type} onValueChange={(value: any) => setData('member_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="contact">Contact</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="former">Former Member</SelectItem>
                  </SelectContent>
                </Select>
                {errors.member_type && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.member_type}</p>
                )}
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Mr., Mrs., Dr., Rabbi, etc."
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                />
                {errors.title && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  type="text"
                  value={data.first_name}
                  onChange={(e) => setData('first_name', e.target.value)}
                  required
                />
                {errors.first_name && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.first_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="middle_name">Middle Name</Label>
                <Input
                  id="middle_name"
                  type="text"
                  value={data.middle_name}
                  onChange={(e) => setData('middle_name', e.target.value)}
                />
                {errors.middle_name && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.middle_name}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  type="text"
                  value={data.last_name}
                  onChange={(e) => setData('last_name', e.target.value)}
                  required
                />
                {errors.last_name && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.last_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={data.gender} onValueChange={(value) => setData('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.gender}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={data.dob}
                onChange={(e) => setData('dob', e.target.value)}
              />
              {errors.dob && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.dob}</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
              Contact Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone1">Primary Phone</Label>
                <Input
                  id="phone1"
                  type="tel"
                  value={data.phone1}
                  onChange={(e) => setData('phone1', e.target.value)}
                />
                {errors.phone1 && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.phone1}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="phone2">Secondary Phone</Label>
              <Input
                id="phone2"
                type="tel"
                value={data.phone2}
                onChange={(e) => setData('phone2', e.target.value)}
              />
              {errors.phone2 && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.phone2}</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
              Address Information
            </h2>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="address_line_1">Address Line 1</Label>
                <Input
                  id="address_line_1"
                  type="text"
                  placeholder="Street address"
                  value={data.address_line_1}
                  onChange={(e) => setData('address_line_1', e.target.value)}
                />
                {errors.address_line_1 && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.address_line_1}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address_line_2">Address Line 2</Label>
                <Input
                  id="address_line_2"
                  type="text"
                  placeholder="Apartment, suite, etc."
                  value={data.address_line_2}
                  onChange={(e) => setData('address_line_2', e.target.value)}
                />
                {errors.address_line_2 && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.address_line_2}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    value={data.city}
                    onChange={(e) => setData('city', e.target.value)}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    type="text"
                    value={data.state}
                    onChange={(e) => setData('state', e.target.value)}
                  />
                  {errors.state && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.state}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="zip">ZIP/Postal Code</Label>
                  <Input
                    id="zip"
                    type="text"
                    value={data.zip}
                    onChange={(e) => setData('zip', e.target.value)}
                  />
                  {errors.zip && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.zip}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  type="text"
                  placeholder="United States"
                  value={data.country}
                  onChange={(e) => setData('country', e.target.value)}
                />
                {errors.country && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.country}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
              Hebrew/Jewish Information
            </h2>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="hebrew_name">Hebrew Name</Label>
                <Input
                  id="hebrew_name"
                  type="text"
                  placeholder="Hebrew name"
                  value={data.hebrew_name}
                  onChange={(e) => setData('hebrew_name', e.target.value)}
                />
                {errors.hebrew_name && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.hebrew_name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="father_hebrew_name">Father's Hebrew Name</Label>
                  <Input
                    id="father_hebrew_name"
                    type="text"
                    placeholder="Father's Hebrew name"
                    value={data.father_hebrew_name}
                    onChange={(e) => setData('father_hebrew_name', e.target.value)}
                  />
                  {errors.father_hebrew_name && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.father_hebrew_name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="mother_hebrew_name">Mother's Hebrew Name</Label>
                  <Input
                    id="mother_hebrew_name"
                    type="text"
                    placeholder="Mother's Hebrew name"
                    value={data.mother_hebrew_name}
                    onChange={(e) => setData('mother_hebrew_name', e.target.value)}
                  />
                  {errors.mother_hebrew_name && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.mother_hebrew_name}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="tribe">Tribe</Label>
                  <Select value={data.tribe} onValueChange={(value) => setData('tribe', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tribe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="israel">Israel</SelectItem>
                      <SelectItem value="kohein">Kohein</SelectItem>
                      <SelectItem value="levi">Levi</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.tribe && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.tribe}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bnaimitzvahdate">B'nai Mitzvah Date</Label>
                  <Input
                    id="bnaimitzvahdate"
                    type="date"
                    value={data.bnaimitzvahdate ? new Date(data.bnaimitzvahdate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setData('bnaimitzvahdate', e.target.value ? new Date(e.target.value) : null)}
                  />
                  {errors.bnaimitzvahdate && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.bnaimitzvahdate}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="anniversary_date">Anniversary Date</Label>
                <Input
                  id="anniversary_date"
                  type="date"
                  value={data.anniversary_date ? new Date(data.anniversary_date).toISOString().split('T')[0] : ''}
                  onChange={(e) => setData('anniversary_date', e.target.value ? new Date(e.target.value) : null)}
                />
                {errors.anniversary_date && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.anniversary_date}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-black shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
              Religious Roles & Capabilities
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="aliyah"
                    type="checkbox"
                    checked={data.aliyah}
                    onChange={(e) => setData('aliyah', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="aliyah" className="text-sm font-medium">
                    Aliyah
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="chazanut"
                    type="checkbox"
                    checked={data.chazanut}
                    onChange={(e) => setData('chazanut', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="chazanut" className="text-sm font-medium">
                    Chazanut (Cantorial)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="dvartorah"
                    type="checkbox"
                    checked={data.dvartorah}
                    onChange={(e) => setData('dvartorah', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="dvartorah" className="text-sm font-medium">
                    D'var Torah
                  </Label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="brianbatorah"
                    type="checkbox"
                    checked={data.brianbatorah}
                    onChange={(e) => setData('brianbatorah', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="brianbatorah" className="text-sm font-medium">
                    Bri'an BaTorah
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="maftir"
                    type="checkbox"
                    checked={data.maftir}
                    onChange={(e) => setData('maftir', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="maftir" className="text-sm font-medium">
                    Maftir
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="deceased"
                    type="checkbox"
                    checked={data.deceased}
                    onChange={(e) => setData('deceased', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="deceased" className="text-sm font-medium">
                    Deceased
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/admin/members">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={processing}>
              {processing ? (
                <>Updating...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Member
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}