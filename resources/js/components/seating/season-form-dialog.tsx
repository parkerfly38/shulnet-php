import { fromLocalInput, type GlAccount, type SeatingSeason, toLocalInput } from '@/components/seating/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';
import { useForm } from '@inertiajs/react';
import { type FormEvent, useEffect } from 'react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    season?: SeatingSeason | null;
    charts: { id: number; name: string }[];
    glAccounts: GlAccount[];
}

const NONE = 'none';

function initialData(season?: SeatingSeason | null) {
    return {
        seating_chart_id: season ? String(season.seating_chart_id) : '',
        name: season?.name ?? '',
        first_service_date: season?.first_service_date?.slice(0, 10) ?? '',
        member_sales_enabled: season?.member_sales_enabled ?? false,
        sale_starts_at: toLocalInput(season?.sale_starts_at ?? null),
        sale_ends_at: toLocalInput(season?.sale_ends_at ?? null),
        renewal_ends_at: toLocalInput(season?.renewal_ends_at ?? null),
        max_seats_per_member: season?.max_seats_per_member ? String(season.max_seats_per_member) : '',
        gl_account_id: season?.gl_account_id ? String(season.gl_account_id) : NONE,
        notes: season?.notes ?? '',
    };
}

export default function SeasonFormDialog({ open, onOpenChange, season, charts, glAccounts }: Props) {
    const { t } = useTranslation();
    const form = useForm(initialData(season));
    const { data, setData, errors, processing } = form;

    useEffect(() => {
        if (open) {
            form.setData(initialData(season));
            form.clearErrors();
        }
    }, [open, season]); // eslint-disable-line react-hooks/exhaustive-deps

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.transform((d) => ({
            ...d,
            first_service_date: d.first_service_date || null,
            sale_starts_at: fromLocalInput(d.sale_starts_at),
            sale_ends_at: fromLocalInput(d.sale_ends_at),
            renewal_ends_at: fromLocalInput(d.renewal_ends_at),
            max_seats_per_member: d.max_seats_per_member || null,
            gl_account_id: d.gl_account_id === NONE ? null : d.gl_account_id,
        }));

        const options = { preserveScroll: true, onSuccess: () => onOpenChange(false) };
        if (season) form.put(`/admin/seating-seasons/${season.id}`, options);
        else form.post('/admin/seating-seasons', options);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <form onSubmit={submit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>{season ? t('Edit Season') : t('New Seating Season')}</DialogTitle>
                        <DialogDescription>{t('A season sells the seats on one chart for a set of High Holy Days.')}</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1 sm:col-span-2">
                            <Label htmlFor="season-name">{t('Name')}</Label>
                            <Input id="season-name" value={data.name} placeholder={t('e.g., High Holy Days 5787')} onChange={(e) => setData('name', e.target.value)} required />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label>{t('Seating chart')}</Label>
                            <Select value={data.seating_chart_id} onValueChange={(v) => setData('seating_chart_id', v)}>
                                <SelectTrigger><SelectValue placeholder={t('Choose a chart')} /></SelectTrigger>
                                <SelectContent>
                                    {charts.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {errors.seating_chart_id && <p className="text-sm text-destructive">{errors.seating_chart_id}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="first-service">{t('First service (Erev Rosh Hashanah)')}</Label>
                            <Input id="first-service" type="date" value={data.first_service_date} onChange={(e) => setData('first_service_date', e.target.value)} />
                            <p className="text-xs text-muted-foreground">{t('Used as the invoice due date.')}</p>
                        </div>
                    </div>

                    <div className="space-y-3 rounded-lg border p-3">
                        <label className="flex items-center gap-2 text-sm font-medium">
                            <Checkbox checked={data.member_sales_enabled} onCheckedChange={(v) => setData('member_sales_enabled', v === true)} />
                            {t('Let members choose seats in the member portal')}
                        </label>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                                <Label htmlFor="renewal-ends">{t('Renewal deadline')}</Label>
                                <Input id="renewal-ends" type="datetime-local" value={data.renewal_ends_at} onChange={(e) => setData('renewal_ends_at', e.target.value)} />
                                <p className="text-xs text-muted-foreground">{t("Last year's holders keep their seats until this date.")}</p>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="max-seats">{t('Max seats per member')}</Label>
                                <Input id="max-seats" type="number" min={1} value={data.max_seats_per_member} placeholder={t('No limit')} onChange={(e) => setData('max_seats_per_member', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="sale-starts">{t('General sale opens')}</Label>
                                <Input id="sale-starts" type="datetime-local" value={data.sale_starts_at} onChange={(e) => setData('sale_starts_at', e.target.value)} />
                                <p className="text-xs text-muted-foreground">{t('Set after the renewal deadline to give renewals priority.')}</p>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="sale-ends">{t('Sale closes')}</Label>
                                <Input id="sale-ends" type="datetime-local" value={data.sale_ends_at} onChange={(e) => setData('sale_ends_at', e.target.value)} />
                                {errors.sale_ends_at && <p className="text-sm text-destructive">{errors.sale_ends_at}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>{t('Revenue GL account')}</Label>
                        <Select value={data.gl_account_id} onValueChange={(v) => setData('gl_account_id', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={NONE}>{t('None')}</SelectItem>
                                {glAccounts.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.account_code} - {a.account_name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="season-notes">{t('Notes')}</Label>
                        <Textarea id="season-notes" rows={2} value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('Cancel')}</Button>
                        <Button type="submit" disabled={processing}>{season ? t('Save') : t('Create Season')}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
