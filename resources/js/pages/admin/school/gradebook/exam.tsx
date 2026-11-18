import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { BreadcrumbItem } from '@/types';
import { SaveBar, StudentPicker, formatDate, gradeInput } from '@/components/school/gradebook';

interface Row {
    student_id: number;
    name: string;
    score: number | string | null;
    grade: string | null;
    in_class: boolean;
}

interface Props {
    exam: {
        id: number;
        name: string;
        start_date: string | null;
        end_date: string | null;
        subject_id: number | null;
        subject_name: string | null;
        class_id: number | null;
        class_name: string | null;
    };
    rows: Row[];
    students: Array<{ id: number; name: string }>;
}

export default function ExamGradebook({ exam, rows: initialRows, students }: Readonly<Props>) {
    const { t } = useTranslation();
    const [rows, setRows] = useState<Row[]>(initialRows);
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const url = `/admin/school/exams/${exam.id}/grades`;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'School Management', href: '/admin/school' },
        { title: 'Gradebook', href: '/admin/school/gradebook' },
        { title: exam.name, href: url },
    ];

    const update = (index: number, change: Partial<Row>) => {
        setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...change } : r)));
        setDirty(true);
        setMessage(null);
    };

    const save = () => {
        router.put(
            url,
            {
                rows: rows.map((r) => ({
                    student_id: r.student_id,
                    score: r.score === '' || r.score === null ? null : Number(r.score),
                    grade: r.grade,
                })),
            },
            {
                preserveScroll: true,
                onStart: () => setSaving(true),
                onFinish: () => setSaving(false),
                onSuccess: (page) => {
                    setRows(page.props.rows as Row[]);
                    setDirty(false);
                    setErrors({});
                    setMessage(t('Grades saved.'));
                },
                onError: (errs) => setErrors(errs),
            },
        );
    };

    const dates = exam.end_date && exam.end_date !== exam.start_date
        ? `${formatDate(exam.start_date)} – ${formatDate(exam.end_date)}`
        : formatDate(exam.start_date);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('Grades')}: ${exam.name}`} />
            <div className="p-4 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">{exam.name}</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {exam.subject_name ? `${exam.subject_name} · ` : ''}
                            {exam.class_name ? `${exam.class_name} · ` : ''}
                            {dates}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/admin/school/gradebook" className="px-3 py-1 border rounded">{t('Back')}</Link>
                        <Link href={`/admin/school/exams/${exam.id}`} className="px-3 py-1 border rounded">{t('Exam Details')}</Link>
                    </div>
                </div>

                <div className="bg-white dark:bg-black p-4 rounded border space-y-4">
                    {!exam.class_id && (
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                            {exam.subject_id
                                ? t('This exam’s subject isn’t linked to a class, so no students are listed automatically. Link the subject to a class, or add students below.')
                                : t('This exam has no subject, so no students are listed automatically. Choose a subject on the exam’s edit page, or add students below.')}
                        </p>
                    )}

                    <StudentPicker
                        label={t('Add a student')}
                        students={students}
                        exclude={rows.map((r) => r.student_id)}
                        onAdd={(s) => {
                            setRows((prev) => [...prev, { student_id: s.id, name: s.name, score: null, grade: null, in_class: false }]);
                            setDirty(true);
                            setMessage(null);
                        }}
                    />

                    {rows.length === 0 ? (
                        <p className="text-sm text-gray-500">{t('No students to grade yet.')}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-3 py-2 text-start text-sm font-medium">{t('Student')}</th>
                                        <th className="px-3 py-2 text-start text-sm font-medium">{t('Score')}</th>
                                        <th className="px-3 py-2 text-start text-sm font-medium">{t('Grade')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, i) => (
                                        <tr key={row.student_id} className="border-t">
                                            <td className="px-3 py-2 text-sm font-medium whitespace-nowrap">
                                                <Link href={`/admin/school/students/${row.student_id}`} className="hover:underline">{row.name}</Link>
                                                {!row.in_class && exam.class_id && <span className="ms-2 text-xs text-gray-500">{t('Not in class')}</span>}
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    inputMode="numeric"
                                                    aria-label={`${t('Score')}: ${row.name}`}
                                                    aria-invalid={errors[`rows.${i}.score`] ? 'true' : undefined}
                                                    value={row.score ?? ''}
                                                    onChange={(e) => update(i, { score: e.target.value })}
                                                    className={gradeInput}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    aria-label={`${t('Grade')}: ${row.name}`}
                                                    aria-invalid={errors[`rows.${i}.grade`] ? 'true' : undefined}
                                                    value={row.grade ?? ''}
                                                    onChange={(e) => update(i, { grade: e.target.value })}
                                                    className={gradeInput}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <p className="text-xs text-gray-500">{t('Clearing both the score and the grade removes that student’s result.')}</p>

                    <SaveBar dirty={dirty} saving={saving} message={message} errorCount={Object.keys(errors).length} onSave={save} />
                </div>
            </div>
        </AppLayout>
    );
}
