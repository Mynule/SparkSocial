import { useState } from 'react';
import { Head, usePage, Link, router } from '@inertiajs/react';
import AppLayout from '../../layouts/app-layout';
import { RefreshCw, Search } from 'lucide-react';
import { useInitials } from '../../hooks/use-initials.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar.jsx';
import { Input } from '../../components/ui/input.jsx';
import { getProfileImageUrl } from '../../lib/utils';

export default function SearchUsers() {
    const { users, sort, searchText, translations } = usePage().props;
    const [sortOption, setSortOption] = useState(sort || 'latest');
    const [searchTextOption, setSearchTextOption] = useState(searchText || '');
    const [usersList, setUsersList] = useState(users || []);
    const getInitials = useInitials();

    const [isLoading, setIsLoading] = useState(false);

    const handleSortChange = (e) => {
        const selectedSort = e.target.value;
        setSortOption(selectedSort);
        if (!searchTextOption) {
            setUsersList([]);
            return;
        }
        router.get(`/user/search/${searchTextOption}`, { sort: selectedSort }, { preserveScroll: true });
    };

    const onKeyDownSearch = async (e) => {
        if (e.code === 'Enter') {
            const searchText = e.currentTarget.value;
            setSearchTextOption(searchText);
            if (!searchText) {
                setUsersList([]);
                return;
            }
            router.get(`/user/search/${searchTextOption}`, { sort: `${sortOption}` }, { preserveScroll: true });
        }
    };

    const handleReload = () => {
        setIsLoading(true);
        if(searchTextOption)
            router.reload({ only: ['users'] });
        setTimeout(() => {
            if (searchTextOption)
                setUsersList(users);
            setIsLoading(false);
        }, 1000);
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
            <Head title={translations['Search users']} />

            <div className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-1.5 w-full flex-wrap">
                        <div className="flex items-center space-x-3 w-full">
                            <Search className="size-10 opacity-80 group-hover:opacity-100"/>
                            <Input
                                placeholder={translations['Search users by name or username']}
                                className="w-full"
                                value={searchTextOption}
                                onChange={(e) => setSearchTextOption(e.target.value)}
                                onKeyDown={onKeyDownSearch}
                            />
                        </div>

                        <div className="flex gap-2 w-full">
                            <select
                                value={sortOption}
                                onChange={handleSortChange}
                                className="px-1 w-fit py-2 border rounded-md bg-gray-100 dark:bg-neutral-900 text-neutral-950 dark:text-white"
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
                                className="p-2 text-sm font-semibold dark:text-white text-gray-800 border rounded-md hover:bg-gray-200 dark:hover:bg-neutral-800 transition flex items-center"
                            >
                                <RefreshCw
                                    className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
                                />
                            </button>
                        </div>

                    </div>

                </div>

                {usersList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {usersList.map((user) => (
                            <Link
                                key={user.id}
                                href={`/user/${user.username}`}
                                className="block p-4 border rounded-md hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-transparent"
                            >
                                <div className="flex items-center space-x-3 min-w-0">
                                    <Avatar className="h-10 w-10 flex-shrink-0">
                                        <AvatarImage src={getProfileImageUrl(user)} alt={user.name} />
                                        <AvatarFallback className="rounded-full bg-gray-200 text-lg text-black dark:bg-gray-700 dark:text-white">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="text-lg font-semibold truncate">{user.name}</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
                                    </div>

                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 px-6 py-4 text-center">
                        {translations['No users found.']}
                    </p>
                )}
            </div>
        </AppLayout>
    );
}

