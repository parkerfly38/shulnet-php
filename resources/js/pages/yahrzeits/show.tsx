import { router, Head } from '@inertiajs/react';
import { Calendar, Star, Edit, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type BreadcrumbItem } from '@/types';
import { useMemo } from 'react';

interface Member {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    hebrew_name?: string;
}

interface Yahrzeit {
    id: number;
    member: Member;
    name: string;
    hebrew_name?: string;
    relationship: string;
    date_of_death: string;
    hebrew_day_of_death: number;
    hebrew_month_of_death: number;
    observance_type: 'standard' | 'kaddish' | 'memorial_candle' | 'other';
    notes?: string;
    created_at: string;
    updated_at: string;
}

interface YahrzeitShowProps {
    yahrzeit: Yahrzeit;
}

const HEBREW_MONTHS = [
    '', // 0 index placeholder
    'Tishrei', 'Cheshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar',
    'Nissan', 'Iyar', 'Sivan', 'Tammuz', 'Av', 'Elul'
];

const OBSERVANCE_COLORS = {
    standard: 'bg-blue-100 text-blue-800',
    kaddish: 'bg-purple-100 text-purple-800',
    memorial_candle: 'bg-yellow-100 text-yellow-800',
    other: 'bg-gray-100 text-gray-800'
} as const;

const OBSERVANCE_LABELS = {
    standard: 'Standard Yahrzeit',
    kaddish: 'Kaddish Observance',
    memorial_candle: 'Memorial Candle',
    other: 'Other Observance'
} as const;

export default function YahrzeitShow({ yahrzeit }: YahrzeitShowProps) {
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete the yahrzeit record for ${yahrzeit.name}? This action cannot be undone.`)) {
            router.delete(`/admin/yahrzeits/${yahrzeit.id}`, {
                onSuccess: () => {
                    router.get('/admin/yahrzeits');
                }
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatHebrewDate = (day: number, month: number) => {
        const monthName = HEBREW_MONTHS[month] || 'Unknown';
        return `${day} ${monthName}`;
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Yahrzeits',
            href: '/admin/yahrzeits',
        },
        {
            title: yahrzeit.name,
            href: `/admin/yahrzeits/${yahrzeit.id}`,
        },
    ], [yahrzeit.name, yahrzeit.id]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Yahrzeit - ${yahrzeit.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
         {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Yahrzeit Record</h1>
                            <p className="text-gray-600 dark:text-gray-400">Memorial observance details</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.get(`/admin/yahrzeits/${yahrzeit.id}/edit`)}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                        <Button 
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Deceased Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                Deceased Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Name</label>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{yahrzeit.name}</p>
                            </div>

                            {yahrzeit.hebrew_name && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Hebrew Name</label>
                                    <p className="text-lg text-gray-900 dark:text-gray-100">{yahrzeit.hebrew_name}</p>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Relationship</label>
                                <div className="mt-1">
                                    <Badge variant="secondary" className="text-sm">
                                        {yahrzeit.relationship}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    
                </div>

                {/* Date and Observance Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Date and Observance Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Gregorian Date of Death</label>
                                    <p className="text-lg text-gray-900 dark:text-gray-100 mt-1">{formatDate(yahrzeit.date_of_death)}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Hebrew Date of Death</label>
                                    <p className="text-lg text-gray-900 dark:text-gray-100 mt-1">
                                        {formatHebrewDate(yahrzeit.hebrew_day_of_death, yahrzeit.hebrew_month_of_death)}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Observance Type</label>
                                    <div className="mt-1">
                                        <Badge className={OBSERVANCE_COLORS[yahrzeit.observance_type]}>
                                            {OBSERVANCE_LABELS[yahrzeit.observance_type]}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {yahrzeit.notes && (
                            <>
                                <Separator className="my-6" />
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Notes</label>
                                    <p className="text-gray-900 dark:text-gray-100 mt-2 whitespace-pre-line">{yahrzeit.notes}</p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Record Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Record Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Created</label>
                                <p className="text-gray-900 dark:text-gray-100 mt-1">{formatDateTime(yahrzeit.created_at)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Last Updated</label>
                                <p className="text-gray-900 dark:text-gray-100 mt-1">{formatDateTime(yahrzeit.updated_at)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}