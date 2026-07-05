import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import membershipBilling from '@/routes/settings/membership-billing';

interface MembershipBillingSettings {
    billing_method: 'anniversary' | 'fixed_date';
    fixed_month: string;
    fixed_day: string;
    grace_period_days: string;
    auto_generate: boolean;
    invoice_due_days: string;
}

interface Props {
    settings: MembershipBillingSettings;
    months: Record<number, string>;
}

export default function MembershipBilling({ settings, months }: Props) {
    const [previewData, setPreviewData] = useState<any>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        billing_method: settings.billing_method,
        fixed_month: parseInt(settings.fixed_month),
        fixed_day: parseInt(settings.fixed_day),
        grace_period_days: parseInt(settings.grace_period_days),
        auto_generate: settings.auto_generate,
        invoice_due_days: parseInt(settings.invoice_due_days),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('settings.membership-billing.update'));
    };

    const handlePreview = async () => {
        setIsPreviewLoading(true);
        try {
            const response = await fetch(membershipBilling.preview.url());
            const data = await response.json();
            setPreviewData(data);
        } catch (error) {
            console.error('Error fetching preview:', error);
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const handleGenerate = () => {
        if (confirm('Are you sure you want to generate membership dues invoices now?')) {
            fetch(membershipBilling.generate.url(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            }).then(() => {
                globalThis.location.reload();
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Membership Billing Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Membership Billing Configuration</CardTitle>
                            <CardDescription>
                                Configure how and when membership dues are billed
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Billing Method */}
                                <div className="space-y-2">
                                    <Label htmlFor="billing_method">Billing Method</Label>
                                    <Select
                                        value={data.billing_method}
                                        onValueChange={(value) => setData('billing_method', value as 'anniversary' | 'fixed_date')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="anniversary">Anniversary Billing (Individual join dates)</SelectItem>
                                            <SelectItem value="fixed_date">Fixed Date Billing (All on same date)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground">
                                        {data.billing_method === 'anniversary' 
                                            ? 'Members will be billed on their membership anniversary date each year'
                                            : 'All members will be billed on the same date each year'}
                                    </p>
                                    {errors.billing_method && (
                                        <p className="text-sm text-destructive">{errors.billing_method}</p>
                                    )}
                                </div>

                                {/* Fixed Date Settings (only show when fixed_date is selected) */}
                                {data.billing_method === 'fixed_date' && (
                                    <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                                        <div className="space-y-2">
                                            <Label htmlFor="fixed_month">Billing Month</Label>
                                            <Select
                                                value={data.fixed_month.toString()}
                                                onValueChange={(value) => setData('fixed_month', parseInt(value))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(months).map(([num, name]) => (
                                                        <SelectItem key={num} value={num}>
                                                            {name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.fixed_month && (
                                                <p className="text-sm text-destructive">{errors.fixed_month}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="fixed_day">Billing Day</Label>
                                            <Select
                                                value={data.fixed_day.toString()}
                                                onValueChange={(value) => setData('fixed_day', parseInt(value))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                                        <SelectItem key={day} value={day.toString()}>
                                                            {day}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.fixed_day && (
                                                <p className="text-sm text-destructive">{errors.fixed_day}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Grace Period */}
                                <div className="space-y-2">
                                    <Label htmlFor="grace_period_days">Grace Period (Days)</Label>
                                    <Input
                                        id="grace_period_days"
                                        type="number"
                                        min="0"
                                        max="365"
                                        value={data.grace_period_days}
                                        onChange={(e) => setData('grace_period_days', parseInt(e.target.value))}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Number of days before/after billing date to check for renewals and avoid duplicates
                                    </p>
                                    {errors.grace_period_days && (
                                        <p className="text-sm text-destructive">{errors.grace_period_days}</p>
                                    )}
                                </div>

                                {/* Invoice Due Days */}
                                <div className="space-y-2">
                                    <Label htmlFor="invoice_due_days">Payment Due (Days)</Label>
                                    <Input
                                        id="invoice_due_days"
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={data.invoice_due_days}
                                        onChange={(e) => setData('invoice_due_days', parseInt(e.target.value))}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Number of days after invoice date when payment is due
                                    </p>
                                    {errors.invoice_due_days && (
                                        <p className="text-sm text-destructive">{errors.invoice_due_days}</p>
                                    )}
                                </div>

                                {/* Auto Generate */}
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="auto_generate"
                                        checked={data.auto_generate}
                                        onCheckedChange={(checked) => setData('auto_generate', checked as boolean)}
                                    />
                                    <div className="space-y-0.5">
                                        <Label htmlFor="auto_generate" className="font-normal cursor-pointer">
                                            Automatic Invoice Generation
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Automatically generate membership dues invoices via scheduled task
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button type="submit" disabled={processing}>
                                        Save Settings
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Preview and Manual Generation */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Manual Operations</CardTitle>
                            <CardDescription>
                                Preview and manually generate membership dues invoices
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4">
                                <Button variant="outline" onClick={handlePreview} disabled={isPreviewLoading}>
                                    {isPreviewLoading ? 'Loading...' : 'Preview Members Due'}
                                </Button>
                                <Button variant="default" onClick={handleGenerate}>
                                    Generate Invoices Now
                                </Button>
                            </div>

                            {previewData && (
                                <div className="mt-4 p-4 border rounded-lg">
                                    <h3 className="font-semibold mb-2">
                                        {previewData.count} members due for renewal on {previewData.date}
                                    </h3>
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {previewData.members.map((member: any) => (
                                            <div key={member.id} className="text-sm p-2 border rounded">
                                                <div className="font-medium">{member.name}</div>
                                                <div className="text-muted-foreground">{member.email}</div>
                                                {member.tiers.map((tier: any, idx: number) => (
                                                    <div key={idx} className="text-xs">
                                                        {tier.name} - ${tier.price}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
