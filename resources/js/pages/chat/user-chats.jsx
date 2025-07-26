import { Head, Link, router, usePage } from '@inertiajs/react';
import { Check, RefreshCw, SendIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge.jsx';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog.jsx';
import { Input } from '../../components/ui/input.jsx';
import { useInitials } from '../../hooks/use-initials';
import AppLayout from '../../layouts/app-layout';
import { getProfileImageUrl } from '../../lib/utils';

export default function UserChats() {
    const { auth, chats, users, translations } = usePage().props;
    const user = auth?.user;
    const getInitials = useInitials();
    const [isLoading, setIsLoading] = useState(false);
    const [usersSearch, setUsersSearch] = useState(users || []);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        window.Echo.private(`user-chats.${user.id}`).listen('UserMessageCreated', handleReload).listen('UserMessageIsReadChange', handleReload);

        setTimeout(handleReload, 0);
        return () => {
            window.Echo.leave(`user-chats.${user.id}`);
        };
    }, []);

    const handleReload = () => {
        setIsLoading(true);
        router.reload({
            only: ['chats'],
            preserveState: true,
            preserveScroll: true,
        });
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };

    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        date.setHours(date.getHours() + 3);
        const shiftedNow = new Date();
        shiftedNow.setHours(shiftedNow.getHours() + 3);
        const isToday =
            date.getFullYear() === shiftedNow.getFullYear() && date.getMonth() === shiftedNow.getMonth() && date.getDate() === shiftedNow.getDate();
        return isToday
            ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleString([], {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
              });
    };

    const onSearchChange = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);
        const filtered = users
            .map((group) => ({
                label: group.label,
                users: group.users.filter((user) => user.name.toLowerCase().includes(value) || user.username.toLowerCase().includes(value)),
            }))
            .filter((group) => group.users.length > 0);
        setUsersSearch(filtered);
    };

    // const getProfileImageUrl = (user) => {
    //     if (user?.profile_image?.disk === 's3') {
    //         return user.profile_image?.url;
    //     } else if (user?.profile_image?.file_path) {
    //         return `/storage/${user.profile_image?.file_path}`;
    //     }
    //     return null;
    // };

    return (
        <AppLayout>
            <Head title={translations['User chats']} />
            <div className="p-6">
                <div className="flex  gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <h1 className="text-2xl font-bold">{translations['User chats']}</h1>
                    <div className="flex flex-row items-center gap-2">
                        <Dialog>
                            <DialogTrigger>
                                <div className="flex cursor-pointer items-center gap-1 rounded-md border p-2 font-semibold text-gray-800 transition hover:bg-gray-200 dark:text-white dark:hover:bg-neutral-800">
                                    <SendIcon className="h-5 w-5" />
                                    <span className="hidden md:flex">{translations['Start new chat']}</span>
                                </div>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{translations['Select user to start new chat']}</DialogTitle>
                                    <DialogDescription className="flex h-[50vh] flex-col gap-3 overflow-y-auto">
                                        <span className="flex items-center space-x-5">
                                            <Input placeholder={translations['Search users']} className="w-full" onChange={onSearchChange} />
                                        </span>
                                        {usersSearch.length === 0 ? (
                                            <DialogClose className="mt-4 text-center text-lg text-gray-500">
                                                {translations['No friends to chat yet.']}
                                            </DialogClose>
                                        ) : (
                                            usersSearch
                                                .filter((group) => group.users.length > 0)
                                                .map((group, idx) => (
                                                    <span key={idx} className="flex flex-col gap-2">
                                                        <span className="text-[16px] font-semibold text-neutral-700 dark:text-white">
                                                            {translations[group.label] || group.label}
                                                        </span>
                                                        {group.users.map((user) => (
                                                            <DialogClose
                                                                key={user.id}
                                                                onClick={() => router.post(`/chat/user-chat/new/${user.id}`)}
                                                                className="flex cursor-pointer flex-row gap-3 rounded-md border px-4 py-2 hover:bg-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
                                                            >
                                                                <Avatar className="my-auto h-12 w-12 border-2 border-neutral-800 md:h-15 md:w-15 dark:border-gray-400">
                                                                    <AvatarImage src={getProfileImageUrl(user)} alt={user.name} />
                                                                    <AvatarFallback className="rounded-full bg-gray-200 text-2xl text-black dark:bg-gray-700 dark:text-white">
                                                                        {getInitials(user.name)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex w-full flex-col items-start text-sm text-gray-700 sm:flex md:text-lg dark:text-gray-300">
                                                                    <div className="flex flex-col items-start">
                                                                        <span className="font-bold">{user.name}</span>
                                                                        <span>@{user.username}</span>
                                                                    </div>
                                                                </div>
                                                            </DialogClose>
                                                        ))}
                                                    </span>
                                                ))
                                        )}
                                    </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                        <button
                            onClick={handleReload}
                            className="cursor-pointer rounded-md border p-2 font-semibold text-gray-800 transition hover:bg-gray-200 dark:text-white dark:hover:bg-neutral-800"
                        >
                            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
                {chats.length === 0 ? (
                    <p className="mt-10 text-gray-500">{translations['Not chats anyone yet.']}</p>
                ) : (
                    <ul className="overflow-y-auto">
                        {chats.map((chat) => (
                            <li
                                key={chat.id}
                                className="mt-2 rounded-md border px-4 py-2 hover:bg-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
                            >
                                <Link href={`/chat/user-chat/${chat.user.username}`} className="flex flex-row gap-3">
                                    <Avatar className="my-auto h-12 w-12  md:h-15 md:w-15 ">
                                        <AvatarImage src={getProfileImageUrl(chat.user)} alt={chat.user.name} />
                                        <AvatarFallback className="rounded-full bg-gray-200 text-2xl text-black dark:bg-gray-700 dark:text-white">
                                            {getInitials(chat.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex w-full flex-col gap-2 py-1 text-sm md:text-lg">
                                        <div className="flexflex-wrap gap-1">
                                            <div className="flex items-center gap-1">
                                                <span className="ml-1 font-bold">{chat.user.name}</span>
                                                <span className="hidden text-gray-500 sm:flex dark:text-gray-400 text-[15px]">@{chat.user.username}</span>
                                                {chat.user.is_verified && (
                                                    <div className="group relative">
                                                        <span className="top absolute -top-7 left-1/2 -translate-x-1/2 scale-0 transform rounded-md bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                                                            Verified
                                                        </span>
                                                        <span className="flex items-center rounded-lg bg-blue-500 p-0.5 text-xs font-medium text-white">
                                                            <Check className="h-3 w-3" />
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mb-1 ml-1 flex gap-2 text-sm">
                                            <p>{chat.last_message ? chat.last_message.text : translations['No messages anyone yet.']}</p>
                                            {chat.unread_count && chat.unread_count !== 0 ? (
                                                <Badge className="bg-neutral-500 dark:bg-neutral-300">{chat.unread_count}</Badge>
                                            ) : (
                                                ''
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex w-1/4 items-center justify-end">
                                        {chat.last_message ? (
                                            <p className="text-sm text-gray-500">{formatMessageTime(chat.last_message.time)}</p>
                                        ) : (
                                            ''
                                        )}
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </AppLayout>
    );
}
