import { useTranslation } from '@/hooks/use-translation';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface Props {
  tier: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: string;
    billing_period: string;
    max_members: number | null;
    is_active: boolean;
    features: string[] | null;
    membership_periods?: Array<{ id: number }>;
  };
}

export default function MembershipTierShow({ tier }: Readonly<Props>) {
  const { t } = useTranslation();

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Membership Tiers', href: '/admin/membership-tiers' },
    { title: tier.name, href: `/admin/membership-tiers/${tier.id}` },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={tier.name} />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/membership-tiers">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{tier.name}</h1>
            <Badge variant={tier.is_active ? 'default' : 'secondary'}>
              {tier.is_active ? t('Active') : t('Inactive')}
            </Badge>
          </div>
          <Link href={`/admin/membership-tiers/${tier.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 me-2" />
              {t('Edit')}
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('Details')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <div className="text-muted-foreground">{t('Price')}</div>
              <div>{formatCurrency(Number(tier.price))}</div>
            </div>
            <div>
              <div className="text-muted-foreground">{t('Billing Period')}</div>
              <div className="capitalize">{tier.billing_period}</div>
            </div>
            <div>
              <div className="text-muted-foreground">{t('Max Members')}</div>
              <div>{tier.max_members ?? t('Unlimited')}</div>
            </div>
            <div>
              <div className="text-muted-foreground">{t('Membership periods')}</div>
              <div>{tier.membership_periods?.length ?? 0}</div>
            </div>
            {tier.description && (
              <div className="md:col-span-2">
                <div className="text-muted-foreground">{t('Description')}</div>
                <div>{tier.description}</div>
              </div>
            )}
            {tier.features && tier.features.length > 0 && (
              <div className="md:col-span-2">
                <div className="text-muted-foreground">{t('Features')}</div>
                <ul className="list-disc ps-5">
                  {tier.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
