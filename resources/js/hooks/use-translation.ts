import { usePage } from '@inertiajs/react';

type Replacements = Record<string, string | number>;

export interface LocaleOption {
    code: string;
    name: string;
    dir: 'ltr' | 'rtl';
}

interface I18nProps {
    locale: string;
    direction: 'ltr' | 'rtl';
    locales: LocaleOption[];
    translations: Record<string, string>;
}

export function useTranslation() {
    const { locale, direction, locales, translations } = usePage<
        I18nProps & { [key: string]: unknown }
    >().props;

    // Keys are the English strings; missing keys fall back to the key itself.
    const t = (key: string, replacements: Replacements = {}): string => {
        let text = translations?.[key] ?? key;

        for (const [name, value] of Object.entries(replacements)) {
            text = text.replaceAll(`:${name}`, String(value));
        }

        return text;
    };

    return { t, locale, direction, locales, isRtl: direction === 'rtl' };
}
