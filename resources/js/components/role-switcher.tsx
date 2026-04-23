import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type RoleSwitch } from '@/types';
import { router } from '@inertiajs/react';
import { Check, ChevronDown, UserCog } from 'lucide-react';
import { useState } from 'react';

interface RoleSwitcherProps {
    roleSwitch: RoleSwitch;
    className?: string;
    onRoleSwitch?: () => void;
}

export function RoleSwitcher({ roleSwitch, className, onRoleSwitch }: RoleSwitcherProps) {
    const [isLoading, setIsLoading] = useState(false);

    if (!roleSwitch?.enabled || roleSwitch.roles.length <= 1) {
        return null;
    }

    const handleRoleSwitch = (roleValue: string) => {
        if (roleValue === roleSwitch.activeRole || isLoading) {
            return;
        }

        setIsLoading(true);
        
        // Call the callback to close parent menu first
        if (onRoleSwitch) {
            onRoleSwitch();
        }

        router.post(
            '/switch-role',
            { role: roleValue },
            {
                preserveScroll: false,
                preserveState: false,
                onFinish: () => {
                    setIsLoading(false);
                },
            }
        );
    };

    const activeRoleData = roleSwitch.roles.find(
        (r) => r.value === roleSwitch.activeRole
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={className}
                    disabled={isLoading}
                >
                    <UserCog className="mr-2 h-4 w-4" />
                    {activeRoleData?.label || 'Switch Role'}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Switch Dashboard</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {roleSwitch.roles.map((role) => (
                    <DropdownMenuItem
                        key={role.value}
                        onClick={() => handleRoleSwitch(role.value)}
                        disabled={isLoading}
                        className="flex items-center justify-between cursor-pointer"
                    >
                        <span>{role.label}</span>
                        {role.value === roleSwitch.activeRole && (
                            <Check className="h-4 w-4 text-primary" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
