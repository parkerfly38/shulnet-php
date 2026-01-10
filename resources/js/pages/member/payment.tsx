import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { FormEvent, useEffect, useState } from 'react';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface Invoice {
    id: number;
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    status: string;
    total: number;
    amount_paid: number;
    balance: number;
}

interface Member {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface Props {
    invoice: Invoice;
    member: Member;
    processor: string;
    stripePublicKey?: string;
}

let stripePromise: Promise<Stripe | null> | null = null;

function StripePaymentForm({ invoice, member }: { invoice: Invoice; member: Member }) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [amount, setAmount] = useState<string>(invoice.balance.toFixed(2));

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        const paymentAmount = parseFloat(amount);
        if (isNaN(paymentAmount) || paymentAmount <= 0 || paymentAmount > invoice.balance) {
            setError(`Please enter a valid amount between $0.01 and $${invoice.balance.toFixed(2)}`);
            return;
        }

        setProcessing(true);
        setError(null);

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            setError('Card element not found');
            setProcessing(false);
            return;
        }

        try {
            const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    name: `${member.first_name} ${member.last_name}`,
                    email: member.email,
                },
            });

            if (methodError) {
                setError(methodError.message || 'Payment method creation failed');
                setProcessing(false);
                return;
            }

            // Submit to backend
            router.post(`/member/invoices/${invoice.id}/pay`, {
                payment_method_id: paymentMethod?.id,
                amount: paymentAmount,
            }, {
                onError: (errors) => {
                    setError(Object.values(errors)[0] as string);
                    setProcessing(false);
                },
            });
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={invoice.balance}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2"
                    />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                    Maximum: ${invoice.balance.toFixed(2)}
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Information
                </label>
                <div className="border border-gray-300 rounded-md p-3">
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                                invalid: {
                                    color: '#9e2146',
                                },
                            },
                        }}
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-md transition-colors"
            >
                {processing ? 'Processing...' : `Pay $${parseFloat(amount || '0').toFixed(2)}`}
            </button>
        </form>
    );
}

function AuthorizeNetPaymentForm({ invoice }: { invoice: Invoice }) {
    const { data, setData, post, processing, errors } = useForm({
        card_number: '',
        expiration_date: '',
        cvv: '',
        amount: invoice.balance.toFixed(2),
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const paymentAmount = parseFloat(data.amount);
        if (isNaN(paymentAmount) || paymentAmount <= 0 || paymentAmount > invoice.balance) {
            return;
        }
        post(`/member/invoices/${invoice.id}/pay`);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {errors && Object.values(errors).length > 0 && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {Object.values(errors)[0]}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={invoice.balance}
                        value={data.amount}
                        onChange={(e) => setData('amount', e.target.value)}
                        className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2"
                        required
                    />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                    Maximum: ${invoice.balance.toFixed(2)}
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                </label>
                <input
                    type="text"
                    value={data.card_number}
                    onChange={(e) => setData('card_number', e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiration (MMYY)
                    </label>
                    <input
                        type="text"
                        value={data.expiration_date}
                        onChange={(e) => setData('expiration_date', e.target.value)}
                        placeholder="1225"
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                    </label>
                    <input
                        type="text"
                        value={data.cvv}
                        onChange={(e) => setData('cvv', e.target.value)}
                        placeholder="123"
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={processing}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-md transition-colors"
            >
                {processing ? 'Processing...' : `Pay $${parseFloat(data.amount || '0').toFixed(2)}`}
            </button>
        </form>
    );
}

function PayPalPaymentForm({ invoice }: { invoice: Invoice }) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load PayPal SDK
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${(window as any).paypalClientId || ''}&currency=USD`;
        script.async = true;
        script.onload = () => {
            if ((window as any).paypal) {
                (window as any).paypal.Buttons({
                    createOrder: (data: any, actions: any) => {
                        setLoading(true);
                        return actions.order.create({
                            purchase_units: [{
                                amount: {
                                    value: invoice.total.toFixed(2),
                                },
                            }],
                        });
                    },
                    onApprove: (data: any, actions: any) => {
                        return actions.order.capture().then(() => {
                            router.post(`/member/invoices/${invoice.id}/pay`, {
                                order_id: data.orderID,
                            });
                        });
                    },
                    onError: (err: any) => {
                        setError('PayPal payment failed');
                        setLoading(false);
                    },
                }).render('#paypal-button-container');
            }
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [invoice]);

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="text-center">
                <p className="text-gray-600 mb-4">
                    Click the PayPal button below to complete your payment
                </p>
                <div id="paypal-button-container"></div>
            </div>
        </div>
    );
}

export default function PaymentPage({ invoice, member, processor, stripePublicKey }: Props) {
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

    // Initialize Stripe
    if (processor === 'stripe' && stripePublicKey && !stripePromise) {
        stripePromise = loadStripe(stripePublicKey);
    }

    return (
        <AppLayout>
            <Head title={`Pay Invoice ${invoice.invoice_number}`} />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link
                            href={`/member/invoices/${invoice.id}`}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Invoice
                        </Link>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">Pay Invoice</h1>

                        {/* Invoice Summary */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-8">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Invoice Number:</span>
                                <span className="font-semibold">#{invoice.invoice_number}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Due Date:</span>
                                <span className="font-semibold">{formatDate(invoice.due_date)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Total Amount:</span>
                                <span className="font-semibold">{formatCurrency(invoice.total)}</span>
                            </div>
                            {invoice.amount_paid > 0 && (
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Amount Paid:</span>
                                    <span className="font-semibold text-green-600">{formatCurrency(invoice.amount_paid)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                <span className="text-lg font-bold text-gray-900">Balance Due:</span>
                                <span className="text-lg font-bold text-gray-900">{formatCurrency(invoice.balance)}</span>
                            </div>
                        </div>

                        {/* Payment Form */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
                            
                            {processor === 'stripe' && stripePromise && (
                                <Elements stripe={stripePromise}>
                                    <StripePaymentForm invoice={invoice} member={member} />
                                </Elements>
                            )}

                            {processor === 'authorize_net' && (
                                <AuthorizeNetPaymentForm invoice={invoice} />
                            )}

                            {processor === 'paypal' && (
                                <PayPalPaymentForm invoice={invoice} />
                            )}
                        </div>

                        <div className="mt-6 text-center text-sm text-gray-500">
                            <p>Your payment information is secure and encrypted.</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
