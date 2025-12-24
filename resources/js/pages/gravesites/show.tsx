import React, { useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, MapPin, Calendar, User, DollarSign, Trash2 } from 'lucide-react';
import { type Gravesite, type BreadcrumbItem } from '@/types';

interface Props {
    gravesite: Gravesite;
}

export default function GravesitesShow({ gravesite }: Readonly<Props>) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Gravesites', href: '/admin/gravesites' },
        { title: `Plot ${gravesite.plot_number}`, href: `/admin/gravesites/${gravesite.id}` },
    ], [gravesite.id]);

    const statusColors: Record<string, string> = {
        available: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        reserved: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        occupied: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete gravesite ${gravesite.plot_number}?`)) {
            router.delete(`/admin/gravesites/${gravesite.id}`, {
                onSuccess: () => router.visit('/admin/gravesites')
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Gravesite - Plot ${gravesite.plot_number}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Gravesite - Plot {gravesite.plot_number}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {gravesite.cemetery_name || 'Cemetery information'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/admin/gravesites/${gravesite.id}/edit`}>
                            <Button>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                        <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Location Information */}
                        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                <MapPin className="h-5 w-5 mr-2" />
                                Location Information
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {gravesite.cemetery_name && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Cemetery</dt>
                                        <dd className="text-sm text-gray-900 dark:text-gray-100">{gravesite.cemetery_name}</dd>
                                    </div>
                                )}
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Plot Number</dt>
                                    <dd className="text-sm text-gray-900 dark:text-gray-100">{gravesite.plot_number}</dd>
                                </div>

                                {gravesite.section && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Section</dt>
                                        <dd className="text-sm text-gray-900 dark:text-gray-100">{gravesite.section}</dd>
                                    </div>
                                )}

                                {gravesite.row && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Row</dt>
                                        <dd className="text-sm text-gray-900 dark:text-gray-100">{gravesite.row}</dd>
                                    </div>
                                )}

                                {gravesite.block && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Block</dt>
                                        <dd className="text-sm text-gray-900 dark:text-gray-100">{gravesite.block}</dd>
                                    </div>
                                )}

                                {gravesite.gps_coordinates && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">GPS Coordinates</dt>
                                        <dd className="text-sm text-gray-900 dark:text-gray-100">{gravesite.gps_coordinates}</dd>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Site Details */}
                        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                Site Details
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</dt>
                                    <dd className="text-sm text-gray-900 dark:text-gray-100 capitalize">{gravesite.gravesite_type}</dd>
                                </div>

                                {gravesite.size_length && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Length</dt>
                                        <dd className="text-sm text-gray-900 dark:text-gray-100">{gravesite.size_length} feet</dd>
                                    </div>
                                )}

                                {gravesite.size_width && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Width</dt>
                                        <dd className="text-sm text-gray-900 dark:text-gray-100">{gravesite.size_width} feet</dd>
                                    </div>
                                )}

                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Perpetual Care</dt>
                                    <dd className="text-sm text-gray-900 dark:text-gray-100">
                                        {gravesite.perpetual_care ? (
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Yes</Badge>
                                        ) : (
                                            <Badge variant="secondary">No</Badge>
                                        )}
                                    </dd>
                                </div>
                            </div>
                        </div>

                        {/* Ownership Information */}
                        {(gravesite.member || gravesite.purchase_date || gravesite.reserved_date) && (
                            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Ownership Information
                                </h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {gravesite.member && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Owner</dt>
                                            <dd className="text-sm text-gray-900 dark:text-gray-100">
                                                <Link 
                                                    href={`/admin/members/${gravesite.member.id}`}
                                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                                >
                                                    {gravesite.member.first_name} {gravesite.member.last_name}
                                                </Link>
                                            </dd>
                                        </div>
                                    )}

                                    {gravesite.purchase_date && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Purchase Date</dt>
                                            <dd className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {formatDate(gravesite.purchase_date)}
                                            </dd>
                                        </div>
                                    )}

                                    {gravesite.purchase_price && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Purchase Price</dt>
                                            <dd className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                                                <DollarSign className="h-4 w-4 mr-1" />
                                                {formatCurrency(gravesite.purchase_price)}
                                            </dd>
                                        </div>
                                    )}

                                    {gravesite.reserved_date && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Reserved Date</dt>
                                            <dd className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {formatDate(gravesite.reserved_date)}
                                            </dd>
                                        </div>
                                    )}

                                    {gravesite.reserved_by && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Reserved By</dt>
                                            <dd className="text-sm text-gray-900 dark:text-gray-100">{gravesite.reserved_by}</dd>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Occupancy Information */}
                        {gravesite.status === 'occupied' && (
                            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                    Occupancy Information
                                </h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {gravesite.deceased_name && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Deceased Name</dt>
                                            <dd className="text-sm text-gray-900 dark:text-gray-100">{gravesite.deceased_name}</dd>
                                        </div>
                                    )}

                                    {gravesite.deceased_hebrew_name && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Hebrew Name</dt>
                                            <dd className="text-sm text-gray-900 dark:text-gray-100">{gravesite.deceased_hebrew_name}</dd>
                                        </div>
                                    )}

                                    {gravesite.date_of_birth && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</dt>
                                            <dd className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {formatDate(gravesite.date_of_birth)}
                                            </dd>
                                        </div>
                                    )}

                                    {gravesite.date_of_death && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Death</dt>
                                            <dd className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {formatDate(gravesite.date_of_death)}
                                            </dd>
                                        </div>
                                    )}

                                    {gravesite.burial_date && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Burial Date</dt>
                                            <dd className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {formatDate(gravesite.burial_date)}
                                            </dd>
                                        </div>
                                    )}
                                </div>

                                {gravesite.monument_inscription && (
                                    <div className="mt-4">
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Monument Inscription</dt>
                                        <dd className="text-sm text-gray-900 dark:text-gray-100 mt-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-md whitespace-pre-wrap">
                                            {gravesite.monument_inscription}
                                        </dd>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Notes */}
                        {gravesite.notes && (
                            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                    Notes
                                </h2>
                                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                                    {gravesite.notes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                Status
                            </h3>
                            
                            <div className="space-y-3">
                                <div>
                                    <Badge className={statusColors[gravesite.status]}>
                                        {gravesite.status.charAt(0).toUpperCase() + gravesite.status.slice(1)}
                                    </Badge>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                                    <dd className="text-sm text-gray-900 dark:text-gray-100">
                                        {formatDate(gravesite.created_at)}
                                    </dd>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                                    <dd className="text-sm text-gray-900 dark:text-gray-100">
                                        {formatDate(gravesite.updated_at)}
                                    </dd>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                Quick Actions
                            </h3>
                            
                            <div className="space-y-2">
                                <Link href={`/admin/gravesites/${gravesite.id}/edit`} className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Gravesite
                                    </Button>
                                </Link>
                                
                                {gravesite.member && (
                                    <Link href={`/admin/members/${gravesite.member.id}`} className="block">
                                        <Button variant="outline" className="w-full justify-start">
                                            <User className="h-4 w-4 mr-2" />
                                            View Owner
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
