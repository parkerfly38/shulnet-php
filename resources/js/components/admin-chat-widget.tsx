import { MessageCircle, X, Maximize2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { router, usePage } from '@inertiajs/react';
import { type ChatConfig } from '@/types';

export function AdminChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const { chatConfig } = usePage().props as { chatConfig?: ChatConfig };

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(isDark ? 'dark' : 'light');

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

    if (!chatConfig?.enabled) {
        return null;
    }

    const openFullScreen = () => {
        setIsOpen(false);
        router.visit('/chat');
    };

    return (
        <>
            {/* Toggle Button with subtle ping ring */}
            {!isOpen && (
                <span className="fixed bottom-4 right-4 z-50 flex h-12 w-12">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-10" />
                    <Button
                        onClick={() => setIsOpen(true)}
                        className="relative h-12 w-12 rounded-full shadow-lg"
                        size="icon"
                        title={`Open ${chatConfig.title}`}
                    >
                        <MessageCircle className="h-5 w-5" />
                    </Button>
                </span>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-4 right-4 w-96 h-[520px] bg-background border border-border rounded-lg shadow-2xl flex flex-col z-50">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                        <h3 className="font-semibold text-sm">{chatConfig.title}</h3>
                        <div className="flex items-center gap-1">
                            <Button
                                onClick={openFullScreen}
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                title="Open full screen"
                            >
                                <Maximize2 className="h-4 w-4" />
                            </Button>
                            <Button
                                onClick={() => setIsOpen(false)}
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                title="Close"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <iframe
                            src={`${chatConfig.url}?theme=${theme}`}
                            className="w-full h-full border-0"
                            title={chatConfig.title}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
