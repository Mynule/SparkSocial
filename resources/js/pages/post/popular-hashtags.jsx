import { Head, Link, router, usePage } from '@inertiajs/react';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../layouts/app-layout.jsx';

export default function PopularHashtags() {
    const { hashtags, sort, translations } = usePage().props;

    const [isLoading, setIsLoading] = useState(false);

    const handleReload = () => {
        setIsLoading(true);
        router.reload();
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };

    const handleSortChange = (e) => {
        router.get(route('showPopularHashtags'), {
            sort: e.target.value,
        }, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <AppLayout>
            <Head title={translations['Popular hashtags']} />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between p-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-extrabold">{translations['Popular hashtags']}</h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        {translations['Explore trending topics by post engagement.']}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                    <select
                        value={sort}
                        onChange={handleSortChange}
                        className="w-fit rounded-md border px-3 py-1 dark:bg-neutral-900 dark:text-white"
                    >
                        <option value="likes">{translations['Most Liked']}</option>
                        <option value="posts">{translations['Most Posts']}</option>
                    </select>
                    <button
                        onClick={handleReload}
                        className="flex items-center justify-center rounded-md border p-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-200 dark:text-white dark:hover:bg-neutral-800"
                    >
                        <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>


            <div className="space-y-2.5 px-6">
                {hashtags.length > 0 ? (
                    hashtags.map((hashtag) => (
                        <Link
                            key={hashtag.id}
                            href={`/posts-by-hashtag/${hashtag.hashtag}`}
                            className="block rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-blue-500">#{hashtag.hashtag}</h2>
                                <div className="space-x-4 text-[15px] text-gray-500 dark:text-neutral-300">
                                    <span>
                                        {hashtag.posts_count} {translations['Posts']}
                                    </span>
                                    <span>
                                        {hashtag.total_likes} {translations['Likes']}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="pt-10 text-center text-gray-500 dark:text-gray-400">{translations['No popular hashtags found.']}</div>
                )}
            </div>
        </AppLayout>
    );
}
