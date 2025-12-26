import React, { useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { BreadcrumbItem, Interment, Deed, Member } from '@/types';

interface Props {
  interment: Interment;
  deeds: Deed[];
  members: Member[];
}

export default function IntermentsEdit({ interment, deeds, members }: Readonly<Props>) {
  const { data, setData, put, processing, errors } = useForm({
    deed_id: interment.deed_id.toString(),
    member_id: interment.member_id?.toString() || '',
    first_name: interment.first_name,
    last_name: interment.last_name,
    middle_name: interment.middle_name || '',
    hebrew_name: interment.hebrew_name || '',
    date_of_birth: interment.date_of_birth || '',
    date_of_death: interment.date_of_death,
    interment_date: interment.interment_date,
    cause_of_death: interment.cause_of_death || '',
    funeral_home: interment.funeral_home || '',
    rabbi_officiating: interment.rabbi_officiating || '',
    notes: interment.notes || '',
  });

  const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cemetery', href: '/admin/interments' },
    { title: 'Interments', href: '/admin/interments' },
    { title: `${interment.first_name} ${interment.last_name}`, href: `/admin/interments/${interment.id}` },
    { title: 'Edit', href: `/admin/interments/${interment.id}/edit` },
  ], [interment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/interments/${interment.id}`);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit ${interment.first_name} ${interment.last_name}`} />

      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Interment</h1>
            <p className="text-gray-600 dark:text-gray-400">Update burial record</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Deceased Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={data.first_name}
                  onChange={(e) => setData('first_name', e.target.value)}
                  required
                />
                {errors.first_name && <p className="text-sm text-red-600">{errors.first_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={data.last_name}
                  onChange={(e) => setData('last_name', e.target.value)}
                  required
                />
                {errors.last_name && <p className="text-sm text-red-600">{errors.last_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="middle_name">Middle Name</Label>
                <Input
                  id="middle_name"
                  value={data.middle_name}
                  onChange={(e) => setData('middle_name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hebrew_name">Hebrew Name</Label>
                <Input
                  id="hebrew_name"
                  value={data.hebrew_name}
                  onChange={(e) => setData('hebrew_name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={data.date_of_birth}
                  onChange={(e) => setData('date_of_birth', e.target.value)}
                />
                {errors.date_of_birth && <p className="text-sm text-red-600">{errors.date_of_birth}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_death">Date of Death *</Label>
                <Input
                  id="date_of_death"
                  type="date"
                  value={data.date_of_death}
                  onChange={(e) => setData('date_of_death', e.target.value)}
                  required
                />
                {errors.date_of_death && <p className="text-sm text-red-600">{errors.date_of_death}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="interment_date">Interment Date *</Label>
                <Input
                  id="interment_date"
                  type="date"
                  value={data.interment_date}
                  onChange={(e) => setData('interment_date', e.target.value)}
                  required
                />
                {errors.interment_date && <p className="text-sm text-red-600">{errors.interment_date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cause_of_death">Cause of Death</Label>
                <Input
                  id="cause_of_death"
                  value={data.cause_of_death}
                  onChange={(e) => setData('cause_of_death', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Plot & Service Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="deed_id">Deed/Plot *</Label>
                <Select value={data.deed_id} onValueChange={(value) => setData('deed_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select deed" />
                  </SelectTrigger>
                  <SelectContent>
                    {deeds.map((deed) => (
                      <SelectItem key={deed.id} value={deed.id.toString()}>
                        {deed.deed_number} - {deed.plot_location} (Available: {deed.capacity - deed.occupied})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.deed_id && <p className="text-sm text-red-600">{errors.deed_id}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="member_id">Related Member</Label>
                <Select value={data.member_id} onValueChange={(value) => setData('member_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select member (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.first_name} {member.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="funeral_home">Funeral Home</Label>
                <Input
                  id="funeral_home"
                  value={data.funeral_home}
                  onChange={(e) => setData('funeral_home', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rabbi_officiating">Rabbi Officiating</Label>
                <Input
                  id="rabbi_officiating"
                  value={data.rabbi_officiating}
                  onChange={(e) => setData('rabbi_officiating', e.target.value)}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={data.notes}
                  onChange={(e) => setData('notes', e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link href={`/admin/interments/${interment.id}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={processing}>
              {processing ? 'Updating...' : 'Update Interment'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
