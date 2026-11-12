import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Building2 } from 'lucide-react';

interface Props {
    /** Page heading shown under the congregation name; without it the name itself is the heading. */
    title?: string;
}

/**
 * The congregation's name from Settings, with a prompt for admins to fill it in
 * while it's still blank or on the product default.
 */
export function CongregationHeader({ title }: Props) {
    const { t } = useTranslation();
    const { organization, auth } = usePage<SharedData>().props;
    const showSetup = organization.needs_setup && auth.user?.is_admin;

    return (
        <div className="space-y-3">
            {title ? (
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{organization.name}</p>
                    <h1 className="text-2xl font-bold">{title}</h1>
                </div>
            ) : (
                <h1 className="text-2xl font-bold">{organization.name}</h1>
            )}

            {showSetup && (
                <div className="flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 sm:flex-row sm:items-center dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
                    <Building2 className="hidden h-5 w-5 shrink-0 sm:block" aria-hidden />
                    <div className="flex-1 text-sm">
                        <p className="font-semibold">{t("Set your congregation's name")}</p>
                        <p className="text-amber-800 dark:text-amber-200/80">
                            {t('It appears on yahrzeit letters, invoices, emails and printouts, which currently say “:name”.', { name: organization.name })}
                        </p>
                    </div>
                    <Button asChild size="sm" variant="outline" className="shrink-0 border-amber-400 bg-transparent hover:bg-amber-100 dark:border-amber-600 dark:hover:bg-amber-900/40">
                        <Link href="/admin/settings#site_name">{t('Set name')}</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
