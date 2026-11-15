import { useTranslation } from '@/hooks/use-translation';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { type FormField } from '@/components/form-builder';
import { ArrowLeft } from 'lucide-react';

interface Form {
    id: number;
    name: string;
    schema: FormField[];
}

interface Submission {
    id: number;
    data: Record<string, unknown> | null;
    ip_address: string | null;
    created_at: string;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: Array<{ url?: string | null; label: string; active: boolean }>;
}

interface Props {
    form: Form;
    submissions: Paginated<Submission>;
}

// "favorite_color" → "Favorite color", for answers to fields since removed from the form.
function humanize(key: string) {
    const words = key.replaceAll(/[_-]+/g, ' ').trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
}

export default function FormSubmissions({ form, submissions }: Readonly<Props>) {
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Forms', href: '/admin/forms' },
        { title: form.name, href: `/admin/forms/${form.id}` },
        { title: 'Submissions', href: `/admin/forms/${form.id}/submissions` },
    ];

    const schema = form.schema ?? [];
    const fieldIds = new Set(schema.map((f) => f.id));

    // The form's current fields first, then any older answers on this page whose field was later removed.
    const columns = [
        ...schema.map((f) => ({ id: f.id, label: f.label, type: f.type as string })),
        ...Array.from(new Set(submissions.data.flatMap((s) => Object.keys(s.data ?? {}))))
            .filter((key) => !fieldIds.has(key))
            .map((key) => ({ id: key, label: humanize(key), type: 'unknown' })),
    ];

    const formatValue = (value: unknown, type: string) => {
        if (value === null || value === undefined || value === '') return <span className="text-gray-400">—</span>;
        if (Array.isArray(value)) return value.join(', ');
        if (type === 'boolean' || typeof value === 'boolean') {
            return value === true || value === '1' || value === 1 || value === 'on' ? t('Yes') : t('No');
        }
        if (type === 'date' && typeof value === 'string') {
            const d = new Date(`${value}T00:00:00`);
            return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
        }
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${form.name} — ${t('Submissions')}`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{t('Submissions')}</h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            {form.name} · {t(':count total', { count: submissions.total })}
                        </p>
                    </div>
                    <Link href={`/admin/forms/${form.id}`}>
                        <Button variant="outline">
                            <ArrowLeft className="me-2 h-4 w-4" />
                            {t('Back to Form')}
                        </Button>
                    </Link>
                </div>

                {submissions.total === 0 ? (
                    <div className="rounded-lg border p-8 text-center text-gray-500">{t('This form has no submissions yet.')}</div>
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="whitespace-nowrap px-4 py-2 text-start font-medium">{t('Submitted')}</th>
                                        {columns.map((c) => (
                                            <th key={c.id} className="whitespace-nowrap px-4 py-2 text-start font-medium">
                                                {c.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.data.map((s) => (
                                        <tr key={s.id} className="border-t align-top">
                                            <td className="whitespace-nowrap px-4 py-2 text-gray-600 dark:text-gray-400">
                                                {new Date(s.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                            </td>
                                            {columns.map((c) => (
                                                <td key={c.id} className="max-w-xs whitespace-pre-wrap break-words px-4 py-2">
                                                    {formatValue(s.data?.[c.id], c.type)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>{t('Showing :from–:to of :total', { from: submissions.from ?? 0, to: submissions.to ?? 0, total: submissions.total })}</span>
                            {submissions.links.length > 3 && (
                                <div className="flex flex-wrap gap-1">
                                    {submissions.links.map((link) => (
                                        <Button
                                            key={`${link.label}-${link.url ?? ''}`}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
