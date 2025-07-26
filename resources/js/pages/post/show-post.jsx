import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Bookmark, Check, EllipsisVertical, EyeOff, Heart, MessageCircle, RefreshCw, Repeat } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useInitials } from '../../hooks/use-initials';
import AppLayout from '../../layouts/app-layout';
import {Comment} from "../../components/comment.jsx";
import { getProfileImageUrl, getMediaUrl } from '../../lib/utils';

export default function Show() {
    const { post, auth, sort, translations } = usePage().props;
    const getInitials = useInitials();
    const {
        data,
        setData,
        processing,
        reset,
        errors,
    } = useForm({
        content: '',
        post_id: post.id,
        parent_comment_id: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [sortOption, setSortOption] = useState(sort || 'latest');
    const isOwnPost = auth.user && auth.user.id === post.user.id;
    const [isLiked, setIsLiked] = useState(post.is_liked);
    const [likesCount, setLikesCount] = useState(post.likes_count);
    const [isFavorited, setIsFavorited] = useState(post.is_favorited);
    const [favoritesCount, setFavoritesCount] = useState(post.favorites_count);
    const [showOptions, setShowOptions] = useState(false);
    const [isReposted, setIsReposted] = useState(post.is_reposted);
    const [repostsCount, setRepostsCount] = useState(post.reposts_count);

    const optionsRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        window.Echo.private(`post.${post.id}`).listen('CommentCreated', () => {
            router.reload();
        });
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.Echo.leave(`post.${post.id}`);
        };
    }, []);

    const toggleOptions = () => setShowOptions(!showOptions);

    const handleSortChange = (e) => {
        const selectedSort = e.target.value;
        setSortOption(selectedSort);
        router.get(`/post/${post.id}`, { sort: selectedSort }, { preserveScroll: true });
    };

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

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        router.post(
            `/post/${post.id}/comment`,
            {
                content: data.content,
                post_id: post.id,
                parent_comment_id: data.parent_comment_id,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    reset('content');
                    router.reload({ only: ['post'] });
                },
            },
        );
        setData({ content: '', post_id: post.id, parent_comment_id: null });
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
                onError: (error) => {
                    console.error('Repost error:', error);
                    setIsReposted(post.is_reposted);
                    setRepostsCount(post.reposts_count);
                },
            },
        );
    };

    const handleReload = () => {
        setIsLoading(true);
        router.reload();
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
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
    //     if (user?.profile_image?.disk === 's3') {
    //         return user.profile_image?.url;
    //     } else if (user?.profile_image?.file_path) {
    //         return `/storage/${user.profile_image.file_path}`;
    //     }
    //     return null;
    // };

    const profileImageUrl = getProfileImageUrl(post.user);

    return (
        <AppLayout>
            <Head title={`${translations['Post by']} @${post.user.username}`} />

            <div className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center space-x-3 -ml-2">
                        <Avatar className="h-20 w-20 border border-gray-200 dark:border-gray-700 text-2xl">
                            <AvatarImage src={profileImageUrl} alt={post.user.name} />
                            <AvatarFallback className="bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white">
                                {getInitials(post.user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-1 break-all">
                                <Link
                                    href={`/user/${post.user.username}`}
                                    className="text-lg font-semibold text-gray-900 hover:underline dark:text-white"
                                >
                                    {post.user.name}
                                </Link>
                                {post.user.is_verified && (
                                    <div className="group relative">
                                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 scale-0 transform rounded-md bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                                                Verified
                                            </span>
                                        <span className="flex items-center rounded-md bg-blue-500 p-0.5 text-xs font-medium text-white">
                                                <Check className="h-3 w-3" />
                                            </span>
                                    </div>
                                )}
                            </div>
                            <p className="text-md text-gray-500 dark:text-gray-400 break-all">@{post.user.username}</p>
                        </div>
                    </div>
                    {isOwnPost && (
                        <div className="relative" ref={optionsRef}>
                            <EllipsisVertical
                                className="h-6 w-6 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-white dark:hover:text-gray-300"
                                onClick={toggleOptions}
                            />
                            {showOptions && (
                                <div className="absolute right-0 z-50 mt-2 min-w-[160px] rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-neutral-800">
                                    <button
                                        onClick={() => router.get(`/post/${post.id}/edit`)}
                                        className="block w-full rounded-t-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-neutral-600"
                                    >
                                        {translations['Edit']}
                                    </button>
                                    <button
                                        onClick={() => router.delete(`/post/${post.id}`)}
                                        className="block w-full rounded-b-lg px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-neutral-600"
                                    >
                                        {translations['Delete']}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <p className="text-xl text-gray-800 dark:text-gray-200 max-w-7xl break-all">{post.content}</p>
                    {post.media.length > 0 && (
                        <div className="mt-2 grid grid-cols-1 gap-3 py-1 sm:grid-cols-2">
                            {post.media.map((file, index) => {
                                const uniqueKey = file.id ? `${post.id}-${file.id}` : `${post.id}-${file.file_path}-${index}`;
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
                        <div className="mt-2 flex flex-wrap gap-x-1 text-sm break-all lg:text-[16px]">
                            {post.hashtags.map((hashtag) => (
                                <Link key={hashtag.id} href={`/posts-by-hashtag/${hashtag.hashtag}`} className="text-blue-500 hover:underline">
                                    #{hashtag.hashtag}
                                </Link>
                            ))}
                        </div>
                    )}

                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{post.created_at}</p>
                </div>

                <div className="text-md mt-3 flex items-center space-x-6 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                        <Heart
                            className={`h-6 w-6 cursor-pointer ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                            onClick={handleLike}
                        />
                        <p>
                            <strong>{likesCount}</strong>
                        </p>
                    </div>
                    <div className="flex items-center space-x-1">
                        <MessageCircle className="h-6 w-6 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-500" />
                        <p>
                            <strong>{post.comments_count}</strong>
                        </p>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Bookmark
                            className={`h-6 w-6 cursor-pointer ${isFavorited ? 'text-yellow-500' : 'hover:yellow-red-500 text-gray-500'}`}
                            onClick={handleFavorite}
                        />
                        <p>
                            <strong>{favoritesCount}</strong>
                        </p>
                    </div>
                    {post.user.id !== auth.user.id && !post.is_private && !post.user.is_private && (
                        <button
                            onClick={handleRepost}
                            disabled={processing}
                            className={`flex items-center gap-1 ${isReposted ? 'text-green-500' : 'hover:text-green-500'}`}
                        >
                            <Repeat className="h-5 w-5" />
                            <span>{repostsCount}</span>
                        </button>
                    )}

                    {post.is_private === 1 && <EyeOff className="h-5 w-5" />}
                </div>
                {(post.reposted_by_recent.length > 0 || post.reposted_by_you) && (
                    <div className="mt-6 -mb-2 px-2">
                        {(post.reposted_by_you || post.reposted_by_recent?.length > 0) && (
                            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Repeat className="h-4 w-4" />
                                <span>{translations['Reposted by']}</span>

                                {post.reposted_by_you && (
                                    <span className="flex items-center">
                                    <Link href={`/user/${post.current_user.username}`}>
                                        <Avatar className="h-6 w-6 border">
                                            <AvatarImage src={getProfileImageUrl(post.current_user)} alt={post.current_user.name} />
                                            <AvatarFallback>{getInitials(post.current_user.name)}</AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <Link href={`/user/${post.current_user.username}`} className="ml-1 text-blue-500 hover:underline">
                                        {post.current_user.name}
                                    </Link>
                                    <span className="ml-1">{translations['(you)']}</span>
                                        {post.reposted_by_you && post.reposted_by_recent?.length > 1 && <span>,</span>}
                                </span>
                                )}

                                {post.reposted_by_recent?.map((user, index) => {
                                    if (user.id !== post.current_user.id) {
                                        return (
                                            <span key={user.id} className="flex items-center">
                                            <Link href={`/user/${user.username}`}>
                                                <Avatar className="h-6 w-6 border">
                                                    <AvatarImage src={getProfileImageUrl(user)} alt={user.name} />
                                                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                </Avatar>
                                            </Link>
                                            <Link href={`/user/${user.username}`} className="ml-1 text-blue-500 hover:underline">
                                                {user.name}
                                            </Link>
                                                {index < post.reposted_by_recent.length - 1 && <span>,</span>}
                                        </span>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="border-y bg-white p-4 dark:border-gray-800 dark:bg-neutral-950">
                <form onSubmit={handleCommentSubmit} className="flex flex-col space-y-4">
                    <textarea
                        value={data.content}
                        onChange={(e) => setData('content', e.target.value)}
                        rows={3}
                        placeholder={translations["What's on your mind?"]}
                        className="resize-none rounded-md bg-gray-100 p-3 text-neutral-950 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-neutral-900 dark:text-white dark:focus:ring-blue-600"
                    />
                    {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                    <button
                        type="submit"
                        disabled={!data.content || processing}
                        className={`mr-0.5 self-end rounded-lg px-4 py-2 text-white ${
                            data.content
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'cursor-not-allowed bg-gray-400 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700'
                        }`}
                    >
                        {translations['Publish']}
                    </button>
                </form>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b bg-white p-4 dark:border-gray-800 dark:bg-neutral-950">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {translations['Comments']}
                </h2>

                <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                    <select
                        value={sortOption}
                        onChange={handleSortChange}
                        className="w-fitf rounded-md border bg-gray-100 p-2 text-neutral-950 dark:bg-neutral-900 dark:text-white"
                    >
                        <option value="latest">{translations['Latest']}</option>
                        <option value="oldest">{translations['Oldest']}</option>
                        <option value="likes">{translations['Most Liked']}</option>
                        <option value="less_likes">{translations['Least Liked']}</option>
                    </select>

                    <button
                        onClick={handleReload}
                        className="flex items-center justify-center rounded-md border p-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-200 dark:text-white dark:hover:bg-neutral-800"
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="mt-2 px-6">
                <div className="divide-y divide-gray-200 dark:divide-neutral-800">
                    {post.comments.length > 0 ? (
                        post.comments.map((comment) => (
                            <Comment key={comment.id} comment={comment} auth_user={auth.user}/>
                        ))
                    ) : (
                        <p className="py-4 text-gray-500 dark:text-gray-400">{translations['No comments yet.']}</p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
