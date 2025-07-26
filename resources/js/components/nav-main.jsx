import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar.jsx';
import { Link, usePage } from '@inertiajs/react';
import {Badge} from "../components/ui/badge.jsx";

export function NavMain({ items = [] }) {
    const page = usePage();
    return (<SidebarGroup className="px-2 py-2">
            <SidebarMenu>
                {items.map((item) => (<SidebarMenuItem key={item.title + item.url}>
                        <SidebarMenuButton size="lg" asChild isActive={item.url === page.url} className="text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100 text-[16px]">
                            <Link href={item.url} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                                {item.count && item.count !== 0 ? (<Badge className="bg-neutral-500 dark:bg-neutral-300">{item.count}</Badge>) : ''}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>))}
            </SidebarMenu>
        </SidebarGroup>);
}

