import { Head, usePage } from '@inertiajs/react';
import AppLayout from '../../layouts/app-layout.jsx';
import PostComponent from './post-component.jsx';

export default function PostsByHashtag() {
    const { user, posts, hashtag, translations } = usePage().props;

    return (
        <AppLayout>
            <Head title={`${translations['Posts by hashtag']} #${hashtag.hashtag}`} />

            <div className="p-6 text-2xl font-extrabold break-all">{`${translations['Posts by hashtag']}  `}<span className="text-blue-500">{`#${hashtag.hashtag}`}</span></div>

            <div className="divide-y divide-gray-200 dark:divide-neutral-800">
                {posts.length > 0 ? (
                    posts.map((post) => <PostComponent key={post.id} post={post} />)
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 px-6 py-4">{translations['No posts by hashtag yet.']}</p>
                )}
            </div>
        </AppLayout>
    );
}
