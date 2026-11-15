import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import SubjectFields, { type SubjectFormData, type SubjectFormOptions } from '@/components/school/subject-fields';
import type { FormEvent } from 'react';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'School Management', href: '/admin/school' },
    { title: 'Subjects', href: '/admin/school/subjects' },
    { title: 'Create', href: '/admin/school/subjects/create' },
];

export default function SubjectsCreate({ classes, teachers }: Readonly<SubjectFormOptions>) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm<SubjectFormData>({
        name: '',
        subject_code: '',
        description: '',
        books: '',
        class_id: '',
        teacher_id: '',
    });

    // The API redirects Inertia requests to the new subject's page.
    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/api/admin/subjects');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Create Subject')} />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">{t('Create Subject')}</h1>
                <form onSubmit={submit} className="space-y-3 bg-white dark:bg-black p-4 rounded border">
                    <SubjectFields data={data} errors={errors} setData={setData} classes={classes} teachers={teachers} />
                    <div className="flex gap-2 justify-end">
                        <Link href="/admin/school/subjects">
                            <Button type="button" variant="outline">{t('Cancel')}</Button>
                        </Link>
                        <Button type="submit" disabled={processing}>{t('Create Subject')}</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
