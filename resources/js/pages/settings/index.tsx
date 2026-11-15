import { useTranslation } from '@/hooks/use-translation';
import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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

// A short label per setting, plus help text where the stored description is blank or too technical.
const SETTING_LABELS: Record<string, { label: string; help?: string }> = {
    // General
    site_name: { label: 'Synagogue Name', help: 'Shown on letters, invoices, emails and printouts.' },
    site_timezone: { label: 'Time Zone' },
    currency: { label: 'Currency', help: 'Used for invoices and financial reports.' },
    payment_processor: { label: 'Payment Processor', help: 'Which service members use to pay invoices online.' },
    stripe_public_key: { label: 'Stripe Publishable Key', help: 'Starts with pk_. Found in your Stripe dashboard under Developers → API keys.' },
    stripe_secret_key: { label: 'Stripe Secret Key', help: 'Starts with sk_. Keep this private.' },
    authorize_net_api_login_id: { label: 'Authorize.Net API Login ID' },
    authorize_net_transaction_key: { label: 'Authorize.Net Transaction Key' },
    authorize_net_environment: { label: 'Authorize.Net Mode', help: "Use Sandbox for testing and Live for real payments. Currently read from the server's .env file, not this page." },
    paypal_client_id: { label: 'PayPal Client ID' },
    paypal_secret: { label: 'PayPal Secret' },
    paypal_mode: { label: 'PayPal Mode', help: "Use Sandbox for testing and Live for real payments. Currently read from the server's .env file, not this page." },

    // Jewish calendar
    jewish_calendar_location: { label: 'Calendar Location', help: 'Diaspora or Israel. Affects holiday dates and Torah readings.' },
    torah_reading_cycle: { label: 'Torah Reading Cycle', help: 'Annual reads the full parashah each week; triennial reads a third of it.' },
    shabbat_candle_lighting_offset: { label: 'Candle Lighting (minutes before sunset)' },
    havdalah_offset: { label: 'Havdalah (minutes after sunset)' },
    honor_reminder_days_before: { label: 'Torah Honor Reminder (days before)', help: 'How many days before the service honorees are emailed a reminder. Enter 0 to turn automatic reminders off.' },

    // Templates
    email_header_color: { label: 'Email Header Color' },
    email_footer_text: { label: 'Email Footer Text' },
    pdf_header_logo_url: { label: 'PDF Logo URL', help: 'Web address of the logo shown at the top of PDF documents.' },
    pdf_footer_text: { label: 'PDF Footer Text' },

    // Integrations
    zoom_enabled: { label: 'Enable Zoom', help: 'Create Zoom meetings for online events and meetings.' },
    zoom_account_id: { label: 'Zoom Account ID', help: 'From your Zoom Server-to-Server OAuth app.' },
    zoom_client_id: { label: 'Zoom Client ID', help: 'From your Zoom Server-to-Server OAuth app.' },
    zoom_client_secret: { label: 'Zoom Client Secret', help: 'From your Zoom Server-to-Server OAuth app.' },
    zoom_user_id: { label: 'Zoom User', help: 'Enter "me" to host meetings as the account owner.' },

    // Website content
    asset_storage_provider: { label: 'Image & File Storage', help: 'Where uploaded images and files for web pages are kept.' },
    html_publish_destination: { label: 'Publish Web Pages To' },
    html_publish_s3_bucket: { label: 'Amazon S3 Bucket' },
    html_publish_s3_path: { label: 'Amazon S3 Folder (optional)' },
    html_publish_azure_container: { label: 'Azure Container' },
    html_publish_azure_path: { label: 'Azure Folder (optional)' },
};

function timeZoneOptions(current: string) {
    let zones: string[] = [];
    try {
        zones = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.('timeZone') ?? [];
    } catch {
        zones = [];
    }
    if (current && !zones.includes(current)) zones = [current, ...zones];
    return zones.map((z) => ({ value: z, label: z.replaceAll('_', ' ') }));
}

const ACRONYMS: Record<string, string> = { smtp: 'SMTP', pdf: 'PDF', url: 'URL', api: 'API', id: 'ID', html: 'HTML', s3: 'S3' };

// Fallback for settings added later without a label: "smtp_host" → "SMTP Host".
function humanize(key: string) {
    return key.split('_').map((w) => ACRONYMS[w] ?? w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function SettingsIndex({ settings: initialSettings }: Readonly<Props>) {
    const { t } = useTranslation();

    // Links like /admin/settings#site_name jump straight to that field.
    useEffect(() => {
        const field = window.location.hash ? document.getElementById(decodeURIComponent(window.location.hash.slice(1))) : null;
        if (field) {
            field.scrollIntoView({ block: 'center' });
            field.focus({ preventScroll: true });
        }
    }, []);
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
                        { value: 'SGD', label: 'SGD (S$) - Singapore Dollar' },
                        { value: 'ARS', label: 'ARS ($) - Argentine Peso' },
                        { value: 'ZAR', label: 'ZAR (R) - South African Rand' },
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
                } else if (setting.key === 'site_timezone') {
                    options = timeZoneOptions(value);
                } else if (setting.key === 'authorize_net_environment' || setting.key === 'paypal_mode') {
                    options = [
                        { value: 'sandbox', label: 'Sandbox (testing)' },
                        { value: 'production', label: 'Live (real payments)' },
                    ];
                } else if (setting.key === 'html_publish_destination') {
                    options = [
                        { value: 'local', label: 'Local Server (public/published)' },
                        { value: 's3', label: 'Amazon S3 Static Website' },
                        { value: 'azure', label: 'Azure Static Website' },
                        { value: 'zip', label: 'Download as ZIP' },
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
            
            case 'boolean':
                return (
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id={setting.key}
                            checked={value === 'true'}
                            onCheckedChange={(checked) => updateSetting(setting.key, checked === true ? 'true' : 'false')}
                        />
                        <span className="text-sm">{value === 'true' ? t('On') : t('Off')}</span>
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
        templates: 'Template Settings',
        integrations: 'Integrations',
        content: 'Website Content',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Settings')} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <SettingsIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('Portal Settings')}</h1>
                        <p className="text-gray-600 dark:text-gray-400">{t('Configure portal behavior and preferences')}</p>
                    </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('Email server and membership dues settings have their own pages:')}{' '}
                    <Link href="/admin/email-settings" className="text-blue-600 hover:underline">{t('Email Settings')}</Link>
                    {' · '}
                    <Link href="/admin/settings/membership-billing" className="text-blue-600 hover:underline">{t('Membership Billing')}</Link>
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {Object.entries(initialSettings).map(([group, groupSettings]) => (
                        <div
                            key={group}
                            className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
                        >
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                {t(groupTitles[group] ?? humanize(group))}
                            </h2>
                            
                            <div className="space-y-6">
                                {groupSettings.map((setting) => (
                                    <div key={setting.key} className="space-y-2">
                                        <Label htmlFor={setting.key}>
                                            {t(SETTING_LABELS[setting.key]?.label ?? humanize(setting.key))}
                                        </Label>
                                        {renderSettingInput(setting)}
                                        {(SETTING_LABELS[setting.key]?.help ?? setting.description) && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {t(SETTING_LABELS[setting.key]?.help ?? setting.description ?? '')}
                                            </p>
                                        )}
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
                            <Save className="h-4 w-4 me-2" />
                            {processing ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
