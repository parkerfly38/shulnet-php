import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { MessageCircle, Send, X } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type SharedData } from '@/types';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export function AdminChatWidget() {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = Array.isArray(auth?.user?.roles) && auth.user.roles.includes('admin');

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    if (!isAdmin) {
        return null;
    }

    const send = async (e: FormEvent) => {
        e.preventDefault();
        const message = input.trim();
        if (!message || loading) return;

        setMessages((prev) => [...prev, { role: 'user', content: message }]);
        setInput('');
        setLoading(true);

        try {
            const { data } = await axios.post('/admin/chat', {
                message,
                conversation_id: conversationId,
            });
            setConversationId(data.conversation_id);
            setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 end-4 z-50 h-12 w-12 rounded-full shadow-lg"
                size="icon"
                title="Open assistant"
            >
                <MessageCircle className="h-5 w-5" />
            </Button>
        );
    }

    return (
        <div className="fixed bottom-4 end-4 z-50 flex h-[520px] w-96 flex-col rounded-lg border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <h3 className="text-sm font-semibold">Assistant</h3>
                <Button onClick={() => setIsOpen(false)} variant="ghost" size="icon" className="h-6 w-6" title="Close">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
                {messages.length === 0 && (
                    <p className="text-muted-foreground">
                        Ask about members, yahrzeits, events, invoices or finances.
                    </p>
                )}
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 ${
                            m.role === 'user'
                                ? 'ms-auto bg-primary text-primary-foreground'
                                : 'bg-muted'
                        }`}
                    >
                        {m.content}
                    </div>
                ))}
                {loading && <div className="text-muted-foreground">Thinking…</div>}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={send} className="flex gap-2 border-t border-border p-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message…"
                    disabled={loading}
                />
                <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
}
