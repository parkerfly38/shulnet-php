import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { ClipboardList } from 'lucide-react';
import { formatDate } from '@/components/school/gradebook';

interface ClassRow {
    id: number;
    name: string;
    teacher_name: string | null;
    students_count: number;
    subjects_count: number;
}

interface ExamRow {
    id: number;
    name: string;
    subject_name: string | null;
    start_date: string | null;
    graded_count: number;
}

interface Props {
    classes: ClassRow[];
    exams: ExamRow[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'School Management', href: '/admin/school' },
    { title: 'Gradebook', href: '/admin/school/gradebook' },
];

const th = 'px-4 py-2 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400';
const td = 'px-4 py-2 text-sm';

export default function GradebookIndex({ classes, exams }: Readonly<Props>) {
    const { t } = useTranslation();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Gradebook')} />
            <div className="p-4 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">{t('Gradebook')}</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('Open a class to manage its roster and enter class and subject grades, or an exam to enter scores.')}
                    </p>
                </div>

                <section className="bg-white dark:bg-black rounded border">
                    <h2 className="px-4 pt-4 text-lg font-semibold">{t('Classes')}</h2>
                    {classes.length === 0 ? (
                        <p className="p-4 text-sm text-gray-500">
                            {t('No classes yet.')}{' '}
                            <Link href="/admin/school/class-definitions/create" className="text-blue-600 hover:underline">{t('Create a class')}</Link>
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full mt-2">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className={th}>{t('Class')}</th>
                                        <th className={th}>{t('Teacher')}</th>
                                        <th className={th}>{t('Students')}</th>
                                        <th className={th}>{t('Subjects')}</th>
                                        <th className={th}><span className="sr-only">{t('Actions')}</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classes.map((c) => (
                                        <tr key={c.id} className="border-t">
                                            <td className={`${td} font-medium`}>{c.name}</td>
                                            <td className={td}>{c.teacher_name ?? '—'}</td>
                                            <td className={td}>{c.students_count}</td>
                                            <td className={td}>{c.subjects_count}</td>
                                            <td className={`${td} text-end`}>
                                                <Link href={`/admin/school/class-definitions/${c.id}/gradebook`} className="inline-flex items-center gap-1 px-3 py-1 border rounded">
                                                    <ClipboardList className="h-4 w-4" /> {t('Open Gradebook')}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="bg-white dark:bg-black rounded border">
                    <h2 className="px-4 pt-4 text-lg font-semibold">{t('Exams')}</h2>
                    {exams.length === 0 ? (
                        <p className="p-4 text-sm text-gray-500">
                            {t('No exams yet.')}{' '}
                            <Link href="/admin/school/exams/create" className="text-blue-600 hover:underline">{t('Schedule an exam')}</Link>
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full mt-2">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className={th}>{t('Exam')}</th>
                                        <th className={th}>{t('Subject')}</th>
                                        <th className={th}>{t('Date')}</th>
                                        <th className={th}>{t('Graded')}</th>
                                        <th className={th}><span className="sr-only">{t('Actions')}</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exams.map((e) => (
                                        <tr key={e.id} className="border-t">
                                            <td className={`${td} font-medium`}>{e.name}</td>
                                            <td className={td}>{e.subject_name ?? '—'}</td>
                                            <td className={td}>{formatDate(e.start_date)}</td>
                                            <td className={td}>{e.graded_count}</td>
                                            <td className={`${td} text-end`}>
                                                <Link href={`/admin/school/exams/${e.id}/grades`} className="inline-flex items-center gap-1 px-3 py-1 border rounded">
                                                    <ClipboardList className="h-4 w-4" /> {t('Enter Grades')}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
