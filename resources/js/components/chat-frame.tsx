import { useState, useEffect } from 'react';

interface ChatConfig {
    url: string;
    title: string;
}

interface ChatFrameProps {
    config: ChatConfig;
    className?: string;
}

export function ChatFrame({ config, className = '' }: ChatFrameProps) {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        // Check initial theme
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(isDark ? 'dark' : 'light');

        // Listen for theme changes
        const observer = new MutationObserver(() => {
            const isDark = document.documentElement.classList.contains('dark');
            setTheme(isDark ? 'dark' : 'light');
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className={`flex flex-col h-full ${className}`}>
            <iframe
                src={`${config.url}?theme=${theme}`}
                className="w-full h-full border-0"
                title={config.title}
            />
        </div>
    );
}
