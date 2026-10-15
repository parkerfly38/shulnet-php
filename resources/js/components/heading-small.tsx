import { useTranslation } from '@/hooks/use-translation';
export default function HeadingSmall({
    title,
    description,
}: {
    title: string;
    description?: string;
}) {
    const { t } = useTranslation();
    return (
        <header>
            <h3 className="mb-0.5 text-base font-medium">{title ? t(title) : title}</h3>
            {description && (
                <p className="text-sm text-muted-foreground">{description ? t(description) : description}</p>
            )}
        </header>
    );
}
