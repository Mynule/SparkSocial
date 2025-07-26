import { Breadcrumbs } from './breadcrumbs';
import { SidebarTrigger } from './ui/sidebar';
import AppearanceToggle from './appearance-toggle';

//top line hint

const topNavItems = [
    {
        title: 'News',
        url: '/dashboard',
    },
    {
        title: 'Following',
       // url: `/user/${user.username}/following`,
    },
    {
        title: 'Liked posts',
        url: '#',
    },
]

export function AppSidebarHeader({ breadcrumbs = [] }) {
    return (
        <header className="border-sidebar-border/50 flex justify-between h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4
            sticky top-0 z-10 bg-background">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-3 lg:hidden md:hidden"/>
                <Breadcrumbs breadcrumbs={breadcrumbs}/>
            </div>
            <div>
                <AppearanceToggle className="justify-center p-2.5"/>
            </div>
        </header>
    );
}


