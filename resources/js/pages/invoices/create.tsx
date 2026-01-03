import React, { useMemo, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { BreadcrumbItem, Member } from '@/types';

interface Props {
  members: Member[];
  selectedMember?: string;
}

interface InvoiceItem {
  description: string;
  quantity: string;
  unit_price: string;
}

interface FormData {
  member_id: string;
  invoice_date: string;
  due_date: string;
  status: string;
  tax_amount: string;
  notes: string;
  recurring: boolean;
  recurring_interval: string;
  recurring_interval_count: string;
  recurring_end_date: string;
  send_email: boolean;
  items: InvoiceItem[];
}

export default function InvoicesCreate({ members, selectedMember }: Readonly<Props>) {
  const { currency } = usePage().props as any;

  const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Invoices', href: '/admin/invoices' },
    { title: 'Create', href: '/admin/invoices/create' },
  ], []);

  const { data, setData, post, processing, errors } = useForm<FormData>({
    member_id: selectedMember || '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    tax_amount: '0.00',
    notes: '',
    recurring: false,
    recurring_interval: 'monthly',
    recurring_interval_count: '1',
    recurring_end_date: '',
    send_email: false,
    items: [{ description: '', quantity: '1', unit_price: '0.00' }],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/invoices');
  };

  const addItem = () => {
    setData('items', [...data.items, { description: '', quantity: '1', unit_price: '0.00' }]);
  };

  const removeItem = (index: number) => {
    const newItems = data.items.filter((_, i) => i !== index);
    setData('items', newItems.length > 0 ? newItems : [{ description: '', quantity: '1', unit_price: '0.00' }]);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string) => {
    const newItems = [...data.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setData('items', newItems);
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    return quantity * unitPrice;
  };

  const calculateSubtotal = () => {
    return data.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = parseFloat(data.tax_amount) || 0;
    return subtotal + tax;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Invoice" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Invoice</h1>
            <p className="text-gray-600 dark:text-gray-400">Create a new invoice for a member</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="rounded-lg border bg-white dark:bg-black p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Invoice Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="member_id">Member *</Label>
                <Select value={data.member_id} onValueChange={(value) => setData('member_id', value)}>
                  <SelectTrigger className={errors.member_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.first_name} {member.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.member_id && <p className="text-sm text-red-600 mt-1">{errors.member_id}</p>}
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                  <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-sm text-red-600 mt-1">{errors.status}</p>}
              </div>

              <div>
                <Label htmlFor="invoice_date">Invoice Date *</Label>
                <Input
                  id="invoice_date"
                  type="date"
                  value={data.invoice_date}
                  onChange={(e) => setData('invoice_date', e.target.value)}
                  className={errors.invoice_date ? 'border-red-500' : ''}
                />
                {errors.invoice_date && <p className="text-sm text-red-600 mt-1">{errors.invoice_date}</p>}
              </div>

              <div>
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={data.due_date}
                  onChange={(e) => setData('due_date', e.target.value)}
                  className={errors.due_date ? 'border-red-500' : ''}
                />
                {errors.due_date && <p className="text-sm text-red-600 mt-1">{errors.due_date}</p>}
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={data.notes}
                onChange={(e) => setData('notes', e.target.value)}
                className={errors.notes ? 'border-red-500' : ''}
                rows={3}
                placeholder="Optional notes for this invoice"
              />
              {errors.notes && <p className="text-sm text-red-600 mt-1">{errors.notes}</p>}
            </div>
          </div>

          {/* Invoice Items */}
          <div className="rounded-lg border bg-white dark:bg-black p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Line Items</h2>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {data.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Label htmlFor={`item-${index}-description`}>Description *</Label>
                    <Input
                      id={`item-${index}-description`}
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Item description"
                      className={errors[`items.${index}.description`] ? 'border-red-500' : ''}
                    />
                    {errors[`items.${index}.description`] && (
                      <p className="text-sm text-red-600 mt-1">{errors[`items.${index}.description`]}</p>
                    )}
                  </div>
                  <div className="w-24">
                    <Label htmlFor={`item-${index}-quantity`}>Qty *</Label>
                    <Input
                      id={`item-${index}-quantity`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      className={errors[`items.${index}.quantity`] ? 'border-red-500' : ''}
                    />
                  </div>
                  <div className="w-32">
                    <Label htmlFor={`item-${index}-unit_price`}>Price *</Label>
                    <Input
                      id={`item-${index}-unit_price`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                      className={errors[`items.${index}.unit_price`] ? 'border-red-500' : ''}
                    />
                  </div>
                  <div className="w-32 pt-6">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(calculateItemTotal(item))}
                    </div>
                  </div>
                  {data.items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="mt-6"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-6 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(calculateSubtotal())}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <Label htmlFor="tax_amount">Tax:</Label>
                <Input
                  id="tax_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={data.tax_amount}
                  onChange={(e) => setData('tax_amount', e.target.value)}
                  className={`w-32 ${errors.tax_amount ? 'border-red-500' : ''}`}
                />
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span className="text-gray-900 dark:text-gray-100">Total:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>
          </div>

          {/* Recurring Settings */}
          <div className="rounded-lg border bg-white dark:bg-black p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recurring Settings</h2>
            
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="recurring"
                checked={data.recurring}
                onCheckedChange={(checked) => setData('recurring', checked as boolean)}
              />
              <Label htmlFor="recurring">Make this invoice recurring</Label>
            </div>

            {data.recurring && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                <div>
                  <Label htmlFor="recurring_interval">Interval *</Label>
                  <Select value={data.recurring_interval} onValueChange={(value) => setData('recurring_interval', value)}>
                    <SelectTrigger className={errors.recurring_interval ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.recurring_interval && <p className="text-sm text-red-600 mt-1">{errors.recurring_interval}</p>}
                </div>

                <div>
                  <Label htmlFor="recurring_interval_count">Every *</Label>
                  <Input
                    id="recurring_interval_count"
                    type="number"
                    min="1"
                    value={data.recurring_interval_count}
                    onChange={(e) => setData('recurring_interval_count', e.target.value)}
                    className={errors.recurring_interval_count ? 'border-red-500' : ''}
                  />
                  {errors.recurring_interval_count && (
                    <p className="text-sm text-red-600 mt-1">{errors.recurring_interval_count}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="recurring_end_date">End Date (Optional)</Label>
                  <Input
                    id="recurring_end_date"
                    type="date"
                    value={data.recurring_end_date}
                    onChange={(e) => setData('recurring_end_date', e.target.value)}
                    className={errors.recurring_end_date ? 'border-red-500' : ''}
                  />
                  {errors.recurring_end_date && (
                    <p className="text-sm text-red-600 mt-1">{errors.recurring_end_date}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Email Invoice */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="send_email"
                checked={data.send_email}
                onCheckedChange={(checked) => setData('send_email', checked as boolean)}
              />
              <Label htmlFor="send_email" className="cursor-pointer">
                Generate PDF and email invoice to member
              </Label>
            </div>
            {data.send_email && (
              <p className="text-sm text-gray-600 dark:text-gray-400 pl-6">
                A PDF invoice will be generated and emailed to the member's email address after creation.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Link href="/admin/invoices">
              <Button type="button" variant="outline" disabled={processing}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={processing}>
              <Save className="h-4 w-4 mr-2" />
              {processing ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
