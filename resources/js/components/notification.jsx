import { Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, Bookmark, Check, Eye, EyeOff, Heart, MessageCircle, Repeat, Users, MessagesSquareIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar.jsx';
import { useInitials } from '../hooks/use-initials.jsx';
import { getProfileImageUrl } from '../lib/utils';

export function Notification({ notification }) {
    const { translations } = usePage().props;
    const post = notification.post;
    const sourceUser = notification.source_user;
    const getInitials = useInitials();

    const toggleReadStatus = () => {
        const routeName = notification.is_read ? 'unread' : 'read';
        router.patch(
            `/notifications/${notification.id}/${routeName}`,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const renderUserLink = (username, name) => (
        <Link
            href={`/user/${username}`}
            className="flex  items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500"
        >
            <span className="break-all">
                {name} <span className="text-sm">(@{username})</span>
            </span>
            {sourceUser.is_verified && (
                <div className="group relative">
                    <span className="top absolute -top-7 left-1/2 -translate-x-1/2 scale-0 transform rounded-md bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                        Verified
                    </span>
                    <span className="flex items-center rounded-lg bg-blue-500 p-0.5 text-xs font-medium text-white">
                        <Check className="h-3 w-3" />
                    </span>
                </div>
            )}
        </Link>
    );

    // const getProfileImageUrl = (user) => {
    //     if (user?.profile_image?.disk === 's3') {
    //         return user.profile_image?.url;
    //     } else if (user?.profile_image?.file_path) {
    //         return `/storage/${user.profile_image?.file_path}`;
    //     }
    //     return null;
    // };

    const handleFollowRequest = (action) => {
        router.post(
            `/user/${sourceUser.id}/${notification.id}/${action}`,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const getColor = (type) => {
        switch (type) {
            case 'like':
                return 'border-l-red-600';
            case 'repost':
                return 'border-l-green-500';
            case 'comment':
                return 'border-l-blue-600';
            case 'follow':
                return 'border-l-gray-700';
            case 'favorite':
                return 'border-l-yellow-500';
            case 'message':
                return 'border-l-gray-400'
            default:
                return 'border-l-gray-600';
        }
    };
console.log(notification.extra_data);
    const renderMessage = (notification) => {
        const { type, source_user, post } = notification;
        const name = source_user?.name || translations['Someone'];
        const username = source_user?.username || '';

        switch (type) {
            case 'like':
                return (
                    <div className="flex flex-col gap-1">
                        <span>{renderUserLink(username, name)}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{notification.created_at}</span>
                        <div className="flex flex-row">
                            <Heart className="my-auto h-5 w-5" />
                            <span className="ml-2">
                    {notification.extra_data
                        ? translations['liked your comment.']
                        : translations['liked your post.']}
                </span>
                        </div>
                        { notification.extra_data && (<div className="text-[16px]">"{notification.extra_data}"</div>) }
                    </div>
                );

            case 'repost':
                return (
                    <div className="flex flex-col gap-1">
                        <span>{renderUserLink(username, name)}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{notification.created_at}</span>
                        <div className="flex flex-row">
                            <Repeat className="my-auto h-5 w-5" />
                            <span className="ml-2">{translations['reposted your post.']}</span>
                        </div>
                    </div>
                );
            case 'comment':
                return (
                    <div className="flex flex-col gap-1">
                        <span>{renderUserLink(username, name)}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{notification.created_at}</span>
                        <div className="flex flex-row">
                            <MessageCircle className="my-auto h-5 w-5" />
                            <span className="ml-2">{translations['commented on your post:']}</span>
                        </div>
                        <div className="text-[16px]">"{notification.extra_data}"</div>
                    </div>
                );
            case 'follow':
                const isFollowRequest = notification.extra_data === 'pending';
                const isAcceptedAnswerForFollowRequest = notification.extra_data === 'accepted';
                const isRejectedAnswerForFollowRequest = notification.extra_data === 'rejected';
                return (
                    <div className="flex flex-col gap-1">
                        <span>{renderUserLink(username, name)}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{notification.created_at}</span>
                        {isFollowRequest ? (
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-row items-center">
                                    <Users className="my-auto h-5 w-5" />
                                    <span className="ml-2">{translations['has sent you a follow request.']}</span>
                                </div>
                                <div className="mt-2 flex gap-2">
                                    <button
                                        onClick={() => handleFollowRequest('accept-request')}
                                        className="rounded-md bg-green-700 px-3 py-1 text-white hover:bg-green-900"
                                    >
                                        {translations['Accept']}
                                    </button>
                                    <button
                                        onClick={() => handleFollowRequest('reject-request')}
                                        className="rounded-md bg-red-700 px-3 py-1 text-white hover:bg-red-900"
                                    >
                                        {translations['Decline']}
                                    </button>
                                </div>
                            </div>
                        ) : isAcceptedAnswerForFollowRequest ? (
                            <div className="flex flex-row">
                                <Users className="my-auto h-5 w-5" />
                                <span className="ml-2">{translations['accepted your follow request.']}</span>
                            </div>
                        ) : isRejectedAnswerForFollowRequest ? (
                            <div className="flex flex-row">
                                <Users className="my-auto h-5 w-5" />
                                <span className="ml-2">{translations['rejected your follow request.']}</span>
                            </div>
                        ) : (
                            <div className="flex flex-row">
                                <Users className="my-auto h-5 w-5" />
                                <span className="ml-2">{translations['followed you.']}</span>
                            </div>
                        )}
                    </div>
                );

            case 'favorite':
                return (
                    <div className="flex flex-col gap-1">
                        <span>{renderUserLink(username, name)}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{notification.created_at}</span>
                        <div className="flex flex-row">
                            <Bookmark className="my-auto h-5 w-5" />
                            <span className="ml-2">{translations['favorited your post.']}</span>
                        </div>
                    </div>
                );
            case 'message':
                return (
                    <div className="flex flex-col gap-1">
                        <span>{renderUserLink(username, name)}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{notification.created_at}</span>
                        <div className="flex flex-row">
                            <MessagesSquareIcon className="my-auto h-5 w-5" />
                            <span className="ml-2">{translations['sent you a message:']}</span>
                        </div>
                        <div className="text-[16px]">"{notification.extra_data}"</div>
                    </div>
                );
            default:
                return (
                    <div className="flex flex-col gap-1">
                        <span>{renderUserLink(username, name)}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{notification.created_at}</span>
                        <div className="flex flex-row">
                            <span className="ml-2">{translations['interacted with you.']}</span>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div
            className={`border-l-4 ${getColor(notification.type)} flex items-start gap-3 border-t-0 border-r-0 border-b-gray-400 bg-gray-100 p-5 transition-all hover:bg-gray-50 dark:bg-neutral-900 dark:hover:bg-neutral-950`}
        >
            <div className="hidden items-center gap-4 md:flex">
                <Avatar className="h-14 w-14 mt-4">
                    <AvatarImage src={getProfileImageUrl(sourceUser)} alt={sourceUser.name} />
                    <AvatarFallback className="rounded-full bg-gray-200 text-black dark:bg-gray-700 dark:text-white">
                        {getInitials(sourceUser.name)}
                    </AvatarFallback>
                </Avatar>
            </div>

            <div className="flex w-full flex-col">
                <div className="mb-1 p-1 text-sm font-medium text-gray-800 md:text-lg dark:text-gray-100">{renderMessage(notification)}</div>
            </div>
            <div className="my-auto">
                {notification.is_read ? (
                    <EyeOff size={26} onClick={toggleReadStatus} className="cursor-pointer" />
                ) : (
                    <Eye size={26} onClick={toggleReadStatus} className="cursor-pointer" />
                )}
            </div>
            {notification.type === 'message' && sourceUser?.id ? (
                <button
                    onClick={() => router.post(`/chat/user-chat/new/${sourceUser.id}`)}
                    className="my-auto rounded-lg p-2 text-gray-700 transition-all hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-200"
                    title={translations['Send a message']}
                >
                    <ArrowRight className="ml-auto" size={28} />
                </button>
            ) : post && post.user && (
                <Link
                    href={`/post/${post.id}`}
                    className="my-auto rounded-lg p-2 text-gray-700 transition-all hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-200"
                >
                    <ArrowRight className="ml-auto" size={28} />
                </Link>
            )}

        </div>
    );
}
