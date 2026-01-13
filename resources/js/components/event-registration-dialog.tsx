import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Event {
    id: number;
    name: string;
    tagline: string | null;
    event_start: string;
    event_end: string | null;
    location: string | null;
    allow_guests: boolean;
    max_guests: number | null;
    ticket_types: TicketType[];
    has_paid_tickets: boolean;
}

interface TicketType {
    id: number;
    name: string;
    description: string | null;
    price: number;
    quantity_available: number | null;
    remaining_quantity: number | null;
}

interface Props {
    event: Event | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function EventRegistrationDialog({ event, isOpen, onClose }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        guests: 0,
        notes: '',
        ticket_type_id: null as number | null,
        quantity: 1,
        payment_option: 'invoice' as 'invoice' | 'pay_now',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (event) {
            post(`/member/events/${event.id}/register`, {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!event) return null;

    const selectedTicket = event.ticket_types?.find(t => t.id === data.ticket_type_id);
    const totalCost = selectedTicket ? selectedTicket.price * data.quantity : 0;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Register for Event</DialogTitle>
                    <DialogDescription>
                        {event.name}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Ticket Selection */}
                    {event.ticket_types && event.ticket_types.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Ticket Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.ticket_type_id || ''}
                                onChange={(e) => setData('ticket_type_id', e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 dark:bg-gray-900"
                                required={event.has_paid_tickets}
                            >
                                <option value="">Select a ticket type</option>
                                {event.ticket_types.map((ticket) => (
                                    <option key={ticket.id} value={ticket.id}>
                                        {ticket.name} - ${ticket.price.toFixed(2)}
                                        {ticket.remaining_quantity !== null && ` (${ticket.remaining_quantity} left)`}
                                    </option>
                                ))}
                            </select>
                            {selectedTicket?.description && (
                                <p className="text-sm text-gray-500 mt-1">{selectedTicket.description}</p>
                            )}
                            {errors.ticket_type_id && (
                                <p className="text-red-500 text-sm mt-1">{errors.ticket_type_id}</p>
                            )}
                        </div>
                    )}

                    {/* Quantity */}
                    {data.ticket_type_id && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Number of Tickets
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={selectedTicket?.remaining_quantity || undefined}
                                value={data.quantity}
                                onChange={(e) => setData('quantity', parseInt(e.target.value) || 1)}
                                className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 dark:bg-gray-900"
                            />
                            {errors.quantity && (
                                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
                            )}
                        </div>
                    )}

                    {!!event.allow_guests && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Number of Guests
                                {event.max_guests && event.max_guests > 0 && (
                                    <span className="text-gray-500 ml-2">(Maximum: {event.max_guests})</span>
                                )}
                            </label>
                            <input
                                type="number"
                                min="0"
                                max={event.max_guests || undefined}
                                value={data.guests}
                                onChange={(e) => setData('guests', parseInt(e.target.value) || 0)}
                                className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 dark:bg-gray-900"
                            />
                            {errors.guests && (
                                <p className="text-red-500 text-sm mt-1">{errors.guests}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Special Requests / Dietary Restrictions (Optional)
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={3}
                            maxLength={500}
                            placeholder="Any special requests or dietary restrictions..."
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 dark:bg-gray-900"
                        />
                        {errors.notes && (
                            <p className="text-red-500 text-sm mt-1">{errors.notes}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            {data.notes.length}/500 characters
                        </p>
                    </div>

                    {/* Payment Option */}
                    {totalCost > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Payment Option <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                                    <input
                                        type="radio"
                                        value="invoice"
                                        checked={data.payment_option === 'invoice'}
                                        onChange={(e) => setData('payment_option', e.target.value as 'invoice' | 'pay_now')}
                                        className="mr-3"
                                    />
                                    <div>
                                        <p className="font-medium">Invoice Me Later</p>
                                        <p className="text-sm text-gray-500">You'll receive an invoice to pay later</p>
                                    </div>
                                </label>
                                <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                                    <input
                                        type="radio"
                                        value="pay_now"
                                        checked={data.payment_option === 'pay_now'}
                                        onChange={(e) => setData('payment_option', e.target.value as 'invoice' | 'pay_now')}
                                        className="mr-3"
                                    />
                                    <div>
                                        <p className="font-medium">Pay Now</p>
                                        <p className="text-sm text-gray-500">Proceed to payment immediately</p>
                                    </div>
                                </label>
                            </div>
                            {errors.payment_option && (
                                <p className="text-red-500 text-sm mt-1">{errors.payment_option}</p>
                            )}
                        </div>
                    )}

                    {/* Total Display */}
                    {totalCost > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Total:</span>
                                <span className="text-xl font-bold">${totalCost.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
                        >
                            {processing ? 'Registering...' : 'Confirm Registration'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
