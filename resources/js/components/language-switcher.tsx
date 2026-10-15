import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/hooks/use-translation';
import { router } from '@inertiajs/react';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
    const { t, locale, locales } = useTranslation();

    const change = (code: string) =>
        router.patch(
            '/settings/locale',
            { locale: code },
            { onSuccess: () => window.location.reload() },
        );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t('Language')}>
                    <Languages className="size-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {locales.map((l) => (
                    <DropdownMenuItem
                        key={l.code}
                        onClick={() => change(l.code)}
                        className={l.code === locale ? 'font-semibold' : ''}
                    >
                        {l.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
