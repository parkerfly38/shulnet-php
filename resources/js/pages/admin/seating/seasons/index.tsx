import FlashMessages from '@/components/seating/flash-messages';
import SeasonFormDialog from '@/components/seating/season-form-dialog';
import { type GlAccount, type SeatingSeason } from '@/components/seating/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Armchair, LayoutGrid, Plus } from 'lucide-react';
import { useState } from 'react';

type SeasonRow = SeatingSeason & {
    chart: { id: number; name: string } | null;
    seat_count: number;
    reserved_count: number;
    renewal_count: number;
};

interface Props {
    seasons: SeasonRow[];
    charts: { id: number; name: string }[];
    glAccounts: GlAccount[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'High Holy Day Seating', href: '/admin/seating-seasons' },
];

export default function SeatingSeasonsIndex({ seasons, charts, glAccounts }: Readonly<Props>) {
    const { t } = useTranslation();
    const [creating, setCreating] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('High Holy Day Seating')} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t('High Holy Day Seating')}</h1>
                        <p className="mt-1 text-muted-foreground">{t('Assign and invoice seats for each season, or open the season for members to choose their own.')}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/seating-charts"><LayoutGrid className="mr-2 h-4 w-4" />{t('Seating Charts')}</Link>
                        </Button>
                        <Button onClick={() => setCreating(true)} disabled={charts.length === 0}>
                            <Plus className="mr-2 h-4 w-4" />{t('New Season')}
                        </Button>
                    </div>
                </div>

                <FlashMessages />

                {charts.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                            <LayoutGrid className="h-10 w-10 text-muted-foreground" />
                            <p className="text-muted-foreground">{t('Start by creating a seating chart from a floor plan of your sanctuary.')}</p>
                            <Button asChild><Link href="/admin/seating-charts">{t('Create a Seating Chart')}</Link></Button>
                        </CardContent>
                    </Card>
                )}

                {charts.length > 0 && seasons.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                            <Armchair className="h-10 w-10 text-muted-foreground" />
                            <p className="text-muted-foreground">{t('No seasons yet. Create one to start assigning seats.')}</p>
                            <Button onClick={() => setCreating(true)}><Plus className="mr-2 h-4 w-4" />{t('New Season')}</Button>
                        </CardContent>
                    </Card>
                )}

                {seasons.length > 0 && (
                    <Card className="py-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50 text-left text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">{t('Season')}</th>
                                        <th className="px-4 py-3 font-medium">{t('Chart')}</th>
                                        <th className="px-4 py-3 font-medium">{t('First service')}</th>
                                        <th className="px-4 py-3 font-medium">{t('Seats sold')}</th>
                                        <th className="px-4 py-3 font-medium">{t('Member sales')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {seasons.map((season) => (
                                        <tr key={season.id} className="border-b last:border-0 hover:bg-muted/30">
                                            <td className="px-4 py-3">
                                                <Link href={`/admin/seating-seasons/${season.id}`} className="font-medium text-primary hover:underline">{season.name}</Link>
                                            </td>
                                            <td className="px-4 py-3">{season.chart?.name}</td>
                                            <td className="px-4 py-3">{season.first_service_date ? new Date(season.first_service_date).toLocaleDateString(undefined, { timeZone: 'UTC' }) : '-'}</td>
                                            <td className="px-4 py-3 tabular-nums">
                                                {season.reserved_count} / {season.seat_count}
                                                {season.renewal_count > 0 && (
                                                    <span className="ml-2 text-xs text-amber-600">{t(':count renewals pending', { count: season.renewal_count })}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {season.is_open_for_members
                                                    ? <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">{t('Open')}</Badge>
                                                    : <Badge variant="secondary">{!season.member_sales_enabled
                                                        ? t('Admin only')
                                                        : season.sale_starts_at && new Date(season.sale_starts_at) > new Date() ? t('Scheduled') : t('Closed')}</Badge>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>

            <SeasonFormDialog open={creating} onOpenChange={setCreating} charts={charts} glAccounts={glAccounts} />
        </AppLayout>
    );
}
