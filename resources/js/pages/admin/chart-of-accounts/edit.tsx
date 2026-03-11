import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: '/admin/settings',
    },
    {
        title: 'Chart of Accounts',
        href: '/admin/chart-of-accounts',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

interface ChartOfAccount {
    id: number;
    account_code: string;
    account_name: string;
    account_type: string;
    description: string | null;
    is_active: boolean;
    sort_order: number;
}

interface Props {
    account: ChartOfAccount;
}

export default function ChartOfAccountsEdit({ account }: Readonly<Props>) {
    const { data, setData, put, processing, errors } = useForm({
        account_code: account.account_code,
        account_name: account.account_name,
        account_type: account.account_type,
        description: account.description || '',
        is_active: account.is_active,
        sort_order: account.sort_order,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/chart-of-accounts/${account.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit GL Account ${account.account_code}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Edit GL Account: {account.account_code}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Update account details
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Account Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="account_code">Account Code *</Label>
                                    <Input
                                        id="account_code"
                                        value={data.account_code}
                                        onChange={(e) => setData('account_code', e.target.value)}
                                        placeholder="e.g., 4000"
                                        required
                                    />
                                    {errors.account_code && (
                                        <p className="text-sm text-red-600">{errors.account_code}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="account_name">Account Name *</Label>
                                    <Input
                                        id="account_name"
                                        value={data.account_name}
                                        onChange={(e) => setData('account_name', e.target.value)}
                                        placeholder="e.g., Membership Dues Revenue"
                                        required
                                    />
                                    {errors.account_name && (
                                        <p className="text-sm text-red-600">{errors.account_name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="account_type">Account Type *</Label>
                                    <Select
                                        value={data.account_type}
                                        onValueChange={(value) => setData('account_type', value)}
                                    >
                                        <SelectTrigger id="account_type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="revenue">Revenue</SelectItem>
                                            <SelectItem value="expense">Expense</SelectItem>
                                            <SelectItem value="asset">Asset</SelectItem>
                                            <SelectItem value="liability">Liability</SelectItem>
                                            <SelectItem value="equity">Equity</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.account_type && (
                                        <p className="text-sm text-red-600">{errors.account_type}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sort_order">Sort Order</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', Number.parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                    />
                                    {errors.sort_order && (
                                        <p className="text-sm text-red-600">{errors.sort_order}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Brief description of this account..."
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked === true)}
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">
                                    Active (account can be used for transactions)
                                </Label>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => globalThis.history.back()}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
