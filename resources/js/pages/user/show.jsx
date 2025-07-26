import { Head, usePage, Link, router } from '@inertiajs/react';
import {Check, MapPin, Globe, Calendar, UserCheck, AlertCircle, RefreshCw, SendIcon} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useInitials } from '../../hooks/use-initials';
import AppLayout from '../../layouts/app-layout';
import PostComponent from '../post/post-component';
import { useState } from 'react';
import { getProfileImageUrl, getCoverImageUrl } from '../../lib/utils';

export default function Show() {
    const { user, auth, posts, translations, filters, followers_string, following_string } = usePage().props;
    const getInitials = useInitials();
    const [sort, setSort] = useState(filters?.sort || 'latest');
    const [isLoading, setIsLoading] = useState(false);
    const [hasSentRequest, setHasSentRequest] = useState(user.has_sent_follow_request);
    const handleReload = () => {
        setIsLoading(true);
        router.reload();
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };

    const handleFollow = () => {
        const isCurrentlyFollowing = user.is_following || hasSentRequest;

        const route = isCurrentlyFollowing
            ? 'unfollow'
            : (user.is_private ? 'follow-request' : 'follow');

        setIsLoading(true);

        router.post(`/user/${user.username}/${route}`, {}, {
            onSuccess: () => {
                if (user.is_private && !isCurrentlyFollowing) {
                    setHasSentRequest(true);
                } else {
                    setHasSentRequest(false);
                }
                setIsLoading(false);
            },
            onError: () => {
                setIsLoading(false);
            }
        });
    };


    const handleEditProfile = () => {
        router.get(`/user/${user.username}/edit`);
    };

    // const getProfileImageUrl = (user) => {
    //     if (user?.profile_image?.disk === 's3') {
    //         return user.profile_image?.url;
    //     } else if (user?.profile_image?.file_path) {
    //         return `/storage/${user.profile_image.file_path}`;
    //     }
    //     return null;
    // };

    // const getProfileImageUrl = (user) => {
    //     const url = user?.profile_image;
    //     if (!url) return null;
    //     if (url.startsWith('http://') || url.startsWith('https://')) {
    //         return url;
    //     }
    //     return `/storage/${url}`;
    // };

    // const getCoverImageUrl = (user) => {
    //     if (user?.cover_image?.disk === 's3') {
    //         return user.cover_image.url;
    //     } else if (user?.cover_image?.file_path) {
    //         return `/storage/${user.cover_image.file_path}`;
    //     }
    //     return null;
    // };

    const profileImageUrl = getProfileImageUrl(user);
    const coverImageUrl = getCoverImageUrl(user);

    const isOwnProfile = auth.user && auth.user.id === user.id;

    if (!user.canViewFullProfile) {
        return (
            <AppLayout>
                <Head title={`@${user.username} (${translations['Private Account']})`} />

                <div className="p-6 text-center flex flex-col items-center justify-center">
                    <Avatar className="h-24 w-24 mx-auto border-4 border-white dark:border-gray-900">
                        <AvatarImage src={profileImageUrl || ''} alt={user.username} />
                        <AvatarFallback className="rounded-full bg-gray-200 text-4xl text-black dark:bg-gray-700 dark:text-white">
                            {getInitials(user.username)}
                        </AvatarFallback>
                    </Avatar>

                    <h2 className="text-lg font-semibold mt-2 text-gray-600 dark:text-gray-400">@{user.username}</h2>
                    <div className="flex items-center p-2 ml-2">
                        <h1 className="text-[22px] font-bold text-gray-900 dark:text-white">{user.name}</h1>
                        {user.is_verified && (
                            <div className="group relative ml-2">
                                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 scale-0 transform rounded-lg bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                                        Verified
                                    </span>
                                <span className="flex items-center rounded-xl bg-blue-500 p-1 text-xs font-medium text-white">
                                        <Check className="h-4 w-4" />
                                    </span>
                            </div>
                        )}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">{translations['This account is private.']}</p>

                    {auth.user && !user.is_following && (
                        <button
                            onClick={handleFollow}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            {hasSentRequest ? translations['Request Sent'] : translations['Follow to See More']}
                        </button>
                    )}

                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title={`${user.name} (@${user.username})`} />

            <div className="relative w-full bg-gray-200 h-72 dark:bg-gray-700">
                {coverImageUrl && (
                    <img src={coverImageUrl} alt="Cover Image" className="h-full w-full object-fill object-center" />
                )}
                <div className="absolute bottom-[-55px] left-4 sm:left-6">
                    <Avatar className="h-32 w-32 border-4 border-white sm:h-36 sm:w-36 dark:border-gray-900">
                        <AvatarImage src={profileImageUrl} alt={user.name} />
                        <AvatarFallback className="rounded-full bg-gray-200 text-5xl text-black dark:bg-gray-700 dark:text-white">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                </div>

            </div>

            <div className="space-y-2 p-6 pt-12 sm:pt-16">
                <div className="flex items-center justify-between gap-x-5">
                    <div>
                        <div className="flex items-center mt-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white break-all">{user.name}</h1>
                            {user.is_verified && (
                                <div className="group relative ml-2">
                                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 scale-0 transform rounded-lg bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                                        Verified
                                    </span>
                                    <span className="flex items-center rounded-xl bg-blue-500 p-1 text-xs font-medium text-white">
                                        <Check className="h-4 w-4" />
                                    </span>
                                </div>
                            )}
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 break-all">@{user.username}</p>
                    </div>
                    {!isOwnProfile && (
                        <div className="flex lg:flex-row flex-col gap-1">
                            {user.is_friend ? (
                                <button
                                    onClick={() => router.post(`/chat/user-chat/new/${user.id}`)}
                                    className={`px-4 py-2 flex gap-2 items-center rounded-md bg-gray-600 hover:bg-gray-500 text-white dark:bg-gray-800 dark:hover:bg-gray-700`}
                                >
                                    {translations['Write']}<SendIcon className="w-4 h-4" />
                                </button>
                            ) : ''}
                            <button
                                onClick={handleFollow}
                                className={`px-4 py-2 rounded-md ${
                                    user.is_following
                                        ? 'bg-gray-600 hover:bg-gray-500 text-white dark:bg-gray-800 dark:hover:bg-gray-700'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800'
                                }`}
                            >
                                {user.is_following ? translations['Unfollow'] : translations['Follow']}
                            </button>
                        </div>
                    )}
                    {isOwnProfile && (
                        <div className="flex flex-col lg:items-end sm:items-center pl-1 sm:ml-10 space-y-2">
                            <button
                                onClick={handleEditProfile}
                                className="px-4 py-2 border-2 rounded-3xl text-gray-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                                {translations['Edit Profile']}
                            </button>

                            {(!user.bio || !user.location || !user.website || !user.date_of_birth) && (
                                <div className="flex items-center gap-2 bg-blue-100 text-blue-600 px-2 py-2 rounded-lg text-sm dark:bg-gray-800 dark:text-blue-400 sm:w-auto w-full">
                                    <AlertCircle className="h-4 w-4" />
                                    <p className="leading-tight">
                                        {translations['Complete your profile.']}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {user.bio && <p className="text-gray-700 dark:text-gray-300">{user.bio}</p>}

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {user.location && (
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {user.location}
                        </div>
                    )}

                    {user.website && (
                        <div className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                {user.website}
                            </a>
                        </div>
                    )}

                    {user.date_of_birth && (
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(user.date_of_birth).toLocaleDateString()}
                        </div>
                    )}

                    <div className="flex items-center gap-1">
                        <UserCheck className="h-4 w-4" />
                        {translations['Joined']}{' '}{new Date(user.created_at).toLocaleDateString()}
                    </div>

                    {user.status && (
                        <div className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {translations[user.status]}
                        </div>
                    )}
                </div>

                <div className="flex gap-4 text-gray-700 dark:text-gray-300 mt-4">
                    <Link href={`/user/${user.username}/followers`} className="hover:underline">
                        <strong>{user.followers_count}</strong> {followers_string}
                    </Link>
                    <Link href={`/user/${user.username}/following`} className="hover:underline">
                        <strong>{user.following_count}</strong> {following_string}
                    </Link>
                    <div>
                        <strong>{user.total_likes}</strong> {translations['Likes']}
                    </div>
                </div>
            </div>

            <div className="divide-y">
                <div className="flex items-center justify-between px-6 py-3">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{translations['Posts']}</h2>

                    <div className="flex items-center gap-2">
                        <select
                            className="ml-4 px-3 w-fit py-1.5 border rounded-md dark:bg-neutral-900 dark:text-white"
                            value={sort}
                            onChange={(e) => {
                                setSort(e.target.value);
                                router.get(window.location.pathname, { sort: e.target.value }, {
                                    preserveScroll: true,
                                    preserveState: true,
                                });
                            }}
                        >
                            <option value="latest">{translations['Latest']}</option>
                            <option value="oldest">{translations['Oldest']}</option>
                            <option value="most_liked">{translations['Most Liked']}</option>
                            <option value="reposts">{translations['Reposts']}</option>
                        </select>
                        <button
                            onClick={handleReload}
                            className="flex items-center rounded-md border p-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-200 dark:text-white dark:hover:bg-neutral-800"
                        >
                            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-neutral-800">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <PostComponent key={post.id} post={post} user={user} auth={auth} />
                        ))
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 px-6 py-4">{translations['No posts yet.']} {isOwnProfile && (<Link href="/dashboard" className="text-blue-500 hover:underline">{translations['Write your first post here']}</Link>)}</p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
