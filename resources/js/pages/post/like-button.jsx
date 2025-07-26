import { useState } from "react";
import { useForm, router } from '@inertiajs/react';
import { Heart } from "lucide-react";

export default function LikeButton({ postId, isLiked, likesCount }) {
    const [liked, setLiked] = useState(isLiked);
    const [count, setCount] = useState(likesCount);
    const { post, processing } = useForm();

    const toggleLike = () => {
        router.post(`/post/${postId}/${liked ? "unlike" : "like"}`, {post_id: postId},{
            preserveScroll: true,
            onSuccess: (page) => {
                console.log("Updated page props:", page.props);
            },
            onError: (errors) => {
                console.error("Error toggling like:", errors);
            }
        });
    };

    return (
        <button
            onClick={toggleLike}
            className={`flex items-center gap-1 ${liked ? 'text-red-500' : 'hover:text-red-500'}`}
        >
            <Heart className="h-5 w-5" />
            <span>{count}</span>
        </button>
    );
}
