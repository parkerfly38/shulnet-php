import React, { useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save } from 'lucide-react';
import { BreadcrumbItem } from '@/types';

interface Event {
  id: number;
  name: string;
}

interface Props {
  event: Event;
}

interface FormData {
  name: string;
  description: string;
  category: string;
  price: string;
  quantity_available: string;
  sale_starts: string;
  sale_ends: string;
  active: boolean;
  sort_order: string;
}

export default function TicketTypeCreate({ event }: Readonly<Props>) {
  const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Events', href: '/admin/events' },
    { title: event.name, href: `/admin/events/${event.id}` },
    { title: 'Ticket Types', href: `/admin/events/${event.id}/ticket-types` },
    { title: 'Create', href: `/admin/events/${event.id}/ticket-types/create` },
  ], [event.id, event.name]);

  const { data, setData, post, processing, errors } = useForm<FormData>({
    name: '',
    description: '',
    category: 'general',
    price: '0.00',
    quantity_available: '',
    sale_starts: '',
    sale_ends: '',
    active: true,
    sort_order: '0',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/admin/events/${event.id}/ticket-types`);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Create Ticket Type - ${event.name}`} />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Ticket Type</h1>
            <p className="text-gray-600 dark:text-gray-400">{event.name}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-lg border bg-white dark:bg-black p-6 shadow-sm">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Basic Information</h2>
              
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                  placeholder="e.g., Early Bird Special"
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  className={errors.description ? 'border-red-500' : ''}
                  rows={3}
                  placeholder="Optional description of this ticket type"
                />
                {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="early_bird">Early Bird</SelectItem>
                      <SelectItem value="adult">Adult</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="nonmember">Non-Member</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
                </div>

                <div>
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.price}
                    onChange={(e) => setData('price', e.target.value)}
                    className={errors.price ? 'border-red-500' : ''}
                  />
                  {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price}</p>}
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Availability</h2>
              
              <div>
                <Label htmlFor="quantity_available">
                  Quantity Available
                  <span className="text-sm text-gray-500 ml-2">(Leave empty for unlimited)</span>
                </Label>
                <Input
                  id="quantity_available"
                  type="number"
                  min="0"
                  value={data.quantity_available}
                  onChange={(e) => setData('quantity_available', e.target.value)}
                  className={errors.quantity_available ? 'border-red-500' : ''}
                  placeholder="Unlimited"
                />
                {errors.quantity_available && <p className="text-sm text-red-600 mt-1">{errors.quantity_available}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sale_starts">Sale Starts</Label>
                  <Input
                    id="sale_starts"
                    type="datetime-local"
                    value={data.sale_starts}
                    onChange={(e) => setData('sale_starts', e.target.value)}
                    className={errors.sale_starts ? 'border-red-500' : ''}
                  />
                  {errors.sale_starts && <p className="text-sm text-red-600 mt-1">{errors.sale_starts}</p>}
                </div>

                <div>
                  <Label htmlFor="sale_ends">Sale Ends</Label>
                  <Input
                    id="sale_ends"
                    type="datetime-local"
                    value={data.sale_ends}
                    onChange={(e) => setData('sale_ends', e.target.value)}
                    className={errors.sale_ends ? 'border-red-500' : ''}
                  />
                  {errors.sale_ends && <p className="text-sm text-red-600 mt-1">{errors.sale_ends}</p>}
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={data.active}
                  onCheckedChange={(checked) => setData('active', checked as boolean)}
                />
                <Label htmlFor="active">Active (Tickets can be purchased)</Label>
              </div>

              <div>
                <Label htmlFor="sort_order">
                  Sort Order
                  <span className="text-sm text-gray-500 ml-2">(Lower numbers appear first)</span>
                </Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={data.sort_order}
                  onChange={(e) => setData('sort_order', e.target.value)}
                  className={errors.sort_order ? 'border-red-500' : ''}
                />
                {errors.sort_order && <p className="text-sm text-red-600 mt-1">{errors.sort_order}</p>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Link href={`/admin/events/${event.id}/ticket-types`}>
                <Button type="button" variant="outline" disabled={processing}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={processing}>
                <Save className="h-4 w-4 mr-2" />
                {processing ? 'Creating...' : 'Create Ticket Type'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
