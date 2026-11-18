import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';

// Laid out like the other school show pages (teachers, classes, exams).

interface Subject {
    id: number;
    name: string;
    subject_code: string | null;
    description: string | null;
    books: string | null;
    class_id: number | null;
    teacher_id: number | null;
    class_name: string | null;
    teacher_name: string | null;
}

interface ShowProps {
    item: Subject;
}

export default function SubjectsShow({ item }: Readonly<ShowProps>) {
    const { t } = useTranslation();
    const none = <span className="text-gray-400">—</span>;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'School Management', href: '/admin/school' },
        { title: 'Subjects', href: '/admin/school/subjects' },
        { title: item.name || 'Show', href: `/admin/school/subjects/${item.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('Subject')}: ${item.name}`} />
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">{item.name}</h1>
                    <div className="flex gap-2">
                        <Link href="/admin/school/subjects" className="px-3 py-1 border rounded">{t('Back')}</Link>
                        <Link href={`/admin/school/subjects/${item.id}/edit`} className="px-3 py-1 bg-yellow-500 text-white rounded">{t('Edit')}</Link>
                    </div>
                </div>

                <div className="bg-white dark:bg-black p-4 rounded border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><strong>{t('Name')}:</strong> {item.name}</div>
                        <div><strong>{t('Subject Code')}:</strong> {item.subject_code || none}</div>
                        <div><strong>{t('Class')}:</strong>{' '}
                            {item.class_id ? <Link href={`/admin/school/class-definitions/${item.class_id}`} className="text-blue-600 hover:underline">{item.class_name}</Link> : none}
                        </div>
                        <div><strong>{t('Teacher')}:</strong>{' '}
                            {item.teacher_id ? <Link href={`/admin/school/teachers/${item.teacher_id}`} className="text-blue-600 hover:underline">{item.teacher_name}</Link> : none}
                        </div>
                        <div className="col-span-1 md:col-span-2"><strong>{t('Description')}:</strong>
                            <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {item.description || none}
                            </div>
                        </div>
                        <div className="col-span-1 md:col-span-2"><strong>{t('Books')}:</strong>
                            <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {item.books || none}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
