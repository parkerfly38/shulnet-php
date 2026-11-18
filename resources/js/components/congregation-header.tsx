import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { type PaymentSetup, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Building2, CreditCard, type LucideIcon } from 'lucide-react';

interface Props {
    /** Page heading shown under the congregation name; without it the name itself is the heading. */
    title?: string;
}

interface SetupNoticeProps {
    icon: LucideIcon;
    title: string;
    message: string;
    action: string;
    href: string;
}

function SetupNotice({ icon: Icon, title, message, action, href }: Readonly<SetupNoticeProps>) {
    return (
        <div className="flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 sm:flex-row sm:items-center dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
            <Icon className="hidden h-5 w-5 shrink-0 sm:block" aria-hidden />
            <div className="flex-1 text-sm">
                <p className="font-semibold">{title}</p>
                <p className="text-amber-800 dark:text-amber-200/80">{message}</p>
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0 border-amber-400 bg-transparent hover:bg-amber-100 dark:border-amber-600 dark:hover:bg-amber-900/40">
                <Link href={href}>{action}</Link>
            </Button>
        </div>
    );
}

type Translate = ReturnType<typeof useTranslation>['t'];

function paymentSetupMessage(payments: PaymentSetup, t: Translate): string {
    const values = { processor: payments.label, keys: payments.missing.join(', ') };

    if (payments.source === 'none') {
        return t('Online payments are off, so members can only pay by check or at the office. Choose a payment processor in Settings to let them pay invoices online.');
    }
    if (payments.source === 'env') {
        return t("Members can't pay invoices online until :processor is connected. Add :keys to the server's .env file, or choose a different processor.", values);
    }
    return t("Members can't pay invoices online until :processor is connected. Enter your :keys in Settings.", values);
}

/**
 * The congregation's name from Settings, with prompts for admins to finish setup: the name while it's
 * still blank or on the product default, and online payments while the chosen processor has no keys.
 */
export function CongregationHeader({ title }: Readonly<Props>) {
    const { t } = useTranslation();
    const { organization, payments, auth } = usePage<SharedData>().props;
    const isAdmin = Boolean(auth.user?.is_admin);
    const showNameSetup = organization.needs_setup && isAdmin;
    const showPaymentSetup = isAdmin && payments && !payments.configured;

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

            {showNameSetup && (
                <SetupNotice
                    icon={Building2}
                    title={t("Set your congregation's name")}
                    message={t('It appears on yahrzeit letters, invoices, emails and printouts, which currently say “:name”.', { name: organization.name })}
                    action={t('Set name')}
                    href="/admin/settings#site_name"
                />
            )}

            {showPaymentSetup && (
                <SetupNotice
                    icon={CreditCard}
                    title={payments.source === 'none' ? t('Turn on online payments') : t('Set up online payments')}
                    message={paymentSetupMessage(payments, t)}
                    action={t('Payment settings')}
                    href="/admin/settings#payment_processor"
                />
            )}
        </div>
    );
}
