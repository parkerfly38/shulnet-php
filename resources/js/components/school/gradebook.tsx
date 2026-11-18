import { useTranslation } from '@/hooks/use-translation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function formatDate(value: string | null | undefined) {
    if (!value) return '—';
    const d = new Date(`${value.slice(0, 10)}T00:00:00`);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

export const gradeInput =
    'w-24 rounded border p-1 text-sm bg-white dark:bg-black aria-[invalid=true]:border-red-500';

/**
 * Picks a student who isn't on the sheet yet and adds them as a new row.
 */
export function StudentPicker({
    students,
    exclude,
    onAdd,
    label,
}: Readonly<{
    students: Array<{ id: number; name: string }>;
    exclude: number[];
    onAdd: (student: { id: number; name: string }) => void;
    label: string;
}>) {
    const { t } = useTranslation();
    const [selected, setSelected] = useState('');
    const available = students.filter((s) => !exclude.includes(s.id));

    return (
        <div className="flex flex-wrap items-end gap-2">
            <div>
                <label htmlFor="add-student" className="block text-sm font-medium">{label}</label>
                <select
                    id="add-student"
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                    className="min-w-64 rounded border p-2 bg-white dark:bg-black"
                    disabled={available.length === 0}
                >
                    <option value="">{available.length ? t('Choose a student…') : t('Every student is already listed')}</option>
                    {available.map((s) => (
                        <option key={s.id} value={String(s.id)}>{s.name}</option>
                    ))}
                </select>
            </div>
            <Button
                type="button"
                variant="outline"
                disabled={!selected}
                onClick={() => {
                    const student = available.find((s) => String(s.id) === selected);
                    if (student) onAdd(student);
                    setSelected('');
                }}
            >
                {t('Add')}
            </Button>
        </div>
    );
}

/**
 * Save button with an unsaved-changes note and the result of the last save.
 * Also warns before leaving the page with unsaved grades.
 */
export function SaveBar({
    dirty,
    saving,
    message,
    errorCount,
    onSave,
}: Readonly<{ dirty: boolean; saving: boolean; message: string | null; errorCount: number; onSave: () => void }>) {
    const { t } = useTranslation();

    useEffect(() => {
        if (!dirty) return;
        const warn = (e: BeforeUnloadEvent) => e.preventDefault();
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [dirty]);

    return (
        <div className="flex flex-wrap items-center justify-end gap-3">
            {errorCount > 0 && (
                <span role="alert" className="text-sm text-red-600">
                    {t('Some grades could not be saved. Check the highlighted cells.')}
                </span>
            )}
            {errorCount === 0 && dirty && <span className="text-sm text-amber-600">{t('Unsaved changes')}</span>}
            {errorCount === 0 && !dirty && message && <span className="text-sm text-green-700 dark:text-green-400">{message}</span>}
            <Button type="button" onClick={onSave} disabled={saving || !dirty}>
                {saving ? t('Saving…') : t('Save Grades')}
            </Button>
        </div>
    );
}
