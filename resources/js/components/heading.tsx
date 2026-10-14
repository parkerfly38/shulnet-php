import { useTranslation } from '@/hooks/use-translation';
export default function Heading({
    title,
    description,
}: {
    title: string;
    description?: string;
}) {
    const { t } = useTranslation();
    return (
        <div className="mb-8 space-y-0.5">
            <h2 className="text-xl font-semibold tracking-tight">{title ? t(title) : title}</h2>
            {description && (
                <p className="text-sm text-muted-foreground">{description ? t(description) : description}</p>
            )}
        </div>
    );
}
