import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useState } from 'react';
import EventRegistrationDialog from '@/components/event-registration-dialog';

interface Event {
    id: number;
    name: string;
    tagline: string | null;
    event_start: string;
    event_end: string | null;
    location: string | null;
    all_day: boolean;
    registration_starts?: string | null;
    registration_ends?: string | null;
    maxrsvp?: number | null;
    members_only?: boolean;
    allow_guests: boolean;
    max_guests: number | null;    ticket_types: TicketType[];
    has_paid_tickets: boolean;
}

interface TicketType {
    id: number;
    name: string;
    description: string | null;
    price: number;
    quantity_available: number | null;
    remaining_quantity: number | null;}

interface RSVP {
    id: number;
    status: string;
    guests: number;
    notes: string | null;
    created_at: string;
    event: Event;
}

interface Props {
    upcomingRsvps: RSVP[];
    pastRsvps: RSVP[];
    availableEvents: Event[];
}

export default function EventsPage({ upcomingRsvps, pastRsvps, availableEvents }: Props) {
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleRegisterClick = (event: Event) => {
        setSelectedEvent(event);
        setIsDialogOpen(true);
    };

    const formatDateTime = (dateTime: string, allDay: boolean) => {
        const date = new Date(dateTime);
        if (allDay) {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });
        }
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    };

    return (
        <AppLayout>
            <Head title="My Events" />

            <div className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">My Events</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            View your RSVPs and upcoming events
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

                {/* Upcoming RSVPs */}
                <div className="bg-white dark:bg-black rounded-lg border">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-semibold flex items-center">
                            <Calendar className="w-5 h-5 mr-2" />
                            My Upcoming Events
                        </h2>
                    </div>
                    <div className="p-4">
                        {upcomingRsvps.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                You have no upcoming event RSVPs
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {upcomingRsvps.map((rsvp) => (
                                    <div 
                                        key={rsvp.id} 
                                        className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold">{rsvp.event.name}</h3>
                                                {rsvp.event.tagline && (
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                                        {rsvp.event.tagline}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center">
                                                        <Clock className="w-4 h-4 mr-1" />
                                                        {formatDateTime(rsvp.event.event_start, rsvp.event.all_day)}
                                                    </div>
                                                    {rsvp.event.location && (
                                                        <div className="flex items-center">
                                                            <MapPin className="w-4 h-4 mr-1" />
                                                            {rsvp.event.location}
                                                        </div>
                                                    )}
                                                    {rsvp.guests > 0 && (
                                                        <div className="flex items-center">
                                                            <Users className="w-4 h-4 mr-1" />
                                                            {rsvp.guests} guest{rsvp.guests !== 1 ? 's' : ''}
                                                        </div>
                                                    )}
                                                </div>
                                                {rsvp.notes && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                                                        Note: {rsvp.notes}
                                                    </p>
                                                )}
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(rsvp.status)}`}>
                                                {rsvp.status.charAt(0).toUpperCase() + rsvp.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Available Events to Register */}
                <div className="bg-white dark:bg-black rounded-lg border">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-semibold flex items-center">
                            <Calendar className="w-5 h-5 mr-2" />
                            Available Events
                        </h2>
                    </div>
                    <div className="p-4">
                        {availableEvents.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                No events available for registration at this time
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {availableEvents.map((event) => (
                                    <div 
                                        key={event.id} 
                                        className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold">{event.name}</h3>
                                                {event.tagline && (
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                                        {event.tagline}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center">
                                                        <Clock className="w-4 h-4 mr-1" />
                                                        {formatDateTime(event.event_start, event.all_day)}
                                                    </div>
                                                    {event.location && (
                                                        <div className="flex items-center">
                                                            <MapPin className="w-4 h-4 mr-1" />
                                                            {event.location}
                                                        </div>
                                                    )}
                                                    {event.allow_guests && (
                                                        <div className="flex items-center text-green-600 dark:text-green-400">
                                                            <Users className="w-4 h-4 mr-1" />
                                                            Guests allowed
                                                            {event.max_guests && ` (max ${event.max_guests})`}
                                                        </div>
                                                    )}
                                                </div>
                                                {event.registration_ends && (
                                                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                                                        Registration closes: {formatDateTime(event.registration_ends, false)}
                                                    </p>
                                                )}
                                            </div>
                                            <button 
                                                onClick={() => handleRegisterClick(event)}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                                            >
                                                Register
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Past RSVPs */}
                {pastRsvps.length > 0 && (
                    <div className="bg-white dark:bg-black rounded-lg border">
                        <div className="p-4 border-b">
                            <h2 className="text-xl font-semibold flex items-center">
                                <Calendar className="w-5 h-5 mr-2" />
                                Past Events
                            </h2>
                        </div>
                        <div className="p-4">
                            <div className="space-y-4">
                                {pastRsvps.map((rsvp) => (
                                    <div 
                                        key={rsvp.id} 
                                        className="border rounded-lg p-4 opacity-75"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold">{rsvp.event.name}</h3>
                                                {rsvp.event.tagline && (
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                                        {rsvp.event.tagline}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center">
                                                        <Clock className="w-4 h-4 mr-1" />
                                                        {formatDateTime(rsvp.event.event_start, rsvp.event.all_day)}
                                                    </div>
                                                    {rsvp.event.location && (
                                                        <div className="flex items-center">
                                                            <MapPin className="w-4 h-4 mr-1" />
                                                            {rsvp.event.location}
                                                        </div>
                                                    )}
                                                    {rsvp.guests > 0 && (
                                                        <div className="flex items-center">
                                                            <Users className="w-4 h-4 mr-1" />
                                                            {rsvp.guests} guest{rsvp.guests !== 1 ? 's' : ''}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(rsvp.status)}`}>
                                                {rsvp.status.charAt(0).toUpperCase() + rsvp.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <EventRegistrationDialog 
                event={selectedEvent}
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
            />
        </AppLayout>
    );
}
