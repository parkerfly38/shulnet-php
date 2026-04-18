import { FormEvent, useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Trash2 } from 'lucide-react';

interface RSVP {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    guests: number;
    quantity: number;
    ticket_price: number;
    total_amount: number;
    status: string;
    notes: string | null;
    event_ticket_type_id: number | null;
    ticketType?: {
        id: number;
        name: string;
        price: number;
    } | null;
}

interface TicketType {
    id: number;
    name: string;
    price: number | string; // Comes as string from Laravel decimal fields
    description?: string;
}

interface Props {
    rsvp: RSVP | null;
    ticketTypes: TicketType[];
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function EditRsvpDialog({ rsvp, ticketTypes, isOpen, onClose, onSuccess }: Props) {
    const [data, setData] = useState({
        name: '',
        email: '',
        phone: '',
        guests: 0,
        quantity: 1,
        ticket_price: 0,
        total_amount: 0,
        status: 'pending',
        notes: '',
        event_ticket_type_id: null as number | null,
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (rsvp) {
            setData({
                name: rsvp.name || '',
                email: rsvp.email || '',
                phone: rsvp.phone || '',
                guests: rsvp.guests || 0,
                quantity: rsvp.quantity || 1,
                ticket_price: rsvp.ticket_price || 0,
                total_amount: rsvp.total_amount || 0,
                status: rsvp.status || 'pending',
                notes: rsvp.notes || '',
                event_ticket_type_id: rsvp.event_ticket_type_id,
            });
            setErrors({});
        }
    }, [rsvp]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!rsvp) return;

        setProcessing(true);
        setErrors({});

        const payload = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            guests: data.guests,
            quantity: data.quantity,
            ticket_price: data.ticket_price,
            total_amount: data.total_amount,
            status: data.status,
            notes: data.notes,
            event_ticket_type_id: data.event_ticket_type_id,
        };

        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        try {
            const response = await fetch(`/api/admin/event-rsvps/${rsvp.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                },
                body: JSON.stringify(payload),
                credentials: 'include',
            });

            const responseData = await response.json();

            if (!response.ok) {
                if (responseData.errors) {
                    setErrors(responseData.errors);
                }
            } else {
                onClose();
                if (onSuccess) {
                    onSuccess();
                }
            }
        } catch (error: any) {
            console.error('Error updating RSVP:', error);
        } finally {
            setProcessing(false);
        }
    };

    const handleClose = () => {
        setData({
            name: '',
            email: '',
            phone: '',
            guests: 0,
            quantity: 1,
            ticket_price: 0,
            total_amount: 0,
            status: 'pending',
            notes: '',
            event_ticket_type_id: null,
        });
        setErrors({});
        onClose();
    };

    const handleTicketTypeChange = (value: string) => {
        const ticketTypeId = value === 'none' ? null : Number.parseInt(value);
        
        // Update price if ticket type is selected
        const selectedTicket = ticketTypes.find(t => t.id === ticketTypeId);
        if (selectedTicket) {
            const price = Number(selectedTicket.price);
            setData(prev => ({
                ...prev,
                event_ticket_type_id: ticketTypeId,
                ticket_price: price,
                total_amount: price * prev.quantity,
            }));
        } else {
            setData(prev => ({ ...prev, event_ticket_type_id: ticketTypeId }));
        }
    };

    const handleQuantityChange = (value: string) => {
        const quantity = Number.parseInt(value) || 1;
        setData(prev => ({
            ...prev,
            quantity,
            total_amount: prev.ticket_price * quantity,
        }));
    };
    
    const handleDelete = async () => {
        if (!rsvp) return;
        
        if (!confirm(`Are you sure you want to delete the RSVP for "${rsvp.name}"? This action cannot be undone.`)) {
            return;
        }
        
        setProcessing(true);
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        try {
            const response = await fetch(`/api/admin/event-rsvps/${rsvp.id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                },
                credentials: 'include',
            });
            
            if (response.ok) {
                handleClose();
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                alert('Failed to delete RSVP');
            }
        } catch (error) {
            console.error('Error deleting RSVP:', error);
            alert('Failed to delete RSVP');
        } finally {
            setProcessing(false);
        }
    };

    if (!rsvp) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit RSVP</DialogTitle>
                    <DialogDescription>
                        Update registration details for this attendee
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Status */}
                    <div className="space-y-2">
                        <Label htmlFor="status">
                            Status <span className="text-red-500">*</span>
                        </Label>
                        <Select value={data.status} onValueChange={(value) => setData(prev => ({ ...prev, status: value }))}>
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && (
                            <p className="text-red-500 text-sm">{errors.status}</p>
                        )}
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                            required
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm">{errors.name}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">
                            Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
                            required
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm">{errors.email}</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            value={data.phone}
                            onChange={(e) => setData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-sm">{errors.phone}</p>
                        )}
                    </div>

                    {/* Ticket Type */}
                    {ticketTypes.length > 0 && (
                        <div className="space-y-2">
                            <Label htmlFor="ticket_type">Ticket Type</Label>
                            <Select 
                                value={data.event_ticket_type_id?.toString() || 'none'} 
                                onValueChange={handleTicketTypeChange}
                            >
                                <SelectTrigger id="ticket_type">
                                    <SelectValue placeholder="Select ticket type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No ticket type</SelectItem>
                                    {ticketTypes.map((ticket) => (
                                        <SelectItem key={ticket.id} value={ticket.id.toString()}>
                                            {ticket.name} - ${Number(ticket.price).toFixed(2)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.event_ticket_type_id && (
                                <p className="text-red-500 text-sm">{errors.event_ticket_type_id}</p>
                            )}
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="1"
                            value={data.quantity}
                            onChange={(e) => handleQuantityChange(e.target.value)}
                        />
                        {errors.quantity && (
                            <p className="text-red-500 text-sm">{errors.quantity}</p>
                        )}
                    </div>

                    {/* Guests */}
                    <div className="space-y-2">
                        <Label htmlFor="guests">Number of Guests</Label>
                        <Input
                            id="guests"
                            type="number"
                            min="0"
                            value={data.guests}
                            onChange={(e) => setData(prev => ({ ...prev, guests: Number.parseInt(e.target.value) || 0 }))}
                        />
                        {errors.guests && (
                            <p className="text-red-500 text-sm">{errors.guests}</p>
                        )}
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ticket_price">Ticket Price</Label>
                            <Input
                                id="ticket_price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.ticket_price}
                                onChange={(e) => {
                                    const price = Number.parseFloat(e.target.value) || 0;
                                    setData(prev => ({
                                        ...prev,
                                        ticket_price: price,
                                        total_amount: price * prev.quantity,
                                    }));
                                }}
                            />
                            {errors.ticket_price && (
                                <p className="text-red-500 text-sm">{errors.ticket_price}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="total_amount">Total Amount</Label>
                            <Input
                                id="total_amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.total_amount}
                                onChange={(e) => setData(prev => ({ ...prev, total_amount: Number.parseFloat(e.target.value) || 0 }))}
                            />
                            {errors.total_amount && (
                                <p className="text-red-500 text-sm">{errors.total_amount}</p>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData(prev => ({ ...prev, notes: e.target.value }))}
                            rows={3}
                            placeholder="Special requests, dietary restrictions, etc."
                        />
                        {errors.notes && (
                            <p className="text-red-500 text-sm">{errors.notes}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between pt-4">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={processing}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete RSVP
                        </Button>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
