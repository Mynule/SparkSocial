import { Heart, EllipsisVertical } from 'lucide-react';
import { useInitials } from '../hooks/use-initials';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Link, router, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { getProfileImageUrl } from '../lib/utils';

export function Comment({ comment, auth_user }) {
    const { translations } = usePage().props;
    const [isLiked, setIsLiked] = useState(comment.is_liked);
    const [likesCount, setLikesCount] = useState(comment.likes_count);
    const [showOptions, setShowOptions] = useState(false);
    const optionsRef = useRef(null);
    const getInitials = useInitials();

    const handleLike = async () => {
        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
        const action = isLiked ? `/unlike` : `/like`;

        await router.post(
            action,
            {
                type: 'comment',
                id: comment.id,
            },
            {
                preserveScroll: true,
                onError: () => {
                    setIsLiked(comment.is_liked);
                    setLikesCount(comment.likes_count);
                },
            },
        );
    };

    const handleDeleteComment = async (commentId) => {
        // if (!window.confirm(translations['Are you sure you want to delete this comment?'])) return;
        await router.post(
            `/comment/${commentId}/delete`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['post'] });
                },
            },
        );
    };
    const toggleOptions = () => setShowOptions(!showOptions);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="flex flex-col">
            <div className="flex items-center space-x-3 py-2">
                <Avatar className="h-14 w-14 border border-gray-200 dark:border-gray-700">
                    <AvatarImage src={getProfileImageUrl(comment.user)} alt={comment.user.name} />
                    <AvatarFallback className="bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white">
                        {getInitials(comment.user.name)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Link
                                href={`/user/${comment.user.username}`}
                                className="font-semibold text-gray-900 hover:underline dark:text-white"
                            >
                                {comment.user.name}
                            </Link>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{comment.created_at}</p>
                        </div>
                    </div>
                    <p className={`mt-1 text-gray-800 dark:text-gray-200 break-all`}>{comment.content}</p>
                    <div className="mt-2  flex items-center text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                            <Heart
                                className={`h-5 w-5 cursor-pointer ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                                onClick={handleLike}
                            />
                            <p>
                                <strong>{likesCount}</strong>
                            </p>
                        </div>
                    </div>
                </div>

                {auth_user?.id === comment.user.id && (
                    <div className="relative" ref={optionsRef}>
                        <EllipsisVertical
                            className="h-5 w-5 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            onClick={toggleOptions}
                        />
                        {showOptions && (
                            <div className="absolute right-0 z-50 mt-1 min-w-[140px] rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-neutral-800">
                                <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="block w-full rounded-lg px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-neutral-600"
                                >
                                    {translations['Delete']}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
}
