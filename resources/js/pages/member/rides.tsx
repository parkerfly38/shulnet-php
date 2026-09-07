import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Car, Clock, MapPin, Users } from 'lucide-react';

interface RideRequest {
    id: number;
    service_at: string;
    pickup_location: string;
    passenger_count: number;
    notes: string | null;
    requester_name: string;
    is_mine: boolean;
    is_claimed_by_me: boolean;
    driver_name: string | null;
    contact: { email: string; phone: string | null } | null;
}

export default function RidesPage({ rideRequests }: { rideRequests: RideRequest[] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        service_at: '',
        pickup_location: '',
        passenger_count: 1,
        notes: '',
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post('/member/rides', { onSuccess: () => reset() });
    };

    const formatServiceTime = (serviceAt: string) => new Date(serviceAt).toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
    });

    return (
        <AppLayout>
            <Head title="Ride Sharing" />
            <div className="p-4 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Ride Sharing</h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">Request transportation to a service or volunteer to drive a fellow member.</p>
                </div>

                <form onSubmit={submit} className="border rounded-lg bg-white p-4 dark:bg-black">
                    <h2 className="flex items-center gap-2 text-lg font-semibold"><Car className="h-5 w-5" /> Need a ride?</h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <label className="text-sm font-medium">Service date and time
                            <input type="datetime-local" value={data.service_at} onChange={(event) => setData('service_at', event.target.value)} className="mt-1 w-full rounded-md border bg-transparent p-2" required />
                            {errors.service_at && <p className="mt-1 text-sm text-red-600">{errors.service_at}</p>}
                        </label>
                        <label className="text-sm font-medium">Pickup area or address
                            <input value={data.pickup_location} onChange={(event) => setData('pickup_location', event.target.value)} className="mt-1 w-full rounded-md border bg-transparent p-2" maxLength={255} required />
                            {errors.pickup_location && <p className="mt-1 text-sm text-red-600">{errors.pickup_location}</p>}
                        </label>
                        <label className="text-sm font-medium">Passengers
                            <input type="number" min="1" max="8" value={data.passenger_count} onChange={(event) => setData('passenger_count', Number(event.target.value))} className="mt-1 w-full rounded-md border bg-transparent p-2" required />
                        </label>
                        <label className="text-sm font-medium">Notes (optional)
                            <input value={data.notes} onChange={(event) => setData('notes', event.target.value)} className="mt-1 w-full rounded-md border bg-transparent p-2" maxLength={1000} />
                        </label>
                    </div>
                    <button type="submit" disabled={processing} className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">Post ride request</button>
                </form>

                <section className="border rounded-lg bg-white dark:bg-black">
                    <div className="border-b p-4"><h2 className="text-lg font-semibold">Upcoming Requests</h2></div>
                    {rideRequests.length === 0 ? <p className="p-8 text-center text-gray-500 dark:text-gray-400">There are no upcoming ride requests.</p> : (
                        <div className="divide-y">
                            {rideRequests.map((rideRequest) => (
                                <article key={rideRequest.id} className="p-4">
                                    <div className="flex flex-col justify-between gap-4 sm:flex-row">
                                        <div>
                                            <h3 className="font-semibold">Ride needed by {rideRequest.requester_name}</h3>
                                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{formatServiceTime(rideRequest.service_at)}</span>
                                                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{rideRequest.pickup_location}</span>
                                                <span className="flex items-center gap-1"><Users className="h-4 w-4" />{rideRequest.passenger_count} passenger{rideRequest.passenger_count === 1 ? '' : 's'}</span>
                                            </div>
                                            {rideRequest.notes && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{rideRequest.notes}</p>}
                                            {rideRequest.driver_name && <p className="mt-2 text-sm font-medium text-green-700 dark:text-green-400">Driver: {rideRequest.driver_name}</p>}
                                            {rideRequest.contact && <p className="mt-2 text-sm">Contact {rideRequest.contact.email}{rideRequest.contact.phone ? ` | ${rideRequest.contact.phone}` : ''}</p>}
                                        </div>
                                        {!rideRequest.is_mine && !rideRequest.driver_name && <button onClick={() => post(`/member/rides/${rideRequest.id}/claim`)} disabled={processing} className="h-10 shrink-0 rounded-md bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">Volunteer to drive</button>}
                                        {rideRequest.is_mine && <span className="text-sm font-medium text-gray-500">Your request</span>}
                                        {rideRequest.is_claimed_by_me && <span className="text-sm font-medium text-green-700 dark:text-green-400">You are driving</span>}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}