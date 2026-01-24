import { SidebarProvider } from '@/components/ui/sidebar';
import { GlobalSearchDialog } from '@/components/global-search-dialog';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import * as React from 'react';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const page = usePage<SharedData>();
    const isOpen = page.props.sidebarOpen;
    const [searchOpen, setSearchOpen] = React.useState(false);

    // Keyboard shortcut for search (Cmd/Ctrl + K)
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setSearchOpen((open) => !open);
            }
        };

        const handleOpenSearch = () => {
            setSearchOpen(true);
        };

        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('open-search', handleOpenSearch);
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('open-search', handleOpenSearch);
        };
    }, []);

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">
                {children}
                <GlobalSearchDialog
                    open={searchOpen}
                    onOpenChange={setSearchOpen}
                />
            </div>
        );
    }

    return (
        <SidebarProvider defaultOpen={isOpen}>
            {children}
            <GlobalSearchDialog
                open={searchOpen}
                onOpenChange={setSearchOpen}
            />
        </SidebarProvider>
    );
}
