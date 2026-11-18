import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import SubjectFields, { type SubjectFormData, type SubjectFormOptions } from '@/components/school/subject-fields';
import type { FormEvent } from 'react';
import { BreadcrumbItem } from '@/types';

interface Subject {
    id: number;
    name: string;
    subject_code: string | null;
    description: string | null;
    books: string | null;
    class_id: number | null;
    teacher_id: number | null;
}

interface EditProps extends SubjectFormOptions {
    item: Subject;
}

export default function SubjectsEdit({ item, classes, teachers }: Readonly<EditProps>) {
    const { t } = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'School Management', href: '/admin/school' },
        { title: 'Subjects', href: '/admin/school/subjects' },
        { title: item.name || 'Edit', href: `/admin/school/subjects/${item.id}` },
        { title: 'Edit', href: `/admin/school/subjects/${item.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm<SubjectFormData>({
        name: item.name ?? '',
        subject_code: item.subject_code ?? '',
        description: item.description ?? '',
        books: item.books ?? '',
        class_id: item.class_id ? String(item.class_id) : '',
        teacher_id: item.teacher_id ? String(item.teacher_id) : '',
    });

    // The API redirects Inertia requests back to the subject's page.
    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/api/admin/subjects/${item.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('Edit Subject')}: ${item.name}`} />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">{t('Edit Subject')}</h1>
                <form onSubmit={submit} className="space-y-3 bg-white dark:bg-black p-4 rounded border">
                    <SubjectFields data={data} errors={errors} setData={setData} classes={classes} teachers={teachers} />
                    <div className="flex gap-2 justify-end">
                        <Link href={`/admin/school/subjects/${item.id}`}>
                            <Button type="button" variant="outline">{t('Cancel')}</Button>
                        </Link>
                        <Button type="submit" disabled={processing}>{t('Update Subject')}</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
