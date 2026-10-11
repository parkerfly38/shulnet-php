import { useTranslation } from '@/hooks/use-translation';

export default function AppLogo() {
    const { t } = useTranslation();
    return (
        <img 
            src="/shulnet-logo.png" 
            alt={t('ShulNET Logo')} 
            className="w-64 h-auto"
        />
    );
}
