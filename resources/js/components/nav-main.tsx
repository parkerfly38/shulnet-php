import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { isNavItemActive } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function NavMain({
    items = [],
    isActiveSection = false,
}: {
    items: NavItem[];
    isActiveSection?: boolean;
}) {
    const page = usePage();
    const { t } = useTranslation();
    const groupTitle = items[0]?.groupTitle;
    const [isOpen, setIsOpen] = useState(isActiveSection);

    return (
        <Collapsible open={groupTitle ? isOpen : true} onOpenChange={setIsOpen}>
            <SidebarGroup className="px-2 py-0">
                {groupTitle && (
                    <CollapsibleTrigger asChild>
                        <SidebarGroupLabel asChild>
                            <button
                                type="button"
                                className="w-full cursor-pointer justify-between"
                                aria-label={`${isOpen ? t('Collapse') : t('Expand')} ${t(groupTitle)}`}
                            >
                                <span>{t(groupTitle)}</span>
                                <ChevronDown
                                    className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                        </SidebarGroupLabel>
                    </CollapsibleTrigger>
                )}
                <CollapsibleContent>
                    <SidebarMenu>
                        {items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isNavItemActive(
                                        page.url,
                                        item.href,
                                    )}
                                    tooltip={{ children: t(item.title) }}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{t(item.title)}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </CollapsibleContent>
            </SidebarGroup>
        </Collapsible>
    );
}
