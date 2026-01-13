import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface Invoice {
    id: number;
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    status: string;
    total: number;
    amount_paid: number;
    balance: number;
    notes: string | null;
}

interface Member {
    id: number;
    first_name: string;
    last_name: string;
}

interface Props {
    member: Member;
    invoices: Invoice[];
}

export default function InvoicesPage({ member, invoices }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'partial':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'open':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'overdue':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const getStatusText = (invoice: Invoice) => {
        if (invoice.status === 'paid') return 'Paid';
        if (invoice.status === 'partial') return `Partial (${formatCurrency(invoice.balance)} due)`;
        if (invoice.status === 'overdue') return 'Overdue';
        return 'Open';
    };

    return (
        <AppLayout>
            <Head title="My Invoices" />

            <div className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">My Invoices</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            View and manage all your invoices
                        </p>
                    </div>
                    <Link
                        href="/member/dashboard"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </Link>
                </div>

                {invoices.length === 0 ? (
                    <div className="bg-white dark:bg-black rounded-lg p-12 border text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Invoices Found</h3>
                        <p className="text-gray-600 dark:text-gray-400">You don't have any invoices yet.</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-black rounded-lg border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Invoice #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Due Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Balance
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {invoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link
                                                    href={`/member/invoices/${invoice.id}`}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                                >
                                                    {invoice.invoice_number}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                {formatDate(invoice.invoice_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                {formatDate(invoice.due_date)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                {invoice.notes || 'Invoice'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                                                {formatCurrency(invoice.total)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                                                {invoice.balance > 0 ? (
                                                    <span className="text-red-600 dark:text-red-400">
                                                        {formatCurrency(invoice.balance)}
                                                    </span>
                                                ) : (
                                                    <span className="text-green-600 dark:text-green-400">
                                                        {formatCurrency(0)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                                                    {getStatusText(invoice)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/member/invoices/${invoice.id}`}
                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                    >
                                                        View
                                                    </Link>
                                                    {invoice.balance > 0 && (
                                                        <Link
                                                            href={`/member/invoices/${invoice.id}/pay`}
                                                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                                        >
                                                            Pay
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Summary Cards */}
                {invoices.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-black rounded-lg p-6 border">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Invoiced</h3>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {formatCurrency(invoices.reduce((sum, inv) => sum + Number(inv.total), 0))}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-black rounded-lg p-6 border">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Paid</h3>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(invoices.reduce((sum, inv) => sum + Number(inv.amount_paid), 0))}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-black rounded-lg p-6 border">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Outstanding Balance</h3>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {formatCurrency(invoices.reduce((sum, inv) => sum + Number(inv.balance), 0))}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
