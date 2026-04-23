import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { RoleSwitcher } from '@/components/role-switcher';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import { type User, type RoleSwitch } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';

interface UserMenuContentProps {
    user: User;
    onClose?: () => void;
}

export function UserMenuContent({ user, onClose }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const { props } = usePage();
    const roleSwitch = (props as { roleSwitch?: RoleSwitch }).roleSwitch;

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    const handleClose = () => {
        cleanup();
        if (onClose) {
            onClose();
        }
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {roleSwitch?.enabled && (
                <>
                    <div className="px-2 py-1.5">
                        <RoleSwitcher 
                            roleSwitch={roleSwitch} 
                            className="w-full" 
                            onRoleSwitch={handleClose}
                        />
                    </div>
                    <DropdownMenuSeparator />
                </>
            )}
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full"
                        href={edit()}
                        as="button"
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
