import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

type EmailProvider = 'smtp' | 'mailgun' | 'sendgrid' | 'ses' | 'log';

interface EmailSettings {
    provider: EmailProvider;
    from_address: string;
    from_name: string;
    smtp_host?: string;
    smtp_port?: string;
    smtp_username?: string;
    smtp_password?: string;
    smtp_encryption?: string;
    mailgun_domain?: string;
    mailgun_secret?: string;
    mailgun_endpoint?: string;
    sendgrid_api_key?: string;
    ses_key?: string;
    ses_secret?: string;
    ses_region?: string;
}

interface Props {
    settings: EmailSettings;
}

export default function EmailSettingsPage({ settings }: Readonly<Props>) {
    const [testEmail, setTestEmail] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');
    const [dialogType, setDialogType] = useState<'success' | 'error'>('success');


    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'System',
            href: '/dashboard',
        },
        {
            title: 'Settings',
            href: '/admin/settings',
        },
        {
            title: 'Email Settings',
            href: '/admin/email-settings',
        },
    ];
    const { data, setData, post, processing, errors } = useForm<EmailSettings>(settings);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/email-settings', {
            preserveScroll: true,
        });
    };

    const handleTestEmail = async () => {
        if (!testEmail) {
            setDialogType('error');
            setDialogMessage('Please enter an email address');
            setDialogOpen(true);
            return;
        }

        setIsTesting(true);
        try {
            const response = await fetch('/admin/email-settings/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ email: testEmail }),
            });

            const result = await response.json();
            if (result.success) {
                setDialogType('success');
                setDialogMessage(result.message || 'Test email sent successfully');
            } else {
                setDialogType('error');
                setDialogMessage(result.message || 'Failed to send test email');
            }
            setDialogOpen(true);
        } catch (error) {
            console.error('Failed to send test email:', error);
            setDialogType('error');
            setDialogMessage(
                error instanceof Error 
                    ? `Failed to send test email: ${error.message}`
                    : 'Failed to send test email. Please check your email configuration.'
            );
            setDialogOpen(true);
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Email Settings" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Email Provider Configuration</CardTitle>
                                <CardDescription>
                                    Configure your email sending provider for campaigns and notifications
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="provider">Email Provider</Label>
                                    <Select
                                        value={data.provider}
                                        onValueChange={(value: EmailProvider) => setData('provider', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select provider" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="smtp">SMTP</SelectItem>
                                            <SelectItem value="mailgun">Mailgun</SelectItem>
                                            <SelectItem value="sendgrid">SendGrid</SelectItem>
                                            <SelectItem value="ses">AWS SES</SelectItem>
                                            <SelectItem value="log">Log (Testing)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.provider && (
                                        <p className="text-sm text-red-600">{errors.provider}</p>
                                    )}
                                </div>

                                <Separator />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="from_address">From Email Address</Label>
                                        <Input
                                            id="from_address"
                                            type="email"
                                            value={data.from_address || ''}
                                            onChange={(e) => setData('from_address', e.target.value)}
                                            placeholder="noreply@example.com"
                                        />
                                        {errors.from_address && (
                                            <p className="text-sm text-red-600">{errors.from_address}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="from_name">From Name</Label>
                                        <Input
                                            id="from_name"
                                            type="text"
                                            value={data.from_name || ''}
                                            onChange={(e) => setData('from_name', e.target.value)}
                                            placeholder="Your Organization"
                                        />
                                        {errors.from_name && (
                                            <p className="text-sm text-red-600">{errors.from_name}</p>
                                        )}
                                    </div>
                                </div>

                                {data.provider === 'smtp' && (
                                    <>
                                        <Separator />
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium">SMTP Configuration</h3>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="smtp_host">SMTP Host</Label>
                                                    <Input
                                                        id="smtp_host"
                                                        type="text"
                                                        value={data.smtp_host || ''}
                                                        onChange={(e) => setData('smtp_host', e.target.value)}
                                                        placeholder="smtp.example.com"
                                                    />
                                                    {errors.smtp_host && (
                                                        <p className="text-sm text-red-600">{errors.smtp_host}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="smtp_port">SMTP Port</Label>
                                                    <Input
                                                        id="smtp_port"
                                                        type="text"
                                                        value={data.smtp_port || ''}
                                                        onChange={(e) => setData('smtp_port', e.target.value)}
                                                        placeholder="587"
                                                    />
                                                    {errors.smtp_port && (
                                                        <p className="text-sm text-red-600">{errors.smtp_port}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="smtp_username">SMTP Username</Label>
                                                    <Input
                                                        id="smtp_username"
                                                        type="text"
                                                        value={data.smtp_username || ''}
                                                        onChange={(e) => setData('smtp_username', e.target.value)}
                                                    />
                                                    {errors.smtp_username && (
                                                        <p className="text-sm text-red-600">{errors.smtp_username}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="smtp_password">SMTP Password</Label>
                                                    <Input
                                                        id="smtp_password"
                                                        type="password"
                                                        value={data.smtp_password || ''}
                                                        onChange={(e) => setData('smtp_password', e.target.value)}
                                                        placeholder={data.smtp_password === '••••••••' ? '••••••••' : ''}
                                                    />
                                                    {errors.smtp_password && (
                                                        <p className="text-sm text-red-600">{errors.smtp_password}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="smtp_encryption">Encryption</Label>
                                                    <Select
                                                        value={data.smtp_encryption || 'tls'}
                                                        onValueChange={(value) => setData('smtp_encryption', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="tls">TLS</SelectItem>
                                                            <SelectItem value="ssl">SSL</SelectItem>
                                                            <SelectItem value="none">None</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.smtp_encryption && (
                                                        <p className="text-sm text-red-600">{errors.smtp_encryption}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {data.provider === 'mailgun' && (
                                    <>
                                        <Separator />
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium">Mailgun Configuration</h3>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="mailgun_domain">Mailgun Domain</Label>
                                                    <Input
                                                        id="mailgun_domain"
                                                        type="text"
                                                        value={data.mailgun_domain || ''}
                                                        onChange={(e) => setData('mailgun_domain', e.target.value)}
                                                        placeholder="mg.example.com"
                                                    />
                                                    {errors.mailgun_domain && (
                                                        <p className="text-sm text-red-600">{errors.mailgun_domain}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="mailgun_secret">Mailgun API Key</Label>
                                                    <Input
                                                        id="mailgun_secret"
                                                        type="password"
                                                        value={data.mailgun_secret || ''}
                                                        onChange={(e) => setData('mailgun_secret', e.target.value)}
                                                        placeholder={data.mailgun_secret === '••••••••' ? '••••••••' : ''}
                                                    />
                                                    {errors.mailgun_secret && (
                                                        <p className="text-sm text-red-600">{errors.mailgun_secret}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="mailgun_endpoint">Mailgun Endpoint (Optional)</Label>
                                                    <Input
                                                        id="mailgun_endpoint"
                                                        type="text"
                                                        value={data.mailgun_endpoint || ''}
                                                        onChange={(e) => setData('mailgun_endpoint', e.target.value)}
                                                        placeholder="api.mailgun.net"
                                                    />
                                                    {errors.mailgun_endpoint && (
                                                        <p className="text-sm text-red-600">{errors.mailgun_endpoint}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {data.provider === 'sendgrid' && (
                                    <>
                                        <Separator />
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium">SendGrid Configuration</h3>
                                            <div className="space-y-2">
                                                <Label htmlFor="sendgrid_api_key">SendGrid API Key</Label>
                                                <Input
                                                    id="sendgrid_api_key"
                                                    type="password"
                                                    value={data.sendgrid_api_key || ''}
                                                    onChange={(e) => setData('sendgrid_api_key', e.target.value)}
                                                    placeholder={data.sendgrid_api_key === '••••••••' ? '••••••••' : ''}
                                                />
                                                {errors.sendgrid_api_key && (
                                                    <p className="text-sm text-red-600">{errors.sendgrid_api_key}</p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {data.provider === 'ses' && (
                                    <>
                                        <Separator />
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium">AWS SES Configuration</h3>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="ses_key">AWS Access Key ID</Label>
                                                    <Input
                                                        id="ses_key"
                                                        type="text"
                                                        value={data.ses_key || ''}
                                                        onChange={(e) => setData('ses_key', e.target.value)}
                                                    />
                                                    {errors.ses_key && (
                                                        <p className="text-sm text-red-600">{errors.ses_key}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="ses_secret">AWS Secret Access Key</Label>
                                                    <Input
                                                        id="ses_secret"
                                                        type="password"
                                                        value={data.ses_secret || ''}
                                                        onChange={(e) => setData('ses_secret', e.target.value)}
                                                        placeholder={data.ses_secret === '••••••••' ? '••••••••' : ''}
                                                    />
                                                    {errors.ses_secret && (
                                                        <p className="text-sm text-red-600">{errors.ses_secret}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="ses_region">AWS Region</Label>
                                                    <Input
                                                        id="ses_region"
                                                        type="text"
                                                        value={data.ses_region || ''}
                                                        onChange={(e) => setData('ses_region', e.target.value)}
                                                        placeholder="us-east-1"
                                                    />
                                                    {errors.ses_region && (
                                                        <p className="text-sm text-red-600">{errors.ses_region}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {data.provider === 'log' && (
                                    <>
                                        <Separator />
                                        <div className="rounded-lg bg-yellow-50 p-4">
                                            <p className="text-sm text-yellow-800">
                                                Log provider is for testing only. Emails will be logged to storage/logs/laravel.log instead of being sent.
                                            </p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Test Email</CardTitle>
                                <CardDescription>
                                    Send a test email to verify your configuration
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <Input
                                        type="email"
                                        placeholder="test@example.com"
                                        value={testEmail}
                                        onChange={(e) => setTestEmail(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleTestEmail}
                                        disabled={isTesting}
                                    >
                                        {isTesting ? 'Sending...' : 'Send Test Email'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {dialogType === 'success' ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            )}
                            {dialogType === 'success' ? 'Success' : 'Error'}
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            {dialogMessage}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end">
                        <Button onClick={() => setDialogOpen(false)}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
