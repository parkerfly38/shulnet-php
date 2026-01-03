import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, TrendingUp, Users, Activity } from 'lucide-react';
import { BreadcrumbItem } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface MembershipTier {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  billing_period: 'annual' | 'monthly' | 'lifetime' | 'custom';
  max_members: number | null;
  is_active: boolean;
  sort_order: number;
  features: string[] | null;
  created_at: string;
  updated_at: string;
}

interface TierStats {
  total: number;
  active: number;
  totalRevenue: string;
}

interface Props {
  tiers: MembershipTier[];
  stats: TierStats;
}

const billingPeriodLabels: Record<string, string> = {
  annual: 'Annual',
  monthly: 'Monthly',
  lifetime: 'Lifetime',
  custom: 'Custom',
};

export default function MembershipTiersIndex({ tiers, stats }: Props) {
  const { currency } = usePage().props as { currency: string };

  const handleDelete = (tier: MembershipTier) => {
    if (confirm(`Are you sure you want to delete the "${tier.name}" membership tier?`)) {
      router.delete(`/admin/membership-tiers/${tier.id}`);
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Membership Tiers', href: '/admin/membership-tiers', current: true },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Membership Tiers" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Membership Tiers</h1>
            <p className="text-muted-foreground mt-2">
              Manage membership tier types and pricing
            </p>
          </div>
          <Link href="/admin/membership-tiers/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Tier
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tiers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tiers</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Potential Annual Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(parseFloat(stats.totalRevenue), currency)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tiers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Membership Tiers</CardTitle>
            <CardDescription>
              All membership tier types with pricing information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Price</th>
                    <th className="text-left py-3 px-4 font-medium">Billing Period</th>
                    <th className="text-left py-3 px-4 font-medium">Max Members</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Sort Order</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        No membership tiers found. Create your first tier to get started.
                      </td>
                    </tr>
                  ) : (
                    tiers.map((tier) => (
                      <tr key={tier.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{tier.name}</div>
                            {tier.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {tier.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {formatCurrency(parseFloat(tier.price), currency)}
                        </td>
                        <td className="py-3 px-4">
                          {billingPeriodLabels[tier.billing_period]}
                        </td>
                        <td className="py-3 px-4">
                          {tier.max_members ? tier.max_members : 'Unlimited'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={tier.is_active ? 'default' : 'secondary'}
                          >
                            {tier.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{tier.sort_order}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/membership-tiers/${tier.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(tier)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
