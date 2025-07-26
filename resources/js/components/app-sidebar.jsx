import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenuButton,
    SidebarSeparator
} from './ui/sidebar';
import { useForm, usePage } from '@inertiajs/react';

import { Bookmark, Folder, Home, LogOut, Mail, Settings, User, Users, Repeat, MessagesSquareIcon, Hash, Flag } from 'lucide-react';
import {useEffect, useState} from "react";

export function AppSidebar() {
    const { auth, translations } = usePage().props;
    const user = auth?.user;
    const { post } = useForm();
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
    const { can_view_reports } = usePage().props;

    console.log('props', usePage().props);

    const fetchUnreadNotificationsCount = async () => {
        try {
            const response = await fetch('/notifications/unread-count');
            const data = await response.json();
            setUnreadNotificationsCount(data.unread_count);
        } catch (error) {
            console.error(error);
        }
    }

    const fetchUnreadMessagesCount = async () => {
        try {
            const response = await fetch('/chat/user-chat/messages/unread-count');
            const data = await response.json();
            setUnreadMessagesCount(data.unread_count);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUnreadNotificationsCount().catch(error => console.error(error));
        fetchUnreadMessagesCount().catch(error => console.error(error));

        window.Echo.private(`notifications.${user.id}`)
            .listen('NotificationCreated', (e) => {
                setUnreadNotificationsCount(prev => prev + 1);
            })
            .listen('NotificationIsReadChange', (e) => {
                if (e.operation === 'read') {
                    setUnreadNotificationsCount(prev => Math.max(prev - 1, 0));
                } else if (e.operation === 'unread') {
                    setUnreadNotificationsCount(prev => prev + 1);
                } else if (e.operation === 'allRead') {
                    setUnreadNotificationsCount(0);
                } else if (e.operation === 'allUnread') {
                    fetchUnreadNotificationsCount().catch(error => console.error(error));
                }
            });

        window.Echo.private(`user-chats.${user.id}`)
            .listen('UserMessageCreated',  (e) => {
                fetchUnreadMessagesCount().catch(error => console.error(error));
            }).listen('UserMessageIsReadChange', (e) => {
            if(e.operation === 'read')
            {
                fetchUnreadMessagesCount().catch(error => console.error(error));
            }
            else if (e.operation === 'delete')
            {
                fetchUnreadMessagesCount().catch(error => console.error(error));
            }
        });

        return () => {
            window.Echo.leave(`notifications.${user.id}`);
            window.Echo.leave(`user-chats.${user.id}`);
        };
    }, []);


    if (!user) return null;

    const mainNavItems = [
        {
            title: translations['Dashboard'],
            url: '/dashboard',
            icon: Home,
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

        ...(can_view_reports
            ? [{
                title: translations['Reports'],
                url: '/admin/reports',
                icon: Flag,
            }]
            : [])

    ];
    return (
        <Sidebar
                 variant="inset"
                 collapsible="none"
                 className="bg-transparent fixed top-16 left-0 w-[17rem] h-[calc(100vh-4rem)] shadow-lg hidden lg:flex">
            <SidebarHeader>
                <NavUser />
            </SidebarHeader>

            <SidebarContent className="-mt-2">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <SidebarSeparator/>
                <a className="flex cursor-pointer" href="https://github.com/VicTrollhead/Spark">
                    <SidebarMenuButton size="lg" className="text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent group cursor-pointer">
                        <Folder/>
                        {translations['Repository']}
                    </SidebarMenuButton>
                </a>
                <SidebarMenuButton
                    onClick={() => post(route('logout'))}
                    size="lg"
                    className="text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent group cursor-pointer">
                    <LogOut/>
                    {translations['Log out']}
                </SidebarMenuButton>
            </SidebarFooter>
        </Sidebar>
    );
}


