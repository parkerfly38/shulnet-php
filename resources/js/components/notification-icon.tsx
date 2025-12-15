import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function NotificationIcon() {
    const { auth } = usePage().props as any;
    const unseenCount = auth.unseenNotifications || 0;

    const handleMarkAllSeen = () => {
        router.post('/admin/notifications/mark-seen');
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {unseenCount > 0 && (
                        <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center min-w-[1.25rem]"
                        >
                            {unseenCount > 99 ? '99+' : unseenCount}
                        </Badge>
                    )}
                    <span className="sr-only">
                        {unseenCount > 0 ? `${unseenCount} unseen notifications` : 'No unseen notifications'}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 text-sm font-medium">
                    Notifications
                    {unseenCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {unseenCount}
                        </Badge>
                    )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/admin/notes?assigned=true" className="w-full">
                        View My Notes
                    </Link>
                </DropdownMenuItem>
                {unseenCount > 0 && (
                    <DropdownMenuItem onClick={handleMarkAllSeen}>
                        <Check className="h-4 w-4 mr-2" />
                        Mark All as Seen
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}