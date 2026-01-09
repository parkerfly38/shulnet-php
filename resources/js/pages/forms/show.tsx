import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { type BreadcrumbItem } from '@/types';
import { type FormField } from '@/components/form-builder';
import { Edit, Copy, Check, FileText } from 'lucide-react';

interface Form {
    id: number;
    name: string;
    description: string | null;
    schema: FormField[];
    is_active: boolean;
    submissions_count: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    form: Form;
}

export default function ShowForm({ form }: Readonly<Props>) {
    const [isCopied, setIsCopied] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Forms', href: '/admin/forms' },
        { title: form.name, href: `/admin/forms/${form.id}` },
    ];

    const generateEmbedCode = () => {
        const baseUrl = window.location.origin;
        const submitUrl = `${baseUrl}/forms/${form.id}/submit`;
        
        let fieldsHtml = '';
        form.schema.forEach((field) => {
            fieldsHtml += `    <div style="margin-bottom: 16px;">\n`;
            fieldsHtml += `      <label style="display: block; margin-bottom: 4px; font-size: 14px; font-weight: 500; color: #374151;">\n`;
            fieldsHtml += `        ${field.label}${field.required ? '<span style="color: #dc2626;">*</span>' : ''}\n`;
            fieldsHtml += `      </label>\n`;
            
            if (field.description) {
                fieldsHtml += `      <p style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">${field.description}</p>\n`;
            }

            if (field.type === 'text') {
                fieldsHtml += `      <input type="text" name="${field.id}" ${field.required ? 'required' : ''} style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">\n`;
            } else if (field.type === 'textarea') {
                fieldsHtml += `      <textarea name="${field.id}" ${field.required ? 'required' : ''} rows="4" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;"></textarea>\n`;
            } else if (field.type === 'date') {
                fieldsHtml += `      <input type="date" name="${field.id}" ${field.required ? 'required' : ''} style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">\n`;
            } else if (field.type === 'boolean') {
                fieldsHtml += `      <input type="checkbox" name="${field.id}" value="1" ${field.required ? 'required' : ''} style="margin-right: 8px;"> Yes\n`;
            } else if (field.type === 'select' && field.options) {
                fieldsHtml += `      <select name="${field.id}" ${field.required ? 'required' : ''} style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">\n`;
                fieldsHtml += `        <option value="">Select an option</option>\n`;
                field.options.forEach(option => {
                    fieldsHtml += `        <option value="${option}">${option}</option>\n`;
                });
                fieldsHtml += `      </select>\n`;
            } else if (field.type === 'multiselect' && field.options) {
                field.options.forEach(option => {
                    fieldsHtml += `      <div style="margin-bottom: 4px;">\n`;
                    fieldsHtml += `        <input type="checkbox" name="${field.id}[]" value="${option}" style="margin-right: 8px;">${option}\n`;
                    fieldsHtml += `      </div>\n`;
                });
            }
            
            fieldsHtml += `    </div>\n`;
        });

        return `<!-- Custom Form: ${form.name.replace(/"/g, '&quot;')} -->
<div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: system-ui, -apple-system, sans-serif;">
  <h3 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #111827;">${form.name.replace(/"/g, '&quot;')}</h3>
  ${form.description ? `<p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">${form.description.replace(/"/g, '&quot;')}</p>` : ''}
  <form action="${submitUrl}" method="POST" style="display: flex; flex-direction: column;">
    <input type="hidden" name="_token" value="{{ csrf_token() }}">
${fieldsHtml}    <button type="submit" style="width: 100%; padding: 10px 16px; background-color: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; margin-top: 8px;">Submit</button>
  </form>
</div>`;
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generateEmbedCode());
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('Failed to copy code to clipboard');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={form.name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">{form.name}</h1>
                            <Badge variant={form.is_active ? 'default' : 'secondary'}>
                                {form.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        {form.description && (
                            <p className="text-gray-600 dark:text-gray-400 mt-2">{form.description}</p>
                        )}
                    </div>
                    <Link href={`/admin/forms/${form.id}/edit`}>
                        <Button>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Form
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                        <p className="text-sm text-gray-500">Total Submissions</p>
                        <p className="text-2xl font-bold">{form.submissions_count}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <p className="text-sm text-gray-500">Form Fields</p>
                        <p className="text-2xl font-bold">{form.schema.length}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="text-2xl font-bold">{form.is_active ? 'Active' : 'Inactive'}</p>
                    </div>
                </div>

                {form.submissions_count > 0 && (
                    <div className="border rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Submissions</h2>
                            <Link href={`/admin/forms/${form.id}/submissions`}>
                                <Button variant="outline" size="sm">
                                    <FileText className="w-4 h-4 mr-2" />
                                    View All Submissions
                                </Button>
                            </Link>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            This form has received {form.submissions_count} submission{form.submissions_count !== 1 ? 's' : ''}.
                        </p>
                    </div>
                )}

                <div className="border rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Embeddable Form Code</h2>
                        <Button variant="outline" size="sm" onClick={handleCopy}>
                            {isCopied ? (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy Code
                                </>
                            )}
                        </Button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Copy this code and paste it into any webpage to embed this form.
                    </p>
                    <Textarea
                        value={generateEmbedCode()}
                        readOnly
                        className="font-mono text-xs h-96"
                        onClick={(e) => e.currentTarget.select()}
                    />
                </div>

                <div className="border rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">Form Fields</h2>
                    <div className="space-y-4">
                        {form.schema.map((field, index) => (
                            <div key={field.id} className="border rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm text-gray-500">#{index + 1}</span>
                                    <h3 className="font-medium">{field.label}</h3>
                                    <Badge variant="outline">{field.type}</Badge>
                                    {field.required && <Badge variant="destructive">Required</Badge>}
                                </div>
                                {field.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        {field.description}
                                    </p>
                                )}
                                {(field.type === 'select' || field.type === 'multiselect') && field.options && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500 mb-1">Options:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {field.options.map((option) => (
                                                <Badge key={option} variant="secondary">
                                                    {option}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
