import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '../../layouts/app-layout';
import {Eye, EyeOff, RefreshCw} from 'lucide-react';
import {useEffect, useState} from 'react';
import {Notification} from "../../components/notification.jsx";

export default function Notifications() {
    const { auth, notifications, translations, read_count, unread_count } = usePage().props;
    const user = auth?.user;
    const [isLoading, setIsLoading] = useState(false);
    const [sort, setSort] = useState(usePage().props.sort || 'unread');

    useEffect(() => {
        window.Echo.private(`notifications.${user.id}`)
            .listen('NotificationCreated', handleReload)
            .listen('NotificationIsReadChange', handleReload);

        return () => {
            window.Echo.leave(`notifications.${user.id}`);
        };
    }, []);

    const handleSortChange = (value) => {
        router.get(route('notifications.index'), { sort: value }, { preserveScroll: true });
    };
    const handleReload = () => {
        setIsLoading(true);
        router.reload();
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };


    return (
        <AppLayout>
            <Head title={translations['Notifications']} />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between p-6">
                <h1 className="text-2xl font-extrabold ">
                    {translations['Notifications']}
                </h1>
                <div className="flex items-center gap-2">
                    <div className="flex flex-row gap-1.5 text-[15px] lg:text-lg">
                        <h4 className="py-1">{translations['All:']}</h4>
                        <button
                            onClick={() => router.patch(route('notifications.markAllAsRead'), {}, { preserveScroll: true })}
                            className="w-fit px-2 py-1 border rounded-md text-sm text-gray-800 transition hover:bg-gray-200 dark:text-white dark:hover:bg-neutral-800 dark:bg-neutral-900"
                        >
                            <Eye className='h-5 w-5'/>
                        </button>

                        <button
                            onClick={() => router.patch(route('notifications.markAllAsUnread'), {}, { preserveScroll: true })}
                            className="w-fit px-2 py-1 border rounded-md text-sm text-gray-800 transition hover:bg-gray-200 dark:text-white dark:hover:bg-neutral-800 dark:bg-neutral-900"
                        >
                            <EyeOff className='h-5 w-5'/>
                        </button>
                        <select
                            value={sort}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="px-3 py-2 border rounded-md w-fit dark:bg-neutral-900 dark:text-white"
                        >
                            <option value="latest">{translations['Latest']} ({read_count + unread_count})</option>
                            <option value="oldest">{translations['Oldest']} ({read_count + unread_count})</option>
                            <option value="read">{translations['Read']} ({read_count})</option>
                            <option value="unread">{translations['Unread']} ({unread_count})</option>
                        </select>
                    </div>

                    <button
                        onClick={handleReload}
                        className="flex -ml-0.5 items-center rounded-md border p-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-200 dark:text-white dark:hover:bg-neutral-800"
                    >
                        <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

            </div>

            <div className="divide-y divide-gray-200 dark:divide-neutral-800 ">
                {notifications.length > 0 ? (
                    notifications.map((notification) => <Notification key={notification.id + notification.created_at} notification={notification}/>)
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 px-6 py-4">
                        {translations['No notifications yet.']}
                    </p>
                )}
            </div>
        </AppLayout>
    );
}
