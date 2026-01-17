import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Star, Calendar, User, Heart, Info, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Yahrzeit {
    id: number;
    name: string;
    hebrew_name: string | null;
    relationship: string;
    date_of_death: string | null;
    hebrew_day_of_death: number | null;
    hebrew_month_of_death: string | null;
    hebrew_year_of_death: number | null;
    observance_type: string | null;
    notes: string | null;
    next_occurrence: string | null;
    days_until: number | null;
}

interface Member {
    id: number;
    first_name: string;
    last_name: string;
}

interface Props {
    member: Member;
    yahrzeits: Yahrzeit[];
}

export default function YahrzeitsPage({ member, yahrzeits }: Props) {
    const [requestingChange, setRequestingChange] = useState<Yahrzeit | null>(null);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        yahrzeit_id: 0,
        message: '',
    });

    const openChangeDialog = (yahrzeit: Yahrzeit) => {
        setRequestingChange(yahrzeit);
        setData({
            yahrzeit_id: yahrzeit.id,
            message: '',
        });
    };

    const closeChangeDialog = () => {
        setRequestingChange(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!requestingChange) return;
        
        post('/member/yahrzeits/request-change', {
            onSuccess: () => {
                closeChangeDialog();
            },
        });
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatNextOccurrence = (dateString: string | null, daysUntil: number | null) => {
        if (!dateString || daysUntil === null) return null;
        
        const date = new Date(dateString);
        const formatted = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

        if (daysUntil === 0) {
            return { text: `Today (${formatted})`, badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' };
        } else if (daysUntil === 1) {
            return { text: `Tomorrow (${formatted})`, badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' };
        } else if (daysUntil <= 7) {
            return { text: `${formatted} (in ${daysUntil} days)`, badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' };
        } else if (daysUntil <= 30) {
            return { text: `${formatted} (in ${daysUntil} days)`, badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' };
        } else {
            return { text: `${formatted}`, badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' };
        }
    };

    const upcomingYahrzeits = yahrzeits.filter(y => y.days_until !== null && y.days_until >= 0 && y.days_until <= 60);
    const allOtherYahrzeits = yahrzeits.filter(y => y.days_until === null || y.days_until < 0 || y.days_until > 60);

    return (
        <AppLayout>
            <Head title="My Yahrzeits" />

            <div className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">My Yahrzeits</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Memorial observances for loved ones
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

                {yahrzeits.length === 0 ? (
                    <div className="bg-white dark:bg-black rounded-lg border p-8">
                        <div className="text-center">
                            <Star className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <h2 className="text-xl font-semibold mb-2">No Yahrzeits Found</h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                There are no yahrzeit observances associated with your account.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Upcoming Yahrzeits (Next 60 Days) */}
                        {upcomingYahrzeits.length > 0 && (
                            <div className="bg-white dark:bg-black rounded-lg border">
                                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 text-white">
                                    <h2 className="text-xl font-semibold flex items-center">
                                        <Calendar className="w-5 h-5 mr-2" />
                                        Upcoming Observances (Next 60 Days)
                                    </h2>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-4">
                                        {upcomingYahrzeits.map((yahrzeit) => {
                                            const occurrence = formatNextOccurrence(yahrzeit.next_occurrence, yahrzeit.days_until);
                                            
                                            return (
                                                <div
                                                    key={yahrzeit.id}
                                                    className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                                <h3 className="text-lg font-semibold">
                                                                    {yahrzeit.name}
                                                                </h3>
                                                            </div>
                                                            {yahrzeit.hebrew_name && (
                                                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 font-hebrew">
                                                                    {yahrzeit.hebrew_name}
                                                                </p>
                                                            )}
                                                            <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                                                                <div className="flex items-center">
                                                                    <Heart className="w-4 h-4 mr-1" />
                                                                    {yahrzeit.relationship}
                                                                </div>
                                                                {yahrzeit.date_of_death && (
                                                                    <div className="flex items-center">
                                                                        <Calendar className="w-4 h-4 mr-1" />
                                                                        {formatDate(yahrzeit.date_of_death)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {yahrzeit.hebrew_month_of_death && yahrzeit.hebrew_day_of_death && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                                                    Hebrew Date: {yahrzeit.hebrew_day_of_death} {yahrzeit.hebrew_month_of_death}
                                                                    {yahrzeit.hebrew_year_of_death && ` ${yahrzeit.hebrew_year_of_death}`}
                                                                </p>
                                                            )}
                                                            {yahrzeit.notes && (
                                                                <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-900 rounded text-sm">
                                                                    <div className="flex items-start">
                                                                        <Info className="w-4 h-4 mr-2 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                                                        <span className="text-gray-700 dark:text-gray-300">{yahrzeit.notes}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="mt-3">
                                                                <Button
                                                                    onClick={() => openChangeDialog(yahrzeit)}
                                                                    variant="outline"
                                                                    size="sm"
                                                                >
                                                                    <MessageSquare className="w-4 h-4 mr-2" />
                                                                    Request Change
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        {occurrence && (
                                                            <div className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${occurrence.badge}`}>
                                                                {occurrence.text}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* All Other Yahrzeits */}
                        {allOtherYahrzeits.length > 0 && (
                            <div className="bg-white dark:bg-black rounded-lg border">
                                <div className="p-4 border-b">
                                    <h2 className="text-xl font-semibold flex items-center">
                                        <Star className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                                        All Yahrzeits
                                    </h2>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-4">
                                        {allOtherYahrzeits.map((yahrzeit) => (
                                            <div
                                                key={yahrzeit.id}
                                                className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                            <h3 className="text-lg font-semibold">
                                                                {yahrzeit.name}
                                                            </h3>
                                                        </div>
                                                        {yahrzeit.hebrew_name && (
                                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 font-hebrew">
                                                                {yahrzeit.hebrew_name}
                                                            </p>
                                                        )}
                                                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                                                            <div className="flex items-center">
                                                                <Heart className="w-4 h-4 mr-1" />
                                                                {yahrzeit.relationship}
                                                            </div>
                                                            {yahrzeit.date_of_death && (
                                                                <div className="flex items-center">
                                                                    <Calendar className="w-4 h-4 mr-1" />
                                                                    {formatDate(yahrzeit.date_of_death)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {yahrzeit.hebrew_month_of_death && yahrzeit.hebrew_day_of_death && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                                                Hebrew Date: {yahrzeit.hebrew_day_of_death} {yahrzeit.hebrew_month_of_death}
                                                                {yahrzeit.hebrew_year_of_death && ` ${yahrzeit.hebrew_year_of_death}`}
                                                            </p>
                                                        )}
                                                        {yahrzeit.next_occurrence && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                                Next observance: {formatDate(yahrzeit.next_occurrence)}
                                                            </p>
                                                        )}
                                                        {yahrzeit.notes && (
                                                            <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-900 rounded text-sm">
                                                                <div className="flex items-start">
                                                                    <Info className="w-4 h-4 mr-2 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                                                    <span className="text-gray-700 dark:text-gray-300">{yahrzeit.notes}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="mt-3">
                                                            <Button
                                                                onClick={() => openChangeDialog(yahrzeit)}
                                                                variant="outline"
                                                                size="sm"
                                                            >
                                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                                Request Change
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Request Change Dialog */}
                <Dialog open={requestingChange !== null} onOpenChange={(open) => !open && closeChangeDialog()}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>
                                Request Yahrzeit Change
                            </DialogTitle>
                        </DialogHeader>
                        
                        {requestingChange && (
                            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {requestingChange.name}
                                    {requestingChange.hebrew_name && ` (${requestingChange.hebrew_name})`}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {requestingChange.relationship}
                                    {requestingChange.date_of_death && ` • ${formatDate(requestingChange.date_of_death)}`}
                                </p>
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="message">Change Request *</Label>
                                <Textarea
                                    id="message"
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder="Please describe the change you would like to make to this yahrzeit record..."
                                    rows={6}
                                    className={errors.message ? 'border-red-500' : ''}
                                />
                                {errors.message && (
                                    <p className="text-sm text-red-500 mt-1">{errors.message}</p>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Your request will be sent to the administrator for review.
                                </p>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeChangeDialog}
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing ? 'Submitting...' : 'Submit Request'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
