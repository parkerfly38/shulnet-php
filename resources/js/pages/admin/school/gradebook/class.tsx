import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { BreadcrumbItem } from '@/types';
import { Trash2 } from 'lucide-react';
import { SaveBar, StudentPicker, gradeInput } from '@/components/school/gradebook';

interface Row {
    student_id: number;
    name: string;
    grade: string | null;
    subjects: Record<string, string | null>;
    unsaved?: boolean;
}

interface Props {
    schoolClass: { id: number; name: string; teacher_name: string | null };
    subjects: Array<{ id: number; name: string; subject_code: string | null }>;
    rows: Row[];
    students: Array<{ id: number; name: string }>;
}

export default function ClassGradebook({ schoolClass, subjects, rows: initialRows, students }: Readonly<Props>) {
    const { t } = useTranslation();
    const [rows, setRows] = useState<Row[]>(initialRows);
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const url = `/admin/school/class-definitions/${schoolClass.id}/gradebook`;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'School Management', href: '/admin/school' },
        { title: 'Gradebook', href: '/admin/school/gradebook' },
        { title: schoolClass.name, href: url },
    ];

    const update = (index: number, change: Partial<Row>) => {
        setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...change } : r)));
        setDirty(true);
        setMessage(null);
    };

    const reload = (page: { props: Record<string, unknown> }) => {
        setRows(page.props.rows as Row[]);
        setDirty(false);
        setErrors({});
    };

    const save = () => {
        router.put(
            url,
            { rows: rows.map((r) => ({ student_id: r.student_id, grade: r.grade, subjects: r.subjects })) },
            {
                preserveScroll: true,
                onStart: () => setSaving(true),
                onFinish: () => setSaving(false),
                onSuccess: (page) => {
                    reload(page);
                    setMessage(t('Grades saved.'));
                },
                onError: (errs) => setErrors(errs),
            },
        );
    };

    const remove = (index: number) => {
        const row = rows[index];
        if (row.unsaved) {
            setRows((prev) => prev.filter((_, i) => i !== index));
            return;
        }
        const question = dirty
            ? t('Remove :name from this class? Your other unsaved changes will be lost.', { name: row.name })
            : t('Remove :name from this class? Their subject grades are kept.', { name: row.name });
        if (!window.confirm(question)) return;
        router.delete(`${url}/students/${row.student_id}`, { preserveScroll: true, onSuccess: reload });
    };

    const invalid = (key: string) => (errors[key] ? 'true' : undefined);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('Gradebook')}: ${schoolClass.name}`} />
            <div className="p-4 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">{schoolClass.name}</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {schoolClass.teacher_name ? `${t('Teacher')}: ${schoolClass.teacher_name} · ` : ''}
                            {t(':count students', { count: rows.length })}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/admin/school/gradebook" className="px-3 py-1 border rounded">{t('Back')}</Link>
                        <Link href={`/admin/school/class-definitions/${schoolClass.id}`} className="px-3 py-1 border rounded">{t('Class Details')}</Link>
                    </div>
                </div>

                <div className="bg-white dark:bg-black p-4 rounded border space-y-4">
                    <StudentPicker
                        label={t('Add a student to this class')}
                        students={students}
                        exclude={rows.map((r) => r.student_id)}
                        onAdd={(s) => {
                            setRows((prev) => [...prev, { student_id: s.id, name: s.name, grade: null, subjects: {}, unsaved: true }]);
                            setDirty(true);
                            setMessage(null);
                        }}
                    />

                    {subjects.length === 0 && (
                        <p className="text-sm text-gray-500">
                            {t('No subjects are linked to this class. Choose this class on a subject’s edit page to grade that subject here.')}
                        </p>
                    )}

                    {rows.length === 0 ? (
                        <p className="text-sm text-gray-500">{t('No students are enrolled yet. Add students above, then save.')}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-3 py-2 text-start text-sm font-medium">{t('Student')}</th>
                                        <th className="px-3 py-2 text-start text-sm font-medium">{t('Class Grade')}</th>
                                        {subjects.map((s) => (
                                            <th key={s.id} className="px-3 py-2 text-start text-sm font-medium whitespace-nowrap">
                                                {s.name}
                                                {s.subject_code && <span className="ms-1 text-xs text-gray-500">{s.subject_code}</span>}
                                            </th>
                                        ))}
                                        <th className="px-3 py-2"><span className="sr-only">{t('Remove')}</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, i) => (
                                        <tr key={row.student_id} className="border-t">
                                            <td className="px-3 py-2 text-sm font-medium whitespace-nowrap">
                                                <Link href={`/admin/school/students/${row.student_id}`} className="hover:underline">{row.name}</Link>
                                                {row.unsaved && <span className="ms-2 text-xs text-amber-600">{t('New')}</span>}
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    aria-label={`${t('Class Grade')}: ${row.name}`}
                                                    aria-invalid={invalid(`rows.${i}.grade`)}
                                                    value={row.grade ?? ''}
                                                    onChange={(e) => update(i, { grade: e.target.value })}
                                                    className={gradeInput}
                                                />
                                            </td>
                                            {subjects.map((s) => (
                                                <td key={s.id} className="px-3 py-2">
                                                    <input
                                                        aria-label={`${s.name}: ${row.name}`}
                                                        aria-invalid={invalid(`rows.${i}.subjects.${s.id}`)}
                                                        value={row.subjects[s.id] ?? ''}
                                                        onChange={(e) => update(i, { subjects: { ...row.subjects, [s.id]: e.target.value } })}
                                                        className={gradeInput}
                                                    />
                                                </td>
                                            ))}
                                            <td className="px-3 py-2 text-end">
                                                <button
                                                    type="button"
                                                    onClick={() => remove(i)}
                                                    className="p-1 text-red-600 hover:text-red-700"
                                                    title={t('Remove from class')}
                                                    aria-label={`${t('Remove from class')}: ${row.name}`}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <SaveBar dirty={dirty} saving={saving} message={message} errorCount={Object.keys(errors).length} onSave={save} />
                </div>
            </div>
        </AppLayout>
    );
}
