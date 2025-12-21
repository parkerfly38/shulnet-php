import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PdfTemplate, PdfTemplateField, BreadcrumbItem } from '@/types';
import { useState, useMemo } from 'react';
import { Plus, Trash2, ArrowLeft, Info } from 'lucide-react';

interface Props {
    template: PdfTemplate;
}

export default function Edit({ template }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: template.name,
        slug: template.slug,
        description: template.description || '',
        html_content: template.html_content,
        available_fields: template.available_fields as PdfTemplateField[],
        category: template.category,
        is_active: template.is_active,
    });

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'PDF Templates', href: '/admin/pdf-templates' },
        { title: template.name, href: `/admin/pdf-templates/${template.id}` },
        { title: 'Edit', href: `/admin/pdf-templates/${template.id}/edit` },
    ], [template.id, template.name]);

    const [newField, setNewField] = useState<PdfTemplateField>({
        name: '',
        label: '',
        type: 'text',
        description: '',
        required: false,
        default_value: '',
    });

    const handleAddField = () => {
        if (newField.name && newField.label) {
            setData('available_fields', [...data.available_fields, { ...newField }]);
            setNewField({
                name: '',
                label: '',
                type: 'text',
                description: '',
                required: false,
                default_value: '',
            });
        }
    };

    const handleRemoveField = (index: number) => {
        setData('available_fields', data.available_fields.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/pdf-templates/${template.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${template.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit PDF Template</h1>
                        <p className="text-gray-600 dark:text-gray-400">Update template: {template.name}</p>
                    </div>
                    <Link href="/admin/pdf-templates">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back
                        </Button>
                    </Link>
                </div>

                <div className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Template name, slug, and category</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Template Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Yahrzeit Donation Letter"
                                        required
                                    />
                                    {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="slug">Slug *</Label>
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        placeholder="e.g., yahrzeit-donation-letter"
                                        required
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Unique identifier (letters, numbers, and hyphens only)
                                    </p>
                                    {errors.slug && <p className="text-sm text-red-600 mt-1">{errors.slug}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="category">Category *</Label>
                                    <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">General</SelectItem>
                                            <SelectItem value="letter">Letter</SelectItem>
                                            <SelectItem value="form">Form</SelectItem>
                                            <SelectItem value="invoice">Invoice</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Brief description of this template's purpose..."
                                        rows={3}
                                    />
                                    {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                    />
                                    <Label htmlFor="is_active" className="cursor-pointer">
                                        Active (available for use)
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Available Fields */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Available Fields</CardTitle>
                                <CardDescription>
                                    Define fields that can be used in the template using {'{{'} field_name {'}}'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-semibold mb-1">How to use fields:</p>
                                        <p>In your HTML content, use {'{{'} field_name {'}}'} to insert field values. For example: {'{{'} deceased_name {'}}'} will be replaced with the actual deceased person's name.</p>
                                    </div>
                                </div>

                                {/* Field List */}
                                {data.available_fields.length > 0 && (
                                    <div className="space-y-2">
                                        {data.available_fields.map((field, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <code className="text-sm bg-gray-200 px-2 py-1 rounded">
                                                            {'{{'} {field.name} {'}}'}
                                                        </code>
                                                        <span className="font-medium">{field.label}</span>
                                                        {field.required && (
                                                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>
                                                        )}
                                                    </div>
                                                    {field.description && (
                                                        <p className="text-sm text-gray-600 mt-1">{field.description}</p>
                                                    )}
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveField(index)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add New Field */}
                                <div className="border-t pt-4 space-y-4">
                                    <h4 className="font-semibold">Add New Field</h4>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="field_name">Field Name *</Label>
                                            <Input
                                                id="field_name"
                                                value={newField.name}
                                                onChange={(e) => setNewField({ ...newField, name: e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') })}
                                                placeholder="e.g., deceased_name"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="field_label">Field Label *</Label>
                                            <Input
                                                id="field_label"
                                                value={newField.label}
                                                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                                                placeholder="e.g., Deceased Name"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="field_type">Field Type</Label>
                                            <Select 
                                                value={newField.type} 
                                                onValueChange={(value: any) => setNewField({ ...newField, type: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="text">Text</SelectItem>
                                                    <SelectItem value="textarea">Textarea</SelectItem>
                                                    <SelectItem value="date">Date</SelectItem>
                                                    <SelectItem value="number">Number</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="field_default">Default Value</Label>
                                            <Input
                                                id="field_default"
                                                value={newField.default_value}
                                                onChange={(e) => setNewField({ ...newField, default_value: e.target.value })}
                                                placeholder="Optional"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label htmlFor="field_description">Description</Label>
                                            <Input
                                                id="field_description"
                                                value={newField.description}
                                                onChange={(e) => setNewField({ ...newField, description: e.target.value })}
                                                placeholder="Optional field description"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="field_required"
                                                checked={newField.required}
                                                onCheckedChange={(checked) => setNewField({ ...newField, required: checked as boolean })}
                                            />
                                            <Label htmlFor="field_required" className="cursor-pointer">
                                                Required field
                                            </Label>
                                        </div>
                                    </div>
                                    <Button type="button" onClick={handleAddField} variant="outline" size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Field
                                    </Button>
                                </div>
                                {errors.available_fields && <p className="text-sm text-red-600 mt-1">{errors.available_fields}</p>}
                            </CardContent>
                        </Card>

                        {/* HTML Content */}
                        <Card>
                            <CardHeader>
                                <CardTitle>HTML Content</CardTitle>
                                <CardDescription>
                                    HTML template with field placeholders
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={data.html_content}
                                    onChange={(e) => setData('html_content', e.target.value)}
                                    placeholder="Enter HTML content with {{field_name}} placeholders..."
                                    rows={15}
                                    className="font-mono text-sm"
                                    required
                                />
                                {errors.html_content && <p className="text-sm text-red-600 mt-1">{errors.html_content}</p>}
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-4">
                            <Link href="/admin/pdf-templates">
                                <Button type="button" variant="outline">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Updating...' : 'Update Template'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
