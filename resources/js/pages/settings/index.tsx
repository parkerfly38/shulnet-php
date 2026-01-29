import React, { useMemo, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { BreadcrumbItem } from '@/types';

interface Setting {
    id: number;
    key: string;
    value: string | null;
    group: string;
    type: string;
    description: string | null;
}

interface Props {
    settings: {
        [group: string]: Setting[];
    };
}

export default function SettingsIndex({ settings: initialSettings }: Readonly<Props>) {
    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        { title: 'System', href: '/dashboard' },
        { title: 'Settings', href: '/admin/settings' },
    ], []);

    // Convert settings object to form data
    const settingsData: { [key: string]: string } = {};
    Object.values(initialSettings).flat().forEach((setting) => {
        settingsData[setting.key] = setting.value || '';
    });

    const { data, setData, put, processing, errors } = useForm({
        settings: settingsData,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/settings');
    };

    const updateSetting = (key: string, value: string) => {
        setData('settings', {
            ...data.settings,
            [key]: value,
        });
    };

    const renderSettingInput = (setting: Setting) => {
        const value = data.settings[setting.key] || '';

        switch (setting.type) {
            case 'textarea':
                return (
                    <Textarea
                        id={setting.key}
                        value={value}
                        onChange={(e) => updateSetting(setting.key, e.target.value)}
                        rows={3}
                    />
                );
            
            case 'select':
                let options: { value: string; label: string }[] = [];
                
                if (setting.key === 'payment_processor') {
                    options = [
                        { value: 'stripe', label: 'Stripe' },
                        { value: 'authorize_net', label: 'Authorize.Net' },
                        { value: 'paypal', label: 'PayPal' },
                    ];
                } else if (setting.key === 'jewish_calendar_location') {
                    options = [
                        { value: 'diaspora', label: 'Diaspora' },
                        { value: 'israel', label: 'Israel' },
                    ];
                } else if (setting.key === 'torah_reading_cycle') {
                    options = [
                        { value: 'annual', label: 'Annual (Full Torah)' },
                        { value: 'triennial', label: 'Triennial Cycle' },
                    ];
                } else if (setting.key === 'currency') {
                    options = [
                        { value: 'USD', label: 'USD ($) - US Dollar' },
                        { value: 'EUR', label: 'EUR (€) - Euro' },
                        { value: 'GBP', label: 'GBP (£) - British Pound' },
                        { value: 'CAD', label: 'CAD ($) - Canadian Dollar' },
                        { value: 'AUD', label: 'AUD ($) - Australian Dollar' },
                        { value: 'ILS', label: 'ILS (₪) - Israeli Shekel' },
                        { value: 'JPY', label: 'JPY (¥) - Japanese Yen' },
                        { value: 'CHF', label: 'CHF (Fr) - Swiss Franc' },
                        { value: 'CNY', label: 'CNY (¥) - Chinese Yuan' },
                        { value: 'INR', label: 'INR (₹) - Indian Rupee' },
                    ];
                } else if (setting.key === 'smtp_encryption') {
                    options = [
                        { value: 'tls', label: 'TLS' },
                        { value: 'ssl', label: 'SSL' },
                        { value: 'none', label: 'None' },
                    ];
                } else if (setting.key === 'asset_storage_provider') {
                    options = [
                        { value: 'local', label: 'Local Server' },
                        { value: 'cloudflare', label: 'CloudFlare R2' },
                        { value: 's3', label: 'Amazon S3' },
                        { value: 'azure', label: 'Azure Blob Storage' },
                    ];
                }

                return (
                    <Select value={value} onValueChange={(val) => updateSetting(setting.key, val)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            
            case 'password':
                return (
                    <Input
                        id={setting.key}
                        type="password"
                        value={value}
                        onChange={(e) => updateSetting(setting.key, e.target.value)}
                        placeholder="••••••••"
                    />
                );
            
            case 'email':
                return (
                    <Input
                        id={setting.key}
                        type="email"
                        value={value}
                        onChange={(e) => updateSetting(setting.key, e.target.value)}
                    />
                );
            
            case 'color':
                return (
                    <div className="flex gap-2">
                        <Input
                            id={setting.key}
                            type="color"
                            value={value}
                            onChange={(e) => updateSetting(setting.key, e.target.value)}
                            className="w-20 h-10"
                        />
                        <Input
                            type="text"
                            value={value}
                            onChange={(e) => updateSetting(setting.key, e.target.value)}
                            placeholder="#1e40af"
                        />
                    </div>
                );
            
            default:
                return (
                    <Input
                        id={setting.key}
                        type="text"
                        value={value}
                        onChange={(e) => updateSetting(setting.key, e.target.value)}
                    />
                );
        }
    };

    const groupTitles: { [key: string]: string } = {
        general: 'General Settings',
        jewish_calendar: 'Jewish Calendar Settings',
        email: 'Email & SMTP Settings',
        templates: 'Template Settings',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <SettingsIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Portal Settings</h1>
                        <p className="text-gray-600 dark:text-gray-400">Configure portal behavior and preferences</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {Object.entries(initialSettings).map(([group, groupSettings]) => (
                        <div
                            key={group}
                            className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
                        >
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                {groupTitles[group] || group}
                            </h2>
                            
                            <div className="space-y-6">
                                {groupSettings.map((setting) => (
                                    <div key={setting.key} className="space-y-2">
                                        <Label htmlFor={setting.key}>
                                            {setting.description || setting.key}
                                        </Label>
                                        {renderSettingInput(setting)}
                                        {errors[`settings.${setting.key}`] && (
                                            <p className="text-sm text-red-600">
                                                {errors[`settings.${setting.key}`]}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-end gap-4">
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
