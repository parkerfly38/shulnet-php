import React, { useMemo, useState } from 'react';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Trash2, RefreshCw, Printer, CheckCircle, DollarSign } from 'lucide-react';
import { BreadcrumbItem, Invoice } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface Props {
  invoice: Invoice;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  open: 'Open',
  partial: 'Partial',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

export default function InvoicesShow({ invoice }: Readonly<Props>) {
  const { currency } = usePage().props as any;
  const [markPaidOpen, setMarkPaidOpen] = useState(false);

  const { data, setData, post, processing, reset } = useForm({
    payment_method: 'check',
    amount: (parseFloat(invoice.total) - parseFloat(invoice.amount_paid)).toFixed(2),
    note: '',
  });

  const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Invoices', href: '/admin/invoices' },
    { title: invoice.invoice_number, href: `/admin/invoices/${invoice.id}` },
  ], [invoice.id, invoice.invoice_number]);

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete invoice ${invoice.invoice_number}?`)) {
      router.delete(`/admin/invoices/${invoice.id}`);
    }
  };

  const handleGenerateNext = () => {
    if (confirm('Generate the next recurring invoice now?')) {
      router.post(`/admin/invoices/${invoice.id}/generate-next`);
    }
  };

  const handleMarkAsPaid = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/admin/invoices/${invoice.id}/mark-as-paid`, {
      onSuccess: () => {
        setMarkPaidOpen(false);
        reset();
      },
    });
  };

  const formatAmount = (amount: string) => {
    return formatCurrency(parseFloat(amount), currency);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPaymentStatusClass = (status: string) => {
    if (status === 'completed') {
      return 'bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400';
    }
    if (status === 'pending') {
      return 'bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
    return 'bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400';
  };

  const formatPaymentMethod = (method: string) => {
    if (method === 'credit_card') return 'Credit Card';
    if (method === 'wire_transfer') return 'Wire Transfer';
    return method.charAt(0).toUpperCase() + method.slice(1);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Invoice ${invoice.invoice_number}`} />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Invoice {invoice.invoice_number}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {invoice.member?.first_name} {invoice.member?.last_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {invoice.recurring && (
              <Button variant="outline" onClick={handleGenerateNext}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Next
              </Button>
            )}
            {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
              <Dialog open={markPaidOpen} onOpenChange={setMarkPaidOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-green-600 hover:text-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Paid
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleMarkAsPaid}>
                    <DialogHeader>
                      <DialogTitle>Mark Invoice as Paid</DialogTitle>
                      <DialogDescription>
                        Record a manual payment for this invoice. A payment record will be created.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="payment_method">Payment Method</Label>
                        <Select
                          value={data.payment_method}
                          onValueChange={(value) => setData('payment_method', value)}
                        >
                          <SelectTrigger id="payment_method">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="check">Check</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="wire_transfer">Wire Transfer</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={data.amount}
                          onChange={(e) => setData('amount', e.target.value)}
                          placeholder="Payment amount"
                        />
                        <p className="text-xs text-muted-foreground">
                          Remaining balance: {formatAmount((parseFloat(invoice.total) - parseFloat(invoice.amount_paid)).toString())}
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="note">Note (Optional)</Label>
                        <Textarea
                          id="note"
                          value={data.note}
                          onChange={(e) => setData('note', e.target.value)}
                          placeholder="Add any notes about this payment..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setMarkPaidOpen(false)}
                        disabled={processing}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={processing}>
                        {processing ? 'Recording...' : 'Record Payment'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            <Button
              variant="outline"
              onClick={() => window.open(`/admin/invoices/${invoice.id}/print`, '_blank')}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Link href={`/admin/invoices/${invoice.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-800">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl font-bold">INVOICE</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {invoice.invoice_number}
                    </p>
                  </div>
                  <Badge className={statusColors[invoice.status]}>
                    {statusLabels[invoice.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Billed To</h3>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {invoice.member?.first_name} {invoice.member?.last_name}
                    </p>
                    {invoice.member?.email && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.member.email}</p>
                    )}
                    {invoice.member?.address_line_1 && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        <p>{invoice.member.address_line_1}</p>
                        {invoice.member.address_line_2 && <p>{invoice.member.address_line_2}</p>}
                        <p>
                          {invoice.member.city}, {invoice.member.state} {invoice.member.zip}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Invoice Date</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {formatDate(invoice.invoice_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Due Date</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {formatDate(invoice.due_date)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Description</th>
                        <th className="pb-3 font-medium text-gray-500 dark:text-gray-400 text-right">Qty</th>
                        <th className="pb-3 font-medium text-gray-500 dark:text-gray-400 text-right">Price</th>
                        <th className="pb-3 font-medium text-gray-500 dark:text-gray-400 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items?.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-3 text-gray-900 dark:text-gray-100">{item.description}</td>
                          <td className="py-3 text-right text-gray-600 dark:text-gray-400">{item.quantity}</td>
                          <td className="py-3 text-right text-gray-600 dark:text-gray-400">
                            {formatAmount(item.unit_price)}
                          </td>
                          <td className="py-3 text-right font-medium text-gray-900 dark:text-gray-100">
                            {formatAmount((parseFloat(item.unit_price) * parseFloat(item.quantity.toString())).toString())}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatAmount(invoice.subtotal)}
                    </span>
                  </div>
                  {parseFloat(invoice.tax_amount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatAmount(invoice.tax_amount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span className="text-gray-900 dark:text-gray-100">Total:</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {formatAmount(invoice.total)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {invoice.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{invoice.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recurring Information */}
            {invoice.recurring && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Recurring Invoice
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Frequency</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Every {invoice.recurring_interval_count > 1 && `${invoice.recurring_interval_count} `}
                      {invoice.recurring_interval}
                    </p>
                  </div>
                  {invoice.next_invoice_date && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Next Invoice</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {formatDate(invoice.next_invoice_date)}
                      </p>
                    </div>
                  )}
                  {invoice.last_invoice_date && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last Generated</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {formatDate(invoice.last_invoice_date)}
                      </p>
                    </div>
                  )}
                  {invoice.recurring_end_date && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Ends On</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {formatDate(invoice.recurring_end_date)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(invoice.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(invoice.updated_at)}
                  </p>
                </div>
                {invoice.parent_invoice_id && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Parent Invoice</p>
                    <Link
                      href={`/admin/invoices/${invoice.parent_invoice_id}`}
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Parent
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            {invoice.payments && invoice.payments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Payment Summary */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {formatAmount(invoice.total)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Total Paid:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {formatAmount(invoice.amount_paid)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-gray-900 dark:text-gray-100">Balance Due:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {formatAmount((Number.parseFloat(invoice.total) - Number.parseFloat(invoice.amount_paid)).toFixed(2))}
                        </span>
                      </div>
                    </div>

                    {/* Payment List */}
                    <div className="space-y-3">
                      {invoice.payments.map((payment) => (
                        <div 
                          key={payment.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {formatAmount(payment.amount)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {payment.paid_at ? formatDate(payment.paid_at) : formatDate(payment.created_at)}
                              </p>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={getPaymentStatusClass(payment.status)}
                            >
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            <p>
                              <span className="font-medium">Method:</span>{' '}
                              {formatPaymentMethod(payment.payment_method)}
                            </p>
                            {payment.transaction_id && (
                              <p className="mt-1">
                                <span className="font-medium">Transaction:</span>{' '}
                                <span className="font-mono">{payment.transaction_id}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
