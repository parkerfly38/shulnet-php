import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface InvoiceItem {
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

interface Payment {
    id: number;
    amount: number;
    payment_method: string;
    status: string;
    paid_at: string;
    transaction_id: string | null;
}

interface Invoice {
    id: number;
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    status: string;
    subtotal: number;
    total: number;
    amount_paid: number;
    balance: number;
    notes: string | null;
    items: InvoiceItem[];
    payments: Payment[];
}

interface Member {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    address_line1: string | null;
    address_line2: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
}

interface Props {
    member: Member;
    invoice: Invoice;
}

export default function InvoiceView({ member, invoice }: Props) {
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
            day: 'numeric',
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'partial':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'overdue':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout>
            <Head title={`Invoice ${invoice.invoice_number}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Action Buttons - Hidden when printing */}
                    <div className="mb-6 flex justify-between items-center print:hidden">
                        <Link
                            href="/member/dashboard"
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Dashboard
                        </Link>
                        <div className="flex gap-3">
                            {invoice.balance > 0 && (
                                <Link
                                    href={`/member/invoices/${invoice.id}/pay`}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    Pay Now
                                </Link>
                            )}
                            <button
                                onClick={handlePrint}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Print Invoice
                            </button>
                        </div>
                    </div>

                    {/* Invoice Container */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-8">
                        {/* Header */}
                        <div className="border-b pb-6 mb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Invoice</h1>
                                    <p className="text-gray-600 mt-1">#{invoice.invoice_number}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(invoice.status)}`}>
                                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Billing Information */}
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To</h3>
                                <div className="text-gray-900">
                                    <p className="font-semibold">{member.first_name} {member.last_name}</p>
                                    {member.address_line1 && <p>{member.address_line1}</p>}
                                    {member.address_line2 && <p>{member.address_line2}</p>}
                                    {(member.city || member.state || member.zip_code) && (
                                        <p>
                                            {member.city}{member.city && member.state ? ', ' : ''}{member.state} {member.zip_code}
                                        </p>
                                    )}
                                    {member.email && <p className="mt-2">{member.email}</p>}
                                    {member.phone && <p>{member.phone}</p>}
                                </div>
                            </div>

                            <div className="text-right">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Invoice Details</h3>
                                <div className="text-gray-900">
                                    <div className="mb-2">
                                        <span className="text-gray-600">Invoice Date: </span>
                                        <span className="font-semibold">{formatDate(invoice.invoice_date)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Due Date: </span>
                                        <span className="font-semibold">{formatDate(invoice.due_date)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="mb-8">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-300">
                                        <th className="text-left py-3 text-gray-700 font-semibold">Description</th>
                                        <th className="text-right py-3 text-gray-700 font-semibold">Quantity</th>
                                        <th className="text-right py-3 text-gray-700 font-semibold">Unit Price</th>
                                        <th className="text-right py-3 text-gray-700 font-semibold">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-200">
                                            <td className="py-3 text-gray-900">{item.description}</td>
                                            <td className="py-3 text-right text-gray-900">{item.quantity}</td>
                                            <td className="py-3 text-right text-gray-900">{formatCurrency(item.unit_price)}</td>
                                            <td className="py-3 text-right text-gray-900 font-semibold">{formatCurrency(item.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end mb-8">
                            <div className="w-64">
                                <div className="flex justify-between py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="text-gray-900 font-semibold">{formatCurrency(invoice.subtotal)}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-gray-200">
                                    <span className="text-gray-900 font-bold">Total:</span>
                                    <span className="text-gray-900 font-bold">{formatCurrency(invoice.total)}</span>
                                </div>
                                {invoice.amount_paid > 0 && (
                                    <div className="flex justify-between py-2 border-b border-gray-200">
                                        <span className="text-gray-600">Amount Paid:</span>
                                        <span className="text-green-600 font-semibold">{formatCurrency(invoice.amount_paid)}</span>
                                    </div>
                                )}
                                {invoice.balance > 0 && (
                                    <div className="flex justify-between py-3 border-t-2 border-gray-900">
                                        <span className="text-gray-900 font-bold text-lg">Balance Due:</span>
                                        <span className="text-gray-900 font-bold text-lg">{formatCurrency(invoice.balance)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        {invoice.notes && (
                            <div className="border-t pt-6 mb-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Notes</h3>
                                <p className="text-gray-700 whitespace-pre-line">{invoice.notes}</p>
                            </div>
                        )}

                        {/* Payment History */}
                        {invoice.payments && invoice.payments.length > 0 && (
                            <div className="border-t pt-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Payment History</h3>
                                <div className="space-y-2">
                                    {invoice.payments.map((payment) => (
                                        <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                            <div>
                                                <span className="font-medium">{formatCurrency(payment.amount)}</span>
                                                <span className="text-gray-600 text-sm ml-2">
                                                    via {payment.payment_method.replace('_', ' ')}
                                                </span>
                                                {payment.transaction_id && (
                                                    <span className="text-gray-500 text-xs ml-2">
                                                        (#{payment.transaction_id.substring(0, 12)}...)
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-gray-600">
                                                    {new Date(payment.paid_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded ${
                                                    payment.status === 'completed' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {payment.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
