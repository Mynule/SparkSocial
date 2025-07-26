import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '../../layouts/app-layout';
import PostComponent from '../post/post-component';
import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

export default function Reposts() {
    const { user, posts, translations, filters } = usePage().props;
    const [isLoading, setIsLoading] = useState(false);

    const handleReload = () => {
        setIsLoading(true);
        router.reload();
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };

    const handleSortChange = (e) => {
        router.get(route('user.reposts', { username: user.username }), {
            sort: e.target.value,
        }, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <AppLayout>
            <Head title={translations['Reposts']} />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between p-6">
                <h1 className="text-2xl font-extrabold">{translations['Reposts']}</h1>

                <div className="flex gap-2">
                    <select
                        className=" px-3 py-1 border rounded-md dark:bg-neutral-900 dark:text-white w-fit"
                        value={filters.sort}
                        onChange={handleSortChange}
                    >
                        <option value="latest">{translations['Latest']}</option>
                        <option value="oldest">{translations['Oldest']}</option>
                        <option value="most_liked">{translations['Most Liked']}</option>
                        <option value="reposted_friends">{translations['People I Follow']}</option>
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
                    posts.map((post) => <PostComponent key={post.id} post={post} />)
                ) : (
                    <p className="text-gray-600 dark:text-gray-300 px-6 py-4">{translations['No reposts yet.']}</p>
                )}
            </div>
        </AppLayout>
    );
}
