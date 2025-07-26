import AppearanceToggle from '@/components/appearance-toggle.jsx';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu.jsx';
import { Input } from '@/components/ui/input.jsx';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useInitials } from '@/hooks/use-initials.jsx';
import { cn } from '@/lib/utils';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Bookmark,
    Check,
    Folder,
    FolderHeart,
    Hash,
    Home,
    List,
    LogOut,
    Mail,
    Menu,
    MessagesSquareIcon,
    Repeat,
    Search,
    Settings,
    User,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getProfileImageUrl } from '../lib/utils.js';
import AppLogo from './app-logo';

const activeItemStyles = 'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

export function AppHeader({ breadcrumbs = [] }) {
    const page = usePage();
    const { translations } = usePage().props;
    const { auth } = page.props;
    const user = auth?.user;
    const getInitials = useInitials();
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

    useEffect(() => {
        fetchUnreadNotificationsCount().catch((error) => console.error(error));
        fetchUnreadMessagesCount().catch((error) => console.error(error));
    }, []);

    const fetchUnreadNotificationsCount = async () => {
        try {
            const response = await fetch('/notifications/unread-count');
            const data = await response.json();
            setUnreadNotificationsCount(data.unread_count);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchUnreadMessagesCount = async () => {
        try {
            const response = await fetch('/chat/user-chat/messages/unread-count');
            const data = await response.json();
            setUnreadMessagesCount(data.unread_count);
        } catch (error) {
            console.error(error);
        }
    };

    window.Echo.private(`notifications.${user.id}`)
        .listen('NotificationCreated', (e) => {
            setUnreadNotificationsCount(unreadNotificationsCount + 1);
        })
        .listen('NotificationIsReadChange', (e) => {
            if (e.operation === 'read') {
                setUnreadNotificationsCount(unreadNotificationsCount - 1);
            } else if (e.operation === 'unread') {
                setUnreadNotificationsCount(unreadNotificationsCount + 1);
            } else if (e.operation === 'allRead') {
                setUnreadNotificationsCount(0);
            } else if (e.operation === 'allUnread') {
                fetchUnreadNotificationsCount().catch((error) => console.error(error));
            }
        });

    if (!user) return null;

    const mainNavItems = [
        {
            title: translations['News'],
            url: '/dashboard',
        },
        {
            title: translations['Following'],
            url: `/user/following-posts`,
        },
        {
            title: translations['Liked'],
            url: '/user/liked',
        },
    ];

    const sideBarNavItems = [
        {
            title: translations['Dashboard'],
            url: '/dashboard',
            icon: Home,
        },
        {
            title: translations['Following'],
            url: `/user/following-posts`,
            icon: List,
        },
        {
            title: translations['Liked'],
            url: '/user/liked',
            icon: FolderHeart,
        },
        {
            title: translations['Everyone chat'],
            url: `/chat/everyone`,
            icon: MessagesSquareIcon,
        },
        {
            title: translations['User chats'],
            url: `/chat/user-chats`,
            icon: MessagesSquareIcon,
            count: unreadMessagesCount,
        },
        {
            title: translations['Friends'],
            url: `/user/friends`,
            icon: Users,
        },
        {
            title: translations['All users'],
            url: '/dashboard/users',
            icon: Users,
        },
        {
            title: translations['Notifications'],
            url: '/user/notifications',
            icon: Mail,
            count: unreadNotificationsCount,
        },
        {
            title: translations['Favorites'],
            url: '/user/favorites',
            icon: Bookmark,
        },
        {
            title: translations['Reposts'],
            url: '/user/reposts',
            icon: Repeat,
        },
        {
            title: translations['Popular hashtags'],
            url: '/show-popular-hashtags',
            icon: Hash,
        },
        {
            title: translations['Profile'],
            url: user.username ? `/user/${user.username}` : '/user',
            icon: User,
        },
        {
            title: translations['Settings'],
            url: '/settings/profile',
            icon: Settings,
        },
    ];

    const onKeyDownSearch = async (e) => {
        if (e.code === 'Enter') {
            const searchText = e.currentTarget.value;
            router.get(`/user/search/${searchText}`, { sort: 'newest' }, { preserveScroll: true });
        }
    };

    const handleLogout = () => {
        router.post(`/logout`);
    };

    return (
        <>
            <div className="border-sidebar-border/80 fixed top-0 left-0 z-50 w-full border-b bg-white dark:bg-neutral-950">
                <div className="mx-4 flex h-16">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="Avatar my-4 mr-2.5 -ml-1 h-9 w-9 hover:bg-gray-300 dark:hover:bg-neutral-700"
                                >
                                    <Menu className="h-9 w-9" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="bg-sidebar flex h-full w-64 flex-col items-stretch justify-between gap-0 pl-5">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <SheetHeader className="flex justify-start p-0 pt-3 pr-10 text-left">
                                    <div className="-ml-2.5 flex min-w-0 items-center gap-1">
                                        {' '}
                                        {/* min-w-0 to allow flex child truncation */}
                                        <Link href={user.username ? `/user/${user.username}` : '/user'} prefetch>
                                            <Avatar className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
                                                <AvatarImage src={getProfileImageUrl(user)} alt={user.name} />
                                                <AvatarFallback className="rounded-lg bg-gray-200 text-black dark:bg-gray-700 dark:text-white">
                                                    {getInitials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Link>
                                        <Link href={user.username ? `/user/${user.username}` : '/user'} prefetch className="ml-2 min-w-0 flex-1">
                                            <div className="grid text-left leading-tight">
                                                <div className="flex min-w-0 items-center gap-1">
                                                    <span className="max-w-full truncate text-[14px] text-gray-700 dark:text-neutral-300">
                                                        @{user.username}
                                                    </span>
                                                    {user.is_verified && (
                                                        <span className="flex flex-shrink-0 items-center rounded-lg bg-blue-500 p-0.5 text-xs font-medium text-white">
                                                            <Check className="h-3 w-3" />
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="max-w-full truncate text-lg font-extrabold">{user.name}</span>
                                            </div>
                                        </Link>
                                    </div>
                                </SheetHeader>

                                <div className="mt-4 flex h-full flex-1 flex-col">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col gap-0.5 space-y-4">
                                            {sideBarNavItems.map((item) => (
                                                <Link key={item.title + item.url} href={item.url} className="flex items-center gap-1 space-x-2">
                                                    {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                    <span>{item.title}</span>
                                                    {item.count && item.count !== 0 ? (
                                                        <Badge className="bg-neutral-500 dark:bg-neutral-300">{item.count}</Badge>
                                                    ) : (
                                                        ''
                                                    )}
                                                </Link>
                                            ))}
                                            <DropdownMenuSeparator className="mb-5" />
                                            <a className="flex items-center space-x-2" href="https://github.com/VicTrollhead/Spark">
                                                <Folder className="h-5 w-5" />
                                                <span>{translations['Repository']}</span>
                                            </a>
                                            <p onClick={handleLogout} className="flex cursor-pointer items-center space-x-2">
                                                <LogOut className="mr-2 h-5 w-5" />
                                                {translations['Log out']}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <div className="flex w-1/6 items-center space-x-2 lg:space-x-0">
                        <Link href="/dashboard" prefetch>
                            <AppLogo />
                        </Link>
                        <AppearanceToggle className="ml-5 justify-center p-2.5 lg:ml-2.5" />
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden h-full w-full items-center justify-around lg:flex">
                        <NavigationMenu className="flex h-full w-full items-stretch">
                            <NavigationMenuList className="flex h-full w-full items-stretch">
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem key={index} className="relative mx-20 flex h-full w-full items-center">
                                        <Link
                                            href={item.url}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                page.url === item.url && activeItemStyles,
                                                'h-9 cursor-pointer px-3',
                                            )}
                                        >
                                            {item.title}
                                        </Link>
                                        {page.url === item.url && (
                                            <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="mr-2 ml-auto flex items-center xl:hidden">
                        <Link href={'/search-empty'}>
                            <Search />
                        </Link>
                    </div>

                    <div className="ml-auto hidden w-1/4 items-center justify-end space-x-2 xl:flex">
                        <div className="relative flex items-center space-x-1">
                            <div className="flex items-center space-x-3">
                                <Search className="size-1/8 opacity-80 group-hover:opacity-100" />
                                <Input placeholder={translations['Search users']} className="w-full" onKeyDown={onKeyDownSearch} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*{breadcrumbs.length > 1 && (<div className="border-sidebar-border/70 flex w-full border-b">*/}
            {/*        <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">*/}
            {/*            <Breadcrumbs breadcrumbs={breadcrumbs}/>*/}
            {/*        </div>*/}
            {/*    </div>)}*/}
        </>
    );
}
