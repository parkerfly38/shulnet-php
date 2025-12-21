import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PdfTemplate } from '@/types';
import { useMemo, useState } from 'react';
import { FileText, Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Props {
    templates: {
        data: PdfTemplate[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        category?: string;
        is_active?: string;
    };
}

export default function Index({ templates, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || '');
    const [isActive, setIsActive] = useState(filters.is_active || '');

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'PDF Templates', href: '/admin/pdf-templates' },
    ], []);

    const handleFilter = () => {
        router.get('/admin/pdf-templates', {
            search,
            category: category || undefined,
            is_active: isActive || undefined,
        }, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this PDF template?')) {
            router.delete(`/admin/pdf-templates/${id}`);
        }
    };

    const categoryColors: Record<string, string> = {
        letter: 'bg-blue-100 text-blue-800',
        form: 'bg-green-100 text-green-800',
        invoice: 'bg-purple-100 text-purple-800',
        general: 'bg-gray-100 text-gray-800',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="PDF Templates" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">PDF Templates</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage document templates with dynamic field replacement</p>
                    </div>
                    <Link href="/admin/pdf-templates/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Template
                        </Button>
                    </Link>
                </div>

                <div className="space-y-6">
                    {/* Filters */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="flex items-center space-x-2">
                                    <Search className="h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Search templates..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                                    />
                                </div>

                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Categories</SelectItem>
                                        <SelectItem value="letter">Letter</SelectItem>
                                        <SelectItem value="form">Form</SelectItem>
                                        <SelectItem value="invoice">Invoice</SelectItem>
                                        <SelectItem value="general">General</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={isActive} onValueChange={setIsActive}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Status</SelectItem>
                                        <SelectItem value="1">Active</SelectItem>
                                        <SelectItem value="0">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button onClick={handleFilter}>Filter</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Templates List */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {templates.data.map((template) => (
                            <Card key={template.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <FileText className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">{template.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
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
                                    </div>

                                    {template.description && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {template.description}
                                        </p>
                                    )}

                                    <div className="text-sm text-gray-500 mb-4">
                                        <strong>{template.available_fields.length}</strong> available fields
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <Link href={`/admin/pdf-templates/${template.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                        </Link>
                                        <div className="flex gap-2">
                                            <Link href={`/admin/pdf-templates/${template.id}/edit`}>
                                                <Button variant="outline" size="sm">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(template.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {templates.last_page > 1 && (
                        <div className="flex justify-center gap-2">
                            {Array.from({ length: templates.last_page }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={page === templates.current_page ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => router.get('/admin/pdf-templates', { page })}
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                    )}

                    {templates.data.length === 0 && (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
                                <p className="text-gray-600 mb-4">Get started by creating your first PDF template.</p>
                                <Link href="/admin/pdf-templates/create">
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Template
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
