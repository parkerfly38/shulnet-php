import { MessageCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function AdminChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
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
        <>
            {/* Toggle Button */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-50"
                    size="icon"
                >
                    <MessageCircle className="h-5 w-5" />
                </Button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-4 right-4 w-[400px] h-[800px] bg-background border border-border rounded-lg shadow-2xl flex flex-col z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 border-b border-border">
                        <h3 className="font-semibold text-sm">Chat</h3>
                        <Button
                            onClick={() => setIsOpen(false)}
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Iframe Content */}
                    <div className="flex-1 overflow-hidden">
                        <iframe
                            src={`http://localhost:5001?theme=${theme}`}
                            className="w-full h-full border-0"
                            title="Admin Chat"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
