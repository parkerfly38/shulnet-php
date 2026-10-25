import FlashMessages from '@/components/seating/flash-messages';
import { formatDateTime, type SeatAssignment, type SeatingSeason } from '@/components/seating/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Armchair } from 'lucide-react';

interface Props {
    seasons: SeatingSeason[];
    myAssignments: SeatAssignment[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Dashboard', href: '/member/dashboard' },
    { title: 'High Holy Day Seats', href: '/member/seating' },
];

export default function MemberSeatingIndex({ seasons, myAssignments }: Readonly<Props>) {
    const { t } = useTranslation();
    const { currency } = usePage<SharedData>().props;

    const pendingRenewals = (seasonId: number) => myAssignments.filter((a) => a.seating_season_id === seasonId && a.status === 'renewal').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('High Holy Day Seats')} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('High Holy Day Seats')}</h1>
                    <p className="mt-1 text-muted-foreground">{t('Reserve your seats for Rosh Hashanah and Yom Kippur.')}</p>
                </div>

                <FlashMessages />

                {seasons.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                            <Armchair className="h-10 w-10 text-muted-foreground" />
                            <p className="text-muted-foreground">{t('Seat reservations are not open right now. Please check back closer to the holidays.')}</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {seasons.map((season) => {
                            const renewals = pendingRenewals(season.id);
                            return (
                                <Card key={season.id}>
                                    <CardHeader>
                                        <CardTitle>{season.name}</CardTitle>
                                        <CardDescription>
                                            {season.is_open_for_members
                                                ? season.sale_ends_at ? t('Open until :date', { date: formatDateTime(season.sale_ends_at) }) : t('Open now')
                                                : season.sale_starts_at ? t('General sale opens :date', { date: formatDateTime(season.sale_starts_at) }) : t('Renewals only')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-wrap items-center justify-between gap-2">
                                        {renewals > 0
                                            ? <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">{t(':count seats held for you', { count: renewals })}</Badge>
                                            : <span />}
                                        <Button asChild>
                                            <Link href={`/member/seating/${season.id}`}>{renewals > 0 ? t('Confirm My Seats') : t('Choose Seats')}</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {myAssignments.some((a) => a.status === 'reserved') && (
                    <Card className="gap-0 py-0">
                        <div className="border-b p-4"><h2 className="text-lg font-semibold">{t('My Seats')}</h2></div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50 text-left text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-2 font-medium">{t('Season')}</th>
                                        <th className="px-4 py-2 font-medium">{t('Seat')}</th>
                                        <th className="px-4 py-2 font-medium">{t('Section')}</th>
                                        <th className="px-4 py-2 text-right font-medium">{t('Price')}</th>
                                        <th className="px-4 py-2 font-medium">{t('Invoice')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myAssignments.filter((a) => a.status === 'reserved').map((a) => (
                                        <tr key={a.id} className="border-b last:border-0">
                                            <td className="px-4 py-2">
                                                <Link href={`/member/seating/${a.seating_season_id}`} className="text-primary hover:underline">{a.season?.name}</Link>
                                            </td>
                                            <td className="px-4 py-2 font-medium">{a.seat?.label}</td>
                                            <td className="px-4 py-2">{a.seat?.section?.name ?? '-'}</td>
                                            <td className="px-4 py-2 text-right tabular-nums">{formatCurrency(a.price, currency)}</td>
                                            <td className="px-4 py-2">
                                                {a.invoice ? (
                                                    <div className="flex items-center gap-2">
                                                        <Link href={`/member/invoices/${a.invoice.id}`} className="text-primary hover:underline">{a.invoice.invoice_number}</Link>
                                                        {a.invoice.status === 'paid'
                                                            ? <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">{t('Paid')}</Badge>
                                                            : <Link href={`/member/invoices/${a.invoice.id}/pay`} className="text-xs font-medium text-primary hover:underline">{t('Pay now')}</Link>}
                                                    </div>
                                                ) : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
