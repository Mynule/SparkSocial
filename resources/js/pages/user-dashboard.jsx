import { Head, Link, router, usePage } from '@inertiajs/react';
import { Check, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useInitials } from '../hooks/use-initials';
import AppLayout from '../layouts/app-layout';
import { getProfileImageUrl } from '../lib/utils';

export default function Dashboard() {
    const { users, sort, translations } = usePage().props;
    const [sortOption, setSortOption] = useState(sort || 'latest');
    const getInitials = useInitials();

    const [isLoading, setIsLoading] = useState(false);

    const handleSortChange = (e) => {
        const selectedSort = e.target.value;
        setSortOption(selectedSort);
        router.get('/dashboard/users', { sort: selectedSort }, { preserveScroll: true });
    };

    const handleReload = () => {
        setIsLoading(true);
        router.reload({ only: ['posts'] });
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };

    // const getProfileImageUrl = (user) => {
    //     if (user?.profile_image?.disk === 's3') {
    //         return user.profile_image?.url;
    //     } else if (user?.profile_image?.file_path) {
    //         return `/storage/${user.profile_image.file_path}`;
    //     }
    //     return null;
    // };


    return (
        <AppLayout>
            <Head title={translations['All users']} />

            <div className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <h1 className="text-2xl font-bold">{translations['All users']}</h1>

                    <div className="flex flex-wrap items-center gap-2 self-end">
                        <select
                            value={sortOption}
                            onChange={handleSortChange}
                            className=" sm:w-36 rounded-md border px-3 py-2 dark:bg-neutral-900 dark:text-white"
                        >
                            <option value="latest">{translations['Latest']}</option>
                            <option value="oldest">{translations['Oldest']}</option>
                            <option value="popular">{translations['Most Followed']}</option>
                            <option value="least_followed">{translations['Least Followed']}</option>
                            <option value="following">{translations['Following']}</option>
                            <option value="followers">{translations['Followers']}</option>
                            <option value="mutual_subscribers">{translations['Friends']}</option>
                        </select>

                        <button
                            onClick={handleReload}
                            className="flex items-center justify-center rounded-md border p-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-200 dark:text-white dark:hover:bg-neutral-800"
                        >
                            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>


                {users.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 py-4">
                        {users.map((user) => (
                            <Link
                                key={user.id}
                                href={`/user/${user.username}`}
                                className="block rounded-md border p-4 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-transparent"
                            >
                                <div className="flex min-w-0 items-center space-x-3">
                                    <Avatar className="h-10 w-10 flex-shrink-0">
                                        <AvatarImage src={getProfileImageUrl(user)} alt={user.name} />
                                        <AvatarFallback className="rounded-full bg-gray-200 text-lg text-black dark:bg-gray-700 dark:text-white">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex flex-col">
                                        <div className="grid flex-1 text-left leading-tight">
                                            <div className="flex items-center gap-1">
                                                <span className=" text-[14.5px] text-gray-700 dark:text-neutral-300 break-all">@{user.username}</span>
                                                {user.is_verified && (
                                                    <span className="flex items-center rounded-lg bg-blue-500 p-0.5 text-xs font-medium text-white">
                                                        <Check className="h-3 w-3" />
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-lg font-extrabold break-all">{user.name}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        {translations['No users found for this sorting option.']}
                    </p>
                )}
            </div>
        </AppLayout>
    );
}
