import React, { useState, FormEvent } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { BreadcrumbItem } from '@/types';

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
}

interface Props {
  tier: MembershipTier;
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  billing_period: string;
  max_members: string;
  is_active: boolean;
  sort_order: string;
  features: string[];
}

export default function EditMembershipTier({ tier }: Props) {
  const [currentFeature, setCurrentFeature] = useState('');
  const { data, setData, put, processing, errors } = useForm<FormData>({
    name: tier.name,
    slug: tier.slug,
    description: tier.description || '',
    price: tier.price,
    billing_period: tier.billing_period,
    max_members: tier.max_members?.toString() || '',
    is_active: tier.is_active,
    sort_order: tier.sort_order.toString(),
    features: tier.features || [],
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    put(`/admin/membership-tiers/${tier.id}`);
  };

  const addFeature = () => {
    if (currentFeature.trim()) {
      setData('features', [...data.features, currentFeature.trim()]);
      setCurrentFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setData('features', data.features.filter((_, i) => i !== index));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (value: string) => {
    setData('name', value);
    // Only auto-update slug if it matches the current generated slug
    if (data.slug === generateSlug(tier.name)) {
      setData('slug', generateSlug(value));
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Membership Tiers', href: '/admin/membership-tiers' },
    { title: tier.name, href: `/admin/membership-tiers/${tier.id}` },
    { title: 'Edit', href: `/admin/membership-tiers/${tier.id}/edit`, current: true },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit ${tier.name}`} />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Membership Tier</h1>
            <p className="text-muted-foreground mt-2">
              Update details for {tier.name}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details for this membership tier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., Family Membership"
                    required
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={data.slug}
                    onChange={(e) => setData('slug', e.target.value)}
                    placeholder="e.g., family-membership"
                  />
                  {errors.slug && (
                    <p className="text-sm text-destructive">{errors.slug}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="Optional description of this membership tier"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Billing</CardTitle>
              <CardDescription>
                Set the price and billing period for this tier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.price}
                    onChange={(e) => setData('price', e.target.value)}
                    required
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billing_period">Billing Period *</Label>
                  <Select
                    value={data.billing_period}
                    onValueChange={(value) => setData('billing_period', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="lifetime">Lifetime</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.billing_period && (
                    <p className="text-sm text-destructive">{errors.billing_period}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Settings</CardTitle>
              <CardDescription>
                Configure additional options for this tier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="max_members">Maximum Members</Label>
                  <Input
                    id="max_members"
                    type="number"
                    min="1"
                    value={data.max_members}
                    onChange={(e) => setData('max_members', e.target.value)}
                    placeholder="Leave empty for unlimited"
                  />
                  {errors.max_members && (
                    <p className="text-sm text-destructive">{errors.max_members}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={data.sort_order}
                    onChange={(e) => setData('sort_order', e.target.value)}
                  />
                  {errors.sort_order && (
                    <p className="text-sm text-destructive">{errors.sort_order}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={data.is_active}
                  onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>
                Add features included in this membership tier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={currentFeature}
                  onChange={(e) => setCurrentFeature(e.target.value)}
                  placeholder="e.g., Access to all events"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                />
                <Button type="button" onClick={addFeature}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {data.features.length > 0 && (
                <div className="space-y-2">
                  {data.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-md bg-muted"
                    >
                      <span>{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/admin/membership-tiers">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={processing}>
              {processing ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
