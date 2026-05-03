import AppLayout from '@/layouts/app-layout';
import { ChatFrame } from '@/components/chat-frame';
import { type BreadcrumbItem } from '@/types';

interface ChatConfig {
    enabled: boolean;
    url: string;
    title: string;
}

interface ChatPageProps {
    chatConfig: ChatConfig;
}

export default function ChatPage({ chatConfig }: ChatPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: chatConfig.title, href: '/chat' },
    ];

    if (!chatConfig.enabled) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="p-6">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <p className="text-yellow-800 dark:text-yellow-200">
                            Chat is currently disabled. Please contact your administrator.
                        </p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="h-[calc(100vh-4rem)]">
                <ChatFrame 
                    config={{
                        url: chatConfig.url,
                        title: chatConfig.title,
                    }}
                />
            </div>
        </AppLayout>
    );
}
