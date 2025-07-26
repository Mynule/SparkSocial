import { Link, router, useForm, usePage } from '@inertiajs/react';
import { Bookmark, Check, EllipsisVertical, EyeOff, Heart, MessageCircle, Repeat, Flag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useInitials } from '../../hooks/use-initials';
import { getProfileImageUrl, getMediaUrl } from '../../lib/utils';

export default function PostComponent({ post, compact = false }) {
    const {processing } = useForm();
    const { auth, translations } = usePage().props;
    const getInitials = useInitials();

    const [isLiked, setIsLiked] = useState(post.is_liked);
    const [likesCount, setLikesCount] = useState(post.likes_count);

    const [isFavorited, setIsFavorited] = useState(post.is_favorited);
    const [favoritesCount, setFavoritesCount] = useState(post.favorites_count);

    const [isReposted, setIsReposted] = useState(post.is_reposted);
    const [repostsCount, setRepostsCount] = useState(post.reposts_count);

    const [showOptions, setShowOptions] = useState(false);
    const optionsRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        }

        if (showOptions) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOptions]);

    useEffect(() => {
        setIsLiked(post.is_liked);
        setLikesCount(post.likes_count);
        setIsFavorited(post.is_favorited);
        setFavoritesCount(post.favorites_count);
        setIsReposted(post.is_reposted);
        setRepostsCount(post.reposts_count);
    }, [post]);

    const toggleOptions = () => setShowOptions(prev => !prev);

    const handleLike = async () => {
        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
        const action = isLiked ? `/unlike` : `/like`;

        await router.post(
            action,
            {
                type: 'post',
                id: post.id,
            },
            {
                preserveScroll: true,
                onError: () => {
                    setIsLiked(post.is_liked);
                    setLikesCount(post.likes_count);
                },
            },
        );
    };

    const handleFavorite = async () => {
        setIsFavorited(!isFavorited);
        setFavoritesCount(isFavorited ? favoritesCount - 1 : favoritesCount + 1);
        await router.post(
            isFavorited ? `/post/${post.id}/remove-favorite` : `/post/${post.id}/add-favorite`,
            {},
            {
                preserveScroll: true,
                onError: () => {
                    setIsFavorited(post.is_favorited);
                    setFavoritesCount(post.favorites_count);
                },
            },
        );
    };

    const handleRepost = async () => {
        if (post.is_private || post.user.is_private) {
            alert(translations['You cannot repost private posts.']);
            return;
        }
        setIsReposted(!isReposted);
        setRepostsCount(isReposted ? repostsCount - 1 : repostsCount + 1);
        await router.post(
            isReposted ? `/post/${post.id}/undo` : `/post/${post.id}/repost`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRepostsCount(isReposted ? repostsCount - 1 : repostsCount + 1);
                    setIsReposted(!isReposted);
                },
                onError: () => {
                    setIsReposted(post.is_reposted);
                    setRepostsCount(post.reposts_count);
                },
            },
        );
    };

    // const getMediaUrl = (file) => {
    //     if (file?.disk === 's3') {
    //         return file.url;
    //     } else if (file?.file_path) {
    //         return `/storage/${file.file_path}`;
    //     }
    //     return null;
    // };

    // const getProfileImageUrl = (user) => {
    //     if(user?.profile_image?.disk === 's3') {
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

    const profileImageUrl = getProfileImageUrl(post.user);

    return (
        <div className={`relative ${compact ? 'bg-muted/30 rounded-lg border p-3' : 'border-b p-4'} border-gray-200 dark:border-gray-800`}>
            <div className="flex items-start space-x-3">
                <Avatar className="h-16 w-16 mt-2.5">
                    <AvatarImage src={profileImageUrl} alt={post.user.name} />
                    <AvatarFallback className="rounded-full text-lg bg-gray-200 text-black dark:bg-gray-700 dark:text-white">
                        {getInitials(post.user.name)}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                    {(post.reposted_by_you || post.reposted_by_recent?.length > 0) && (
                        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Repeat className="h-4 w-4" />
                            <span>{translations['Reposted by']}</span>

                            {post.reposted_by_you && (
                                <span className="flex items-center">
                                    <Link href={`/user/${post.current_user.username}`}>
                                        <Avatar className="h-6 w-6 border">
                                            <AvatarImage src={getProfileImageUrl(post.current_user)} alt={post.current_user.name} />
                                            <AvatarFallback className="text-xs">{getInitials(post.current_user.name)}</AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <Link href={`/user/${post.current_user.username}`} className="ml-1 text-blue-500 hover:underline break-all">
                                        {post.current_user.name}
                                    </Link>
                                    <span className="ml-1">{translations['(you)']}</span>
                                    {post.current_user.is_verified && (
                                        <div className="group relative">
                                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 scale-0 transform rounded-md bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                                                Verified
                                            </span>
                                            <span className="ml-1 flex items-center rounded-md bg-blue-500 p-0.5 text-xs font-medium text-white">
                                                <Check className="h-3 w-3" />
                                            </span>
                                        </div>
                                    )}
                                    {post.reposted_by_recent?.length > 1 && <span>,</span>}
                                </span>
                            )}

                            {post.reposted_by_recent?.map((user, index) => {
                                if (user.id !== post.current_user.id) {
                                    return (
                                        <span key={user.id} className="flex items-center">
                                            <Link href={`/user/${user.username}`}>
                                                <Avatar className="h-6 w-6 border">
                                                    <AvatarImage src={getProfileImageUrl(user)} alt={user.name} />
                                                    <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                                                </Avatar>
                                            </Link>
                                            <Link href={`/user/${user.username}`} className="ml-1 text-blue-500 hover:underline break-all">
                                                {user.name}
                                            </Link>
                                            {user.is_verified && (
                                                <div className="group relative">
                                                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 scale-0 transform rounded-md bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                                                        Verified
                                                    </span>
                                                    <span className="ml-1 flex items-center rounded-md bg-blue-500 p-0.5 text-xs font-medium text-white">
                                                        <Check className="h-3 w-3" />
                                                    </span>
                                                </div>
                                            )}
                                            {index < post.reposted_by_recent.length - 1 && <span>,</span>}
                                        </span>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Link href={`/user/${post.user.username}`} className="font-semibold text-gray-900 hover:underline dark:text-white break-all">
                                {post.user.name}
                            </Link>
                            {post.user.is_verified && (
                                <div className="group relative -ml-1">
                                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 scale-0 transform rounded-md bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                                        Verified
                                    </span>
                                    <span className="flex items-center rounded-lg bg-blue-500 p-0.5 text-xs font-medium text-white">
                                        <Check className="h-3 w-3" />
                                    </span>
                                </div>
                            )}
                            <span className="text-sm text-gray-500">{post.created_at}</span>
                        </div>

                        {post.user.id === auth.user.id && (
                            <div className="relative" ref={optionsRef}>
                                <EllipsisVertical
                                    className="h-6 w-6 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-white dark:hover:text-gray-300"
                                    onClick={toggleOptions}
                                />
                                {showOptions && (
                                    <div className="absolute right-0 z-50 mt-1 min-w-[160px] rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-neutral-800">
                                        <button onClick={() => router.get(`/post/${post.id}/edit`)} className="block w-full rounded-t-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-neutral-600">
                                            {translations['Edit']}
                                        </button>
                                        <button onClick={() => router.delete(`/post/${post.id}`)} className="block w-full rounded-b-lg px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-neutral-600">
                                            {translations['Delete']}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 break-all">@{post.user.username}</p>
                    <p className={`mt-1 text-[16px] lg:text-lg text-gray-700 dark:text-gray-300 break-all`}>{post.content}</p>

                    {post.media.length > 0 && (
                        <div className="mt-2 grid grid-cols-1 gap-3 py-1 sm:grid-cols-2">
                            {post.media.map((file, index) => {
                                const uniqueKey = `${post.id}-${file.id ?? file.file_path ?? index}`;
                                const mediaUrl = getMediaUrl(file);

                                return file.file_type === 'image' ? (
                                    <div key={uniqueKey} className="relative flex w-full items-center justify-center overflow-hidden rounded-lg border dark:border-gray-700">
                                        <img src={mediaUrl} alt="Post Media" className="object-contain transition-transform duration-300 hover:scale-102" />
                                    </div>
                                ) : (
                                    <div key={uniqueKey} className="relative w-full overflow-hidden rounded-lg border dark:border-gray-700">
                                        <video controls className="h-auto w-full rounded-lg object-contain">
                                            <source src={mediaUrl} type="video/mp4" />
                                        </video>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {post.hashtags?.length > 0 && (
                        <div className="mt-0.5 flex flex-wrap gap-x-1 text-[16px] break-all">
                            {post.hashtags.map((hashtag) => (
                                <Link key={hashtag.id} href={`/posts-by-hashtag/${hashtag.hashtag}`} className="text-blue-500 hover:underline">
                                    #{hashtag.hashtag}
                                </Link>
                            ))}
                        </div>
                    )}

                    {!compact && (
                        <div className="mt-3 flex items-center gap-3 text-gray-500 dark:text-gray-400">
                            <button onClick={handleLike} disabled={processing} className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}>
                                <Heart className="h-5 w-5" /><span>{likesCount}</span>
                            </button>
                            <Link href={`/post/${post.id}`} className="flex items-center gap-1 hover:text-blue-500">
                                <MessageCircle className="h-5 w-5" /><span>{post.comments_count}</span>
                            </Link>
                            <button onClick={handleFavorite} disabled={processing} className={`flex items-center gap-1 ${isFavorited ? 'text-yellow-500' : 'hover:text-yellow-500'}`}>
                                <Bookmark className="h-5 w-5" /><span>{favoritesCount}</span>
                            </button>
                            {post.user.id !== auth.user.id && !post.is_private && !post.user.is_private && (
                                <button onClick={handleRepost} disabled={processing} className={`flex items-center gap-1 ${isReposted ? 'text-green-500' : 'hover:text-green-500'}`}>
                                    <Repeat className="h-5 w-5" /><span>{repostsCount}</span>
                                </button>
                            )}
                            {post.is_private === 1 && <EyeOff className="h-5 w-5" />}

                            {post.user.id !== auth.user.id && ( // Показуємо кнопку, якщо це не ваш власний пост
                                <Link
                                    href={`/report-post/${post.id}`} // URL для сторінки скарги, передаємо ID поста
                                    className="ml-auto flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200" // `ml-auto` вирівняє її праворуч
                                    title={translations['Report']} // Текст підказки
                                >
                                    <Flag className="h-5 w-5" />
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
