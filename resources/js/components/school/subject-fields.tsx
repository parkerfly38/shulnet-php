import { useTranslation } from '@/hooks/use-translation';

export interface SubjectFormData {
    name: string;
    subject_code: string;
    description: string;
    books: string;
    class_id: string;
    teacher_id: string;
}

export interface SubjectFormOptions {
    classes: Array<{ id: number; name: string }>;
    teachers: Array<{ id: number; first_name: string; last_name: string }>;
}

interface Props extends SubjectFormOptions {
    data: SubjectFormData;
    errors: Partial<Record<keyof SubjectFormData, string>>;
    setData: (field: keyof SubjectFormData, value: string) => void;
}

const input = 'w-full rounded border p-2 bg-white dark:bg-black';

/**
 * The fields shared by the create and edit subject pages, styled like the other school forms.
 */
export default function SubjectFields({ data, errors, setData, classes, teachers }: Readonly<Props>) {
    const { t } = useTranslation();

    const error = (field: keyof SubjectFormData) =>
        errors[field] ? <p className="mt-1 text-sm text-red-600">{errors[field]}</p> : null;

    return (
        <>
            <div className="flex flex-col gap-3 md:flex-row">
                <div className="flex-1">
                    <label htmlFor="name" className="block text-sm font-medium">{t('Name')} *</label>
                    <input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className={input} required />
                    {error('name')}
                </div>
                <div className="md:w-48">
                    <label htmlFor="subject_code" className="block text-sm font-medium">{t('Subject Code')}</label>
                    <input id="subject_code" value={data.subject_code} onChange={(e) => setData('subject_code', e.target.value)} className={input} placeholder="e.g. HEB-101" />
                    {error('subject_code')}
                </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
                <div className="flex-1">
                    <label htmlFor="class_id" className="block text-sm font-medium">{t('Class')}</label>
                    <select id="class_id" value={data.class_id} onChange={(e) => setData('class_id', e.target.value)} className={input}>
                        <option value="">{t('No class')}</option>
                        {classes.map((c) => (
                            <option key={c.id} value={String(c.id)}>{c.name}</option>
                        ))}
                    </select>
                    {error('class_id')}
                </div>
                <div className="flex-1">
                    <label htmlFor="teacher_id" className="block text-sm font-medium">{t('Teacher')}</label>
                    <select id="teacher_id" value={data.teacher_id} onChange={(e) => setData('teacher_id', e.target.value)} className={input}>
                        <option value="">{t('No teacher')}</option>
                        {teachers.map((tch) => (
                            <option key={tch.id} value={String(tch.id)}>{tch.first_name} {tch.last_name}</option>
                        ))}
                    </select>
                    {error('teacher_id')}
                </div>
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium">{t('Description')}</label>
                <textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} className={input} rows={3} />
                {error('description')}
            </div>

            <div>
                <label htmlFor="books" className="block text-sm font-medium">{t('Books')}</label>
                <textarea id="books" value={data.books} onChange={(e) => setData('books', e.target.value)} className={input} rows={3} placeholder={t('One per line')} />
                {error('books')}
            </div>
        </>
    );
}

