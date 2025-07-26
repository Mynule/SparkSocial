import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from './ui/sidebar';
import { UserInfo } from './user-info';
import { UserMenuContent } from './user-menu-content';
import { useIsMobile } from '../hooks/use-mobile';
import { usePage, Link } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';

export function NavUser() {
    const { auth } = usePage().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    return (<SidebarMenu>
        <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" className="text-sidebar-accent-foreground hover:bg-sidebar-accent py-9">
                <Link href="/user" className="w-full flex items-center">
                    <UserInfo user={auth.user} />
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
            {/*<SidebarMenuItem>*/}
            {/*    <DropdownMenu>*/}
            {/*        <DropdownMenuTrigger asChild>*/}
            {/*            <SidebarMenuButton size="lg" className="text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent group">*/}
            {/*                <UserInfo user={auth.user}/>*/}
            {/*                /!*<ChevronsUpDown className="ml-auto size-4"/>*!/*/}
            {/*            </SidebarMenuButton>*/}
            {/*        </DropdownMenuTrigger>*/}
            {/*        <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg" align="end" side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}>*/}
            {/*            <UserMenuContent user={auth.user}/>*/}
            {/*        </DropdownMenuContent>*/}
            {/*    </DropdownMenu>*/}
            {/*</SidebarMenuItem>*/}
        </SidebarMenu>);
}

