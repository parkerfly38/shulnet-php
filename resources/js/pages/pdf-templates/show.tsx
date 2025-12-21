import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PdfTemplate, BreadcrumbItem } from '@/types';
import { useState, useMemo } from 'react';
import { ArrowLeft, FileText, Pencil, Download } from 'lucide-react';

interface Props {
    template: PdfTemplate;
}

export default function Show({ template }: Props) {
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

    const handlePreview = () => {
        // Replace placeholders with values
        let content = template.html_content;
        Object.entries(fieldValues).forEach(([key, value]) => {
            content = content.replace(new RegExp(`{{${key}}}`, 'g'), value || `[${key}]`);
        });
        setPreviewContent(content);
        setShowPreview(true);
    };

    const handleGenerate = () => {
        // Create form and submit
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/admin/pdf-templates/${template.id}/generate`;
        form.target = '_blank';

        // Add CSRF token
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
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
        letter: 'bg-blue-100 text-blue-800',
        form: 'bg-green-100 text-green-800',
        invoice: 'bg-purple-100 text-purple-800',
        general: 'bg-gray-100 text-gray-800',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={template.name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{template.name}</h1>
                        <p className="text-gray-600 dark:text-gray-400">{template.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/admin/pdf-templates">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back
                            </Button>
                        </Link>
                        <Link href={`/admin/pdf-templates/${template.id}/edit`}>
                            <Button>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Template
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
                                                <FileText className="h-6 w-6 text-blue-600" />
                                                {template.name}
                                            </CardTitle>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge className={categoryColors[template.category] || categoryColors.general}>
                                                    {template.category}
                                                </Badge>
                                                {template.is_active ? (
                                                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                                                ) : (
                                                    <Badge className="bg-red-100 text-red-800">Inactive</Badge>
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
                                    <CardTitle>Fill Template Fields</CardTitle>
                                    <CardDescription>Enter values for each field to generate the document</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {template.available_fields.map((field) => (
                                        <div key={field.name}>
                                            <Label htmlFor={field.name}>
                                                {field.label}
                                                {field.required && <span className="text-red-500 ml-1">*</span>}
                                            </Label>
                                            {field.description && (
                                                <p className="text-sm text-gray-500 mb-2">{field.description}</p>
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
                                        <Button onClick={handlePreview} variant="outline" className="flex-1">
                                            Preview
                                        </Button>
                                        <Button onClick={handleGenerate} className="flex-1">
                                            <Download className="mr-2 h-4 w-4" />
                                            Generate PDF
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Preview */}
                            {showPreview && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Preview</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div 
                                            className="prose max-w-none bg-white border rounded-lg p-8"
                                            dangerouslySetInnerHTML={{ __html: previewContent }}
                                        />
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Column - Template Details */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Template Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-sm text-gray-500">Slug</Label>
                                        <p className="font-mono text-sm">{template.slug}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-gray-500">Category</Label>
                                        <p className="capitalize">{template.category}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-gray-500">Available Fields</Label>
                                        <p>{template.available_fields.length} fields</p>
                                        <div className="mt-2 space-y-1">
                                            {template.available_fields.map((field) => (
                                                <div key={field.name} className="text-sm">
                                                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                                        {'{{'} {field.name} {'}}'}
                                                    </code>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-gray-500">Status</Label>
                                        <p>{template.is_active ? 'Active' : 'Inactive'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-gray-500">Created</Label>
                                        <p className="text-sm">{new Date(template.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-gray-500">Last Updated</Label>
                                        <p className="text-sm">{new Date(template.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>HTML Template</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 font-mono">
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
