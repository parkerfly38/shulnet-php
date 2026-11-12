import { useTranslation } from '@/hooks/use-translation';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PdfTemplate, BreadcrumbItem } from '@/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, FileText, Pencil, Download } from 'lucide-react';

interface Props {
    template: PdfTemplate;
}

export default function Show({ template }: Props) {
    const { t } = useTranslation();
    const { csrf_token } = usePage<{ csrf_token: string }>().props;
    
    const [fieldValues, setFieldValues] = useState<Record<string, string>>(
        template.available_fields.reduce((acc, field) => ({
            ...acc,
            [field.name]: field.default_value || ''
        }), {})
    );

    const [previewContent, setPreviewContent] = useState('');

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'PDF Templates', href: '/admin/pdf-templates' },
        { title: template.name, href: `/admin/pdf-templates/${template.id}` },
    ], [template.id, template.name]);
    const [showPreview, setShowPreview] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [previewHeight, setPreviewHeight] = useState(600);
    const previewRef = useRef<HTMLDivElement>(null);

    // Render on the server so the preview matches the PDF ({{#if}} blocks, escaping).
    // Empty fields show as [Label] so the layout is visible before anything is filled in.
    const handlePreview = async () => {
        setPreviewLoading(true);
        setPreviewError(null);
        try {
            const values = Object.fromEntries(template.available_fields.map((field) => [field.name, fieldValues[field.name] || `[${field.label}]`]));
            const response = await fetch(`/admin/pdf-templates/${template.id}/preview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': csrf_token },
                body: JSON.stringify({ field_values: values }),
            });
            if (!response.ok) throw new Error(String(response.status));
            setPreviewContent((await response.json()).html);
            setShowPreview(true);
        } catch {
            setPreviewError(t('The preview could not be loaded. Please refresh the page and try again.'));
        } finally {
            setPreviewLoading(false);
        }
    };

    useEffect(() => {
        if (showPreview) previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [showPreview, previewContent]);

    const handleGenerate = () => {
        if (!csrf_token) {
            alert('Session error. Please refresh the page and try again.');
            return;
        }
        
        // Create form and submit
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/admin/pdf-templates/${template.id}/generate`;
        form.target = '_blank';

        // Add CSRF token
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = csrf_token;
        form.appendChild(csrfInput);

        // Add field values
        const fieldValuesInput = document.createElement('input');
        fieldValuesInput.type = 'hidden';
        fieldValuesInput.name = 'field_values';
        fieldValuesInput.value = JSON.stringify(fieldValues);
        form.appendChild(fieldValuesInput);

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    const categoryColors: Record<string, string> = {
        letter: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
        form: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
        invoice: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300',
        general: 'bg-muted text-foreground',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={template.name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{template.name}</h1>
                        <p className="text-muted-foreground">{template.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/admin/pdf-templates">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 me-1" />
                                {t('Back')}
                            </Button>
                        </Link>
                        <Link href={`/admin/pdf-templates/${template.id}/edit`}>
                            <Button>
                                <Pencil className="me-2 h-4 w-4" />
                                {t('Edit Template')}
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Template Info and Fields */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Template Info */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-3">
                                                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                {template.name}
                                            </CardTitle>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge className={categoryColors[template.category] || categoryColors.general}>
                                                    {template.category}
                                                </Badge>
                                                {template.is_active ? (
                                                    <Badge className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">{t('Active')}</Badge>
                                                ) : (
                                                    <Badge className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">{t('Inactive')}</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {template.description && (
                                        <CardDescription className="mt-2">{template.description}</CardDescription>
                                    )}
                                </CardHeader>
                            </Card>

                            {/* Fill Fields */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('Fill Template Fields')}</CardTitle>
                                    <CardDescription>{t('Enter values for each field to generate the document')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {template.available_fields.map((field) => (
                                        <div key={field.name}>
                                            <Label htmlFor={field.name}>
                                                {field.label}
                                                {field.required && <span className="text-red-500 ms-1">*</span>}
                                            </Label>
                                            {field.description && (
                                                <p className="text-sm text-muted-foreground mb-2">{field.description}</p>
                                            )}
                                            {field.type === 'textarea' ? (
                                                <Textarea
                                                    id={field.name}
                                                    value={fieldValues[field.name] || ''}
                                                    onChange={(e) => setFieldValues({
                                                        ...fieldValues,
                                                        [field.name]: e.target.value
                                                    })}
                                                    placeholder={field.default_value || ''}
                                                    rows={4}
                                                />
                                            ) : (
                                                <Input
                                                    id={field.name}
                                                    type={field.type}
                                                    value={fieldValues[field.name] || ''}
                                                    onChange={(e) => setFieldValues({
                                                        ...fieldValues,
                                                        [field.name]: e.target.value
                                                    })}
                                                    placeholder={field.default_value || ''}
                                                />
                                            )}
                                        </div>
                                    ))}

                                    <div className="flex gap-3 pt-4">
                                        <Button onClick={handlePreview} variant="outline" className="flex-1" disabled={previewLoading}>
                                            {previewLoading ? t('Loading...') : t('Preview')}
                                        </Button>
                                        <Button onClick={handleGenerate} className="flex-1">
                                            <Download className="me-2 h-4 w-4" />
                                            {t('Generate PDF')}
                                        </Button>
                                    </div>
                                    {previewError && <p className="text-sm text-red-600">{previewError}</p>}
                                </CardContent>
                            </Card>

                            {/* Preview: a sandboxed frame keeps the template's own styles off the rest of the page. */}
                            {showPreview && (
                                <Card ref={previewRef} className="scroll-mt-4">
                                    <CardHeader>
                                        <CardTitle>{t('Preview')}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <iframe
                                            title={t('Preview')}
                                            sandbox="allow-same-origin"
                                            srcDoc={previewContent}
                                            className="w-full rounded-lg border bg-white"
                                            style={{ height: previewHeight }}
                                            onLoad={(e) => {
                                                const doc = e.currentTarget.contentDocument;
                                                if (doc) setPreviewHeight(Math.max(300, doc.documentElement.scrollHeight + 16));
                                            }}
                                        />
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Column - Template Details */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('Template Details')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-sm text-muted-foreground">{t('Slug')}</Label>
                                        <p className="font-mono text-sm">{template.slug}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-muted-foreground">{t('Category')}</Label>
                                        <p className="capitalize">{template.category}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-muted-foreground">{t('Available Fields')}</Label>
                                        <p>{template.available_fields.length} fields</p>
                                        <div className="mt-2 space-y-1">
                                            {template.available_fields.map((field) => (
                                                <div key={field.name} className="text-sm">
                                                    <code className="bg-muted px-2 py-1 rounded text-xs">
                                                        {'{{'} {field.name} {'}}'}
                                                    </code>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-muted-foreground">{t('Status')}</Label>
                                        <p>{template.is_active ? 'Active' : 'Inactive'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-muted-foreground">{t('Created')}</Label>
                                        <p className="text-sm">{new Date(template.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-muted-foreground">{t('Last Updated')}</Label>
                                        <p className="text-sm">{new Date(template.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('HTML Template')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96 font-mono">
                                        {template.html_content}
                                    </pre>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
