import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: '/admin/settings',
    },
    {
        title: 'Chart of Accounts',
        href: '/admin/chart-of-accounts',
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
    accounts: ChartOfAccount[];
}

const accountTypeColors = {
    asset: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    liability: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    equity: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    revenue: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    expense: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
};

export default function ChartOfAccountsIndex({ accounts }: Readonly<Props>) {
    const handleDelete = (account: ChartOfAccount) => {
        if (confirm(`Are you sure you want to delete GL Account ${account.account_code} - ${account.account_name}?`)) {
            router.delete(`/admin/chart-of-accounts/${account.id}`);
        }
    };

    const groupedAccounts = accounts.reduce((acc, account) => {
        if (!acc[account.account_type]) {
            acc[account.account_type] = [];
        }
        acc[account.account_type].push(account);
        return acc;
    }, {} as Record<string, ChartOfAccount[]>);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Chart of Accounts" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Chart of Accounts</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage GL account codes for financial reporting and exports
                        </p>
                    </div>
                    <Link href="/admin/chart-of-accounts/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New GL Account
                        </Button>
                    </Link>
                </div>

                {/* Account Type Sections */}
                {(['revenue', 'asset', 'expense', 'liability', 'equity'] as const).map((type) => {
                    const typeAccounts = groupedAccounts[type] || [];
                    if (typeAccounts.length === 0) return null;

                    return (
                        <Card key={type}>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    <CardTitle className="capitalize">{type} Accounts</CardTitle>
                                </div>
                                <CardDescription>
                                    {typeAccounts.length} account{typeAccounts.length === 1 ? '' : 's'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4 font-semibold">Code</th>
                                                <th className="text-left py-3 px-4 font-semibold">Name</th>
                                                <th className="text-left py-3 px-4 font-semibold">Description</th>
                                                <th className="text-left py-3 px-4 font-semibold">Type</th>
                                                <th className="text-left py-3 px-4 font-semibold">Status</th>
                                                <th className="text-right py-3 px-4 font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {typeAccounts.map((account) => (
                                                <tr
                                                    key={account.id}
                                                    className="border-b hover:bg-muted/50"
                                                >
                                                    <td className="py-3 px-4 font-mono font-semibold">
                                                        {account.account_code}
                                                    </td>
                                                    <td className="py-3 px-4">{account.account_name}</td>
                                                    <td className="py-3 px-4 text-sm text-muted-foreground">
                                                        {account.description || '—'}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Badge
                                                            className={accountTypeColors[account.account_type as keyof typeof accountTypeColors]}
                                                        >
                                                            {account.account_type}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {account.is_active ? (
                                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                                                Active
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300">
                                                                Inactive
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex justify-end gap-2">
                                                            <Link href={`/admin/chart-of-accounts/${account.id}/edit`}>
                                                                <Button variant="ghost" size="icon">
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDelete(account)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-600" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {accounts.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No GL Accounts</h3>
                            <p className="text-muted-foreground mb-4">
                                Get started by creating your first GL account or run the seeder to populate default accounts.
                            </p>
                            <Link href="/admin/chart-of-accounts/create">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create GL Account
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
