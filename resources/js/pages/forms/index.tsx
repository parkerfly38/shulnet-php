import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
import { Plus, Eye, Edit, Trash2, FileText } from 'lucide-react';

interface Form {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    submissions_count: number;
    created_at: string;
}

interface Props {
    forms: Form[];
}

export default function FormsIndex({ forms }: Readonly<Props>) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Forms', href: '/admin/forms' },
    ];

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this form? This will also delete all submissions.')) {
            router.delete(`/admin/forms/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Forms" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Forms</h1>
                    <Link href="/admin/forms/create">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Form
                        </Button>
                    </Link>
                </div>

                {forms.length === 0 ? (
                    <div className="border rounded-lg p-12 text-center">
                        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No forms yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Create your first custom form to start collecting data.
                        </p>
                        <Link href="/admin/forms/create">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Form
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {forms.map((form) => (
                            <div
                                key={form.id}
                                className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-semibold text-lg">{form.name}</h3>
                                    <Badge variant={form.is_active ? 'default' : 'secondary'}>
                                        {form.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                {form.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                        {form.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                    <FileText className="w-4 h-4" />
                                    <span>{form.submissions_count} submission{form.submissions_count !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Link href={`/admin/forms/${form.id}`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View
                                        </Button>
                                    </Link>
                                    <Link href={`/admin/forms/${form.id}/edit`}>
                                        <Button variant="outline" size="sm">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(form.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
