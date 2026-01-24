import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import FormBuilder, { type FormField } from '@/components/form-builder';
import FormRenderer from '@/components/form-renderer';
import { type BreadcrumbItem } from '@/types';
import { Save, Eye } from 'lucide-react';

interface Form {
    id: number;
    name: string;
    description: string | null;
    schema: FormField[];
    is_active: boolean;
}

interface Props {
    form: Form;
}

export default function EditForm({ form }: Readonly<Props>) {
    const [showPreview, setShowPreview] = useState(false);
    const { data, setData, put, processing, errors } = useForm({
        name: form.name,
        description: form.description || '',
        schema: form.schema,
        is_active: form.is_active,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Forms', href: '/admin/forms' },
        { title: form.name, href: `/admin/forms/${form.id}` },
        { title: 'Edit', href: `/admin/forms/${form.id}/edit` },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/forms/${form.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${form.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Edit Form</h1>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowPreview(!showPreview)}
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            {showPreview ? 'Hide' : 'Show'} Preview
                        </Button>
                        <Button type="submit" disabled={processing || data.schema.length === 0}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Form Details</CardTitle>
                                <CardDescription>Basic information about your form</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Form Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="description">Description (optional)</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                    />
                                    {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                    />
                                    <Label htmlFor="is_active">Form is active and accepting submissions</Label>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Form Fields</CardTitle>
                                <CardDescription>Add and configure fields for your form</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FormBuilder
                                    value={data.schema}
                                    onChange={(schema) => setData('schema', schema)}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {showPreview && (
                        <div className="lg:sticky lg:top-4 lg:h-fit">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Preview</CardTitle>
                                    <CardDescription>
                                        This is how your form will appear to users
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {data.schema.length === 0 ? (
                                        <p className="text-center text-gray-500 py-8">
                                            Add fields to see the preview
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            <div>
                                                <h2 className="text-2xl font-bold mb-2">{data.name || 'Untitled Form'}</h2>
                                                {data.description && (
                                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                                        {data.description}
                                                    </p>
                                                )}
                                            </div>
                                            <FormRenderer fields={data.schema} />
                                            <Button type="button" className="w-full" disabled>
                                                Submit (Preview Only)
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </form>
            </div>
        </AppLayout>
    );
}
