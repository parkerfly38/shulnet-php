import FlashMessages from '@/components/seating/flash-messages';
import { type SeatingChart } from '@/components/seating/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Armchair, CalendarRange, LayoutGrid, Pencil, Plus, Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';

interface Props {
    charts: SeatingChart[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'High Holy Day Seating', href: '/admin/seating-seasons' },
    { title: 'Seating Charts', href: '/admin/seating-charts' },
];

export default function SeatingChartsIndex({ charts }: Readonly<Props>) {
    const { t } = useTranslation();
    const [creating, setCreating] = useState(false);
    const { data, setData, post, processing, errors, reset, progress } = useForm<{ name: string; description: string; image: File | null }>({
        name: '',
        description: '',
        image: null,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/seating-charts', { forceFormData: true, onSuccess: () => reset() });
    };

    const destroy = (chart: SeatingChart) => {
        if (confirm(t('Delete the seating chart ":name" and all of its seats?', { name: chart.name }))) {
            router.delete(`/admin/seating-charts/${chart.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Seating Charts')} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t('Seating Charts')}</h1>
                        <p className="mt-1 text-muted-foreground">{t('Floor plans of your sanctuary with the seats placed on them. Charts are reused from year to year.')}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/seating-seasons"><CalendarRange className="mr-2 h-4 w-4" />{t('Seasons')}</Link>
                        </Button>
                        <Button onClick={() => setCreating(true)}><Plus className="mr-2 h-4 w-4" />{t('New Chart')}</Button>
                    </div>
                </div>

                <FlashMessages />

                {charts.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                            <LayoutGrid className="h-10 w-10 text-muted-foreground" />
                            <p className="text-muted-foreground">{t('Upload a floor plan of your sanctuary to start placing seats.')}</p>
                            <Button onClick={() => setCreating(true)}><Plus className="mr-2 h-4 w-4" />{t('New Chart')}</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {charts.map((chart) => (
                            <Card key={chart.id} className="overflow-hidden pt-0">
                                <Link href={`/admin/seating-charts/${chart.id}/edit`} className="block aspect-[16/10] bg-muted">
                                    {chart.image_url ? (
                                        <img src={chart.image_url} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-muted-foreground"><LayoutGrid className="h-10 w-10" /></div>
                                    )}
                                </Link>
                                <CardHeader>
                                    <CardTitle>{chart.name}</CardTitle>
                                    {chart.description && <CardDescription>{chart.description}</CardDescription>}
                                </CardHeader>
                                <CardContent className="flex items-center justify-between">
                                    <div className="flex gap-4 text-sm text-muted-foreground">
                                        <span className="inline-flex items-center gap-1"><Armchair className="h-4 w-4" />{t(':count seats', { count: chart.seats_count ?? 0 })}</span>
                                        <span className="inline-flex items-center gap-1"><CalendarRange className="h-4 w-4" />{t(':count seasons', { count: chart.seasons_count ?? 0 })}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" asChild>
                                            <Link href={`/admin/seating-charts/${chart.id}/edit`} aria-label={t('Edit')}><Pencil className="h-4 w-4" /></Link>
                                        </Button>
                                        <Button size="icon" variant="ghost" aria-label={t('Delete')} disabled={(chart.seasons_count ?? 0) > 0} onClick={() => destroy(chart)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={creating} onOpenChange={setCreating}>
                <DialogContent>
                    <form onSubmit={submit} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>{t('New Seating Chart')}</DialogTitle>
                            <DialogDescription>{t('Upload a floor plan image (PNG, JPG or WebP, up to 10 MB). You will place seats on it next.')}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-1">
                            <Label htmlFor="name">{t('Name')}</Label>
                            <Input id="name" value={data.name} placeholder={t('e.g., Main Sanctuary')} onChange={(e) => setData('name', e.target.value)} required />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="description">{t('Description')}</Label>
                            <Textarea id="description" rows={2} value={data.description} onChange={(e) => setData('description', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="image">{t('Floor plan image')}</Label>
                            <Input id="image" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => setData('image', e.target.files?.[0] ?? null)} />
                            {errors.image && <p className="text-sm text-destructive">{errors.image}</p>}
                            {progress && <p className="text-xs text-muted-foreground">{t('Uploading...')} {progress.percentage}%</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCreating(false)}>{t('Cancel')}</Button>
                            <Button type="submit" disabled={processing}>{t('Create & Place Seats')}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
