import React, { useMemo, useState, useEffect } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Plus, Trash2, Send, Printer } from 'lucide-react';
import { BreadcrumbItem, Member, Gravesite } from '@/types';

// Calculate default dates outside component to avoid impure function calls during render
const getDefaultDates = () => ({
  today: new Date().toISOString().split('T')[0],
  thirtyDaysLater: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
});

const defaultDates = getDefaultDates();

interface Props {
  members: Member[];
  gravesites: Gravesite[];
  deed?: any;
}

interface FlashProps {
  print_url?: string;
  success?: string;
}

interface PageProps {
  flash?: FlashProps;
  deed?: any;
  [key: string]: any;
}

export default function DeedsCreate({ members, gravesites, deed: propsDeed }: Readonly<Props>) {
  const { props } = usePage<PageProps>();
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [createdDeed, setCreatedDeed] = useState<any>(null);
  const [sendMethod, setSendMethod] = useState<'none' | 'email' | 'print' | 'both'>('none');
  const [invoiceItems, setInvoiceItems] = useState([
    { description: 'Cemetery Plot Purchase', quantity: 1, unit_price: '' }
  ]);

  const { data, setData, post, processing, errors } = useForm({
    member_id: '',
    deed_number: '',
    purchase_date: '',
    purchase_price: '',
    notes: '',
    gravesite_ids: [] as number[],
  });

  const invoiceForm = useForm({
    invoice_date: defaultDates.today,
    due_date: defaultDates.thirtyDaysLater,
    items: invoiceItems,
    tax_amount: '0.00',
    notes: '',
    send_method: 'none',
    recipient_email: '',
    recipient_name: '',
  });

  // Pre-fill invoice with deed data when deed is available
  useEffect(() => {
    if (propsDeed) {
      console.log('Deed received from props:', propsDeed);
      setCreatedDeed(propsDeed);
      
      // Pre-fill invoice with deed data
      const selectedMember = members.find(m => m.id === propsDeed.member_id);
      if (selectedMember) {
        invoiceForm.setData({
          ...invoiceForm.data,
          recipient_email: selectedMember.email || '',
          recipient_name: `${selectedMember.first_name} ${selectedMember.last_name}`,
        });
      }
      if (propsDeed.purchase_price) {
        setInvoiceItems([{
          description: 'Cemetery Plot Purchase',
          quantity: 1,
          unit_price: propsDeed.purchase_price
        }]);
      }
      setShowInvoiceModal(true);
    }
  }, [propsDeed]);

  const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cemetery', href: '/admin/deeds' },
    { title: 'Deeds', href: '/admin/deeds' },
    { title: 'Create', href: '/admin/deeds/create' },
  ], []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/deeds', {
      preserveScroll: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Deed" />

      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create New Deed</h1>
            <p className="text-gray-600 dark:text-gray-400">Add a new cemetery plot deed</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Deed Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="member_id">Owner *</Label>
                <Select value={data.member_id} onValueChange={(value) => setData('member_id', value)}>
                  <SelectTrigger>
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
                {errors.member_id && <p className="text-sm text-red-600">{errors.member_id}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deed_number">Deed Number *</Label>
                <Input
                  id="deed_number"
                  value={data.deed_number}
                  onChange={(e) => setData('deed_number', e.target.value)}
                  placeholder="DEED-0001"
                  required
                />
                {errors.deed_number && <p className="text-sm text-red-600">{errors.deed_number}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase_date">Purchase Date *</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={data.purchase_date}
                  onChange={(e) => setData('purchase_date', e.target.value)}
                  required
                />
                {errors.purchase_date && <p className="text-sm text-red-600">{errors.purchase_date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase_price">Purchase Price</Label>
                <Input
                  id="purchase_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={data.purchase_price}
                  onChange={(e) => setData('purchase_price', e.target.value)}
                  placeholder="5000.00"
                />
                {errors.purchase_price && <p className="text-sm text-red-600">{errors.purchase_price}</p>}
              </div>

              <div className="md:col-span-2 space-y-3">
                <Label>Associated Gravesites *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-3">
                  {gravesites.map((gravesite) => {
                    const isUnavailable = gravesite.status === 'reserved' || gravesite.status === 'occupied';
                    return (
                    <div key={gravesite.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={`gravesite-${gravesite.id}`}
                        checked={data.gravesite_ids.includes(gravesite.id)}
                        disabled={isUnavailable}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setData('gravesite_ids', [...data.gravesite_ids, gravesite.id]);
                          } else {
                            setData('gravesite_ids', data.gravesite_ids.filter(id => id !== gravesite.id));
                          }
                        }}
                      />
                      <label
                        htmlFor={`gravesite-${gravesite.id}`}
                        className={`text-sm cursor-pointer ${isUnavailable ? 'opacity-50' : ''}`}
                      >
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          Plot {gravesite.plot_number}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {gravesite.section && `Section ${gravesite.section}`}
                          {gravesite.row && `, Row ${gravesite.row}`}
                          {gravesite.cemetery_name && ` - ${gravesite.cemetery_name}`}
                        </div>
                        <div className="text-xs capitalize">
                          <span className={gravesite.status === 'available' ? 'text-green-600' : gravesite.status === 'reserved' ? 'text-yellow-600' : 'text-red-600'}>
                            {gravesite.status}
                          </span>
                        </div>
                      </label>
                    </div>
                  );})}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Selected {data.gravesite_ids.length} gravesite{data.gravesite_ids.length !== 1 ? 's' : ''} - At least one gravesite is required
                </p>
                {errors.gravesite_ids && <p className="text-sm text-red-600">{errors.gravesite_ids}</p>}
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={data.notes}
                  onChange={(e) => setData('notes', e.target.value)}
                  rows={4}
                  placeholder="Additional notes..."
                />
                {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/admin/deeds">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={processing}>
              {processing ? 'Creating...' : 'Create Deed'}
            </Button>
          </div>
        </form>

        {/* Invoice Creation Modal */}
        <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Deed Invoice</DialogTitle>
              <DialogDescription>
                Create an invoice for the newly created deed. You can preview, email, or print the invoice.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice_date">Invoice Date *</Label>
                  <Input
                    id="invoice_date"
                    type="date"
                    value={invoiceForm.data.invoice_date}
                    onChange={(e) => invoiceForm.setData('invoice_date', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={invoiceForm.data.due_date}
                    onChange={(e) => invoiceForm.setData('due_date', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Invoice Items *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setInvoiceItems([...invoiceItems, { description: '', quantity: 1, unit_price: '' }])}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                {invoiceItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...invoiceItems];
                          newItems[index].description = e.target.value;
                          setInvoiceItems(newItems);
                        }}
                        required
                      />
                    </div>
                    <div className="w-24 space-y-2">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...invoiceItems];
                          newItems[index].quantity = parseInt(e.target.value) || 1;
                          setInvoiceItems(newItems);
                        }}
                        required
                      />
                    </div>
                    <div className="w-32 space-y-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Price"
                        value={item.unit_price}
                        onChange={(e) => {
                          const newItems = [...invoiceItems];
                          newItems[index].unit_price = e.target.value;
                          setInvoiceItems(newItems);
                        }}
                        required
                      />
                    </div>
                    <div className="w-32 pt-2 text-sm text-gray-600 dark:text-gray-400">
                      ${(item.quantity * parseFloat(item.unit_price || '0')).toFixed(2)}
                    </div>
                    {invoiceItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                <div className="flex justify-end pt-2 border-t">
                  <div className="text-right space-y-1">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Subtotal: ${invoiceItems.reduce((sum, item) => sum + (item.quantity * parseFloat(item.unit_price || '0')), 0).toFixed(2)}
                    </div>
                    <div className="text-lg font-semibold">
                      Total: ${(invoiceItems.reduce((sum, item) => sum + (item.quantity * parseFloat(item.unit_price || '0')), 0) + parseFloat(invoiceForm.data.tax_amount || '0')).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_amount">Tax Amount</Label>
                <Input
                  id="tax_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={invoiceForm.data.tax_amount}
                  onChange={(e) => invoiceForm.setData('tax_amount', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice_notes">Notes</Label>
                <Textarea
                  id="invoice_notes"
                  value={invoiceForm.data.notes}
                  onChange={(e) => invoiceForm.setData('notes', e.target.value)}
                  rows={3}
                  placeholder="Additional invoice notes..."
                />
              </div>

              <div className="space-y-3">
                <Label>Delivery Method *</Label>
                <ToggleGroup type="single" value={sendMethod} onValueChange={(value: any) => value && setSendMethod(value)} className="flex flex-col items-start gap-2">
                  <ToggleGroupItem value="none" className="w-full justify-start">
                    Create invoice only (no email or print)
                  </ToggleGroupItem>
                  <ToggleGroupItem value="email" className="w-full justify-start">
                    <Send className="h-4 w-4 mr-2" />
                    Email invoice to recipient
                  </ToggleGroupItem>
                  <ToggleGroupItem value="print" className="w-full justify-start">
                    <Printer className="h-4 w-4 mr-2" />
                    Open print view
                  </ToggleGroupItem>
                  <ToggleGroupItem value="both" className="w-full justify-start">
                    <Send className="h-4 w-4 mr-2" />
                    <Printer className="h-4 w-4 mr-2" />
                    Email and print
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {(sendMethod === 'email' || sendMethod === 'both') && (
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="recipient_email">Recipient Email *</Label>
                    <Input
                      id="recipient_email"
                      type="email"
                      value={invoiceForm.data.recipient_email}
                      onChange={(e) => invoiceForm.setData('recipient_email', e.target.value)}
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipient_name">Recipient Name *</Label>
                    <Input
                      id="recipient_name"
                      value={invoiceForm.data.recipient_name}
                      onChange={(e) => invoiceForm.setData('recipient_name', e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowInvoiceModal(false);
                  router.visit(`/admin/deeds/${createdDeed?.id || ''}`);
                }}
              >
                Skip Invoice
              </Button>
              <Button
                type="button"
                onClick={() => {
                  console.log('Creating invoice for deed:', createdDeed?.id);
                  console.log('Invoice items:', invoiceItems);
                  console.log('Send method:', sendMethod);
                  
                  const invoiceData: any = {
                    invoice_date: invoiceForm.data.invoice_date,
                    due_date: invoiceForm.data.due_date,
                    items: invoiceItems,
                    tax_amount: invoiceForm.data.tax_amount || '0.00',
                    notes: invoiceForm.data.notes || '',
                    send_method: sendMethod,
                  };
                  
                  // Only include recipient fields if sending email or printing
                  if (sendMethod === 'email' || sendMethod === 'both') {
                    invoiceData.recipient_email = invoiceForm.data.recipient_email;
                    invoiceData.recipient_name = invoiceForm.data.recipient_name;
                  } else if (sendMethod === 'print') {
                    invoiceData.recipient_name = invoiceForm.data.recipient_name;
                  }
                  
                  console.log('Posting invoice data:', invoiceData);
                  
                  router.post(`/admin/deeds/${createdDeed?.id}/invoice`, invoiceData, {
                    preserveScroll: true,
                    onSuccess: (page) => {
                      console.log('Invoice created successfully');
                      const printUrl = (page.props as any).flash?.print_url;
                      if (printUrl) {
                        window.open(printUrl, '_blank');
                      }
                    },
                    onError: (errors) => {
                      console.error('Invoice creation errors:', errors);
                    }
                  });
                }}
                disabled={invoiceForm.processing}
              >
                {invoiceForm.processing ? 'Creating...' : 'Create Invoice'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
