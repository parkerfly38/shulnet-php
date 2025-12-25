import React, { useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';
import { type BreadcrumbItem, type Gravesite, type Member } from '@/types';

interface Props {
    gravesite: Gravesite;
    members: Member[];
}

export default function GravesitesEdit({ gravesite, members }: Readonly<Props>) {
    const { data, setData, put, processing, errors } = useForm({
        cemetery_name: gravesite.cemetery_name || '',
        section: gravesite.section || '',
        row: gravesite.row || '',
        plot_number: gravesite.plot_number,
        block: gravesite.block || '',
        status: gravesite.status,
        gravesite_type: gravesite.gravesite_type,
        size_length: gravesite.size_length?.toString() || '',
        size_width: gravesite.size_width?.toString() || '',
        member_id: gravesite.member_id?.toString() || '',
        purchase_date: gravesite.purchase_date || '',
        purchase_price: gravesite.purchase_price?.toString() || '',
        reserved_date: gravesite.reserved_date || '',
        reserved_by: gravesite.reserved_by || '',
        deceased_name: gravesite.deceased_name || '',
        deceased_hebrew_name: gravesite.deceased_hebrew_name || '',
        date_of_birth: gravesite.date_of_birth || '',
        date_of_death: gravesite.date_of_death || '',
        burial_date: gravesite.burial_date || '',
        notes: gravesite.notes || '',
        gps_coordinates: gravesite.gps_coordinates || '',
        perpetual_care: gravesite.perpetual_care,
        monument_inscription: gravesite.monument_inscription || '',
    });

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Gravesites', href: '/admin/gravesites' },
        { title: `Plot ${gravesite.plot_number}`, href: `/admin/gravesites/${gravesite.id}` },
        { title: 'Edit', href: `/admin/gravesites/${gravesite.id}/edit` },
    ], [gravesite.id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/gravesites/${gravesite.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Gravesite - Plot ${gravesite.plot_number}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Gravesite</h1>
                        <p className="text-gray-600 dark:text-gray-400">Plot {gravesite.plot_number}</p>
                    </div>
                    <Link href="/admin/gravesites">
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Gravesites
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Location Information</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="cemetery_name">Cemetery Name</Label>
                                <Input
                                    id="cemetery_name"
                                    value={data.cemetery_name}
                                    onChange={(e) => setData('cemetery_name', e.target.value)}
                                />
                                {errors.cemetery_name && <p className="text-sm text-red-600 mt-1">{errors.cemetery_name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="plot_number">Plot Number *</Label>
                                <Input
                                    id="plot_number"
                                    value={data.plot_number}
                                    onChange={(e) => setData('plot_number', e.target.value)}
                                    required
                                />
                                {errors.plot_number && <p className="text-sm text-red-600 mt-1">{errors.plot_number}</p>}
                            </div>

                            <div>
                                <Label htmlFor="section">Section</Label>
                                <Input
                                    id="section"
                                    value={data.section}
                                    onChange={(e) => setData('section', e.target.value)}
                                />
                                {errors.section && <p className="text-sm text-red-600 mt-1">{errors.section}</p>}
                            </div>

                            <div>
                                <Label htmlFor="row">Row</Label>
                                <Input
                                    id="row"
                                    value={data.row}
                                    onChange={(e) => setData('row', e.target.value)}
                                />
                                {errors.row && <p className="text-sm text-red-600 mt-1">{errors.row}</p>}
                            </div>

                            <div>
                                <Label htmlFor="block">Block</Label>
                                <Input
                                    id="block"
                                    value={data.block}
                                    onChange={(e) => setData('block', e.target.value)}
                                />
                                {errors.block && <p className="text-sm text-red-600 mt-1">{errors.block}</p>}
                            </div>

                            <div>
                                <Label htmlFor="gps_coordinates">GPS Coordinates</Label>
                                <Input
                                    id="gps_coordinates"
                                    placeholder="40.7128,-74.0060"
                                    value={data.gps_coordinates}
                                    onChange={(e) => setData('gps_coordinates', e.target.value)}
                                />
                                {errors.gps_coordinates && <p className="text-sm text-red-600 mt-1">{errors.gps_coordinates}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Site Details</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="status">Status *</Label>
                                <Select value={data.status} onValueChange={(value: any) => setData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="reserved">Reserved</SelectItem>
                                        <SelectItem value="occupied">Occupied</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <p className="text-sm text-red-600 mt-1">{errors.status}</p>}
                            </div>

                            <div>
                                <Label htmlFor="gravesite_type">Gravesite Type *</Label>
                                <Select value={data.gravesite_type} onValueChange={(value: any) => setData('gravesite_type', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="single">Single</SelectItem>
                                        <SelectItem value="double">Double</SelectItem>
                                        <SelectItem value="family">Family</SelectItem>
                                        <SelectItem value="cremation">Cremation</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.gravesite_type && <p className="text-sm text-red-600 mt-1">{errors.gravesite_type}</p>}
                            </div>

                            <div>
                                <Label htmlFor="size_length">Length (feet)</Label>
                                <Input
                                    id="size_length"
                                    type="number"
                                    step="0.01"
                                    value={data.size_length}
                                    onChange={(e) => setData('size_length', e.target.value)}
                                />
                                {errors.size_length && <p className="text-sm text-red-600 mt-1">{errors.size_length}</p>}
                            </div>

                            <div>
                                <Label htmlFor="size_width">Width (feet)</Label>
                                <Input
                                    id="size_width"
                                    type="number"
                                    step="0.01"
                                    value={data.size_width}
                                    onChange={(e) => setData('size_width', e.target.value)}
                                />
                                {errors.size_width && <p className="text-sm text-red-600 mt-1">{errors.size_width}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="perpetual_care"
                                        checked={data.perpetual_care}
                                        onCheckedChange={(checked) => setData('perpetual_care', checked as boolean)}
                                    />
                                    <Label htmlFor="perpetual_care">Perpetual Care</Label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Ownership Information</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="member_id">Owner (Member)</Label>
                                <Select value={data.member_id ?? ' '} onValueChange={(value) => setData('member_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value=" ">None</SelectItem>
                                        {members.map((member) => (
                                            <SelectItem key={member.id} value={member.id.toString()}>
                                                {member.first_name} {member.last_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.member_id && <p className="text-sm text-red-600 mt-1">{errors.member_id}</p>}
                            </div>

                            <div>
                                <Label htmlFor="purchase_date">Purchase Date</Label>
                                <Input
                                    id="purchase_date"
                                    type="date"
                                    value={data.purchase_date}
                                    onChange={(e) => setData('purchase_date', e.target.value)}
                                />
                                {errors.purchase_date && <p className="text-sm text-red-600 mt-1">{errors.purchase_date}</p>}
                            </div>

                            <div>
                                <Label htmlFor="purchase_price">Purchase Price</Label>
                                <Input
                                    id="purchase_price"
                                    type="number"
                                    step="0.01"
                                    value={data.purchase_price}
                                    onChange={(e) => setData('purchase_price', e.target.value)}
                                />
                                {errors.purchase_price && <p className="text-sm text-red-600 mt-1">{errors.purchase_price}</p>}
                            </div>

                            <div>
                                <Label htmlFor="reserved_date">Reserved Date</Label>
                                <Input
                                    id="reserved_date"
                                    type="date"
                                    value={data.reserved_date}
                                    onChange={(e) => setData('reserved_date', e.target.value)}
                                />
                                {errors.reserved_date && <p className="text-sm text-red-600 mt-1">{errors.reserved_date}</p>}
                            </div>

                            <div>
                                <Label htmlFor="reserved_by">Reserved By</Label>
                                <Input
                                    id="reserved_by"
                                    value={data.reserved_by}
                                    onChange={(e) => setData('reserved_by', e.target.value)}
                                />
                                {errors.reserved_by && <p className="text-sm text-red-600 mt-1">{errors.reserved_by}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Occupancy Information</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="deceased_name">Deceased Name</Label>
                                <Input
                                    id="deceased_name"
                                    value={data.deceased_name}
                                    onChange={(e) => setData('deceased_name', e.target.value)}
                                />
                                {errors.deceased_name && <p className="text-sm text-red-600 mt-1">{errors.deceased_name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="deceased_hebrew_name">Hebrew Name</Label>
                                <Input
                                    id="deceased_hebrew_name"
                                    value={data.deceased_hebrew_name}
                                    onChange={(e) => setData('deceased_hebrew_name', e.target.value)}
                                />
                                {errors.deceased_hebrew_name && <p className="text-sm text-red-600 mt-1">{errors.deceased_hebrew_name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="date_of_birth">Date of Birth</Label>
                                <Input
                                    id="date_of_birth"
                                    type="date"
                                    value={data.date_of_birth}
                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                />
                                {errors.date_of_birth && <p className="text-sm text-red-600 mt-1">{errors.date_of_birth}</p>}
                            </div>

                            <div>
                                <Label htmlFor="date_of_death">Date of Death</Label>
                                <Input
                                    id="date_of_death"
                                    type="date"
                                    value={data.date_of_death}
                                    onChange={(e) => setData('date_of_death', e.target.value)}
                                />
                                {errors.date_of_death && <p className="text-sm text-red-600 mt-1">{errors.date_of_death}</p>}
                            </div>

                            <div>
                                <Label htmlFor="burial_date">Burial Date</Label>
                                <Input
                                    id="burial_date"
                                    type="date"
                                    value={data.burial_date}
                                    onChange={(e) => setData('burial_date', e.target.value)}
                                />
                                {errors.burial_date && <p className="text-sm text-red-600 mt-1">{errors.burial_date}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="monument_inscription">Monument Inscription</Label>
                                <Textarea
                                    id="monument_inscription"
                                    value={data.monument_inscription}
                                    onChange={(e) => setData('monument_inscription', e.target.value)}
                                    rows={3}
                                />
                                {errors.monument_inscription && <p className="text-sm text-red-600 mt-1">{errors.monument_inscription}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Additional Notes</h2>
                        
                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={4}
                            />
                            {errors.notes && <p className="text-sm text-red-600 mt-1">{errors.notes}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Link href="/admin/gravesites">
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
