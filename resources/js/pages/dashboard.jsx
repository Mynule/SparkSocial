import { useRef, useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '../layouts/app-layout';
import PostComponent from './post/post-component';
import { RefreshCw, X } from 'lucide-react';
import { HashtagInput } from '../components/hashtag-input';
import {Input} from "../components/ui/input.jsx";
import {Switch} from "../components/ui/switch.jsx";

export default function Dashboard() {
    const { users, posts, sort, translations } = usePage().props;
    const [sortOption, setSortOption] = useState(sort || 'latest');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const hashtagRef = useRef();
    const fileInputRef = useRef();

    const [data, setData] = useState({
        content: '',
        parent_post_id: null,
        is_private: false,
        media: [],
        hashtags: [],
    });

    const [errors, setErrors] = useState({});

    const handleSortChange = (e) => {
        const selectedSort = e.target.value;
        setSortOption(selectedSort);
        router.get('/dashboard', { sort: selectedSort }, { preserveScroll: true });
    };

    const handleMediaChange = (e) => {
        const files = Array.from(e.target.files);
        setData((prev) => ({ ...prev, media: files }));
        setSelectedFiles(files.map((file) => file.name));
    };

    const handlePostSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('content', data.content);
        formData.append('parent_post_id', data.parent_post_id || '');
        formData.append('is_private', data.is_private ? 1 : 0);

        const contentTags = data.content.match(/#(\w+)/g)?.map(tag => tag.slice(1)) || [];
        const manualTags = data.hashtags || [];

        const combinedTags = Array.from(new Set([...contentTags, ...manualTags]));

        combinedTags.forEach((tag, index) => {
            formData.append(`hashtags[${index}]`, tag);
        });

        if (data.media.length > 0) {
            data.media.forEach((file, index) => {
                formData.append(`media[${index}]`, file);
            });
        }

        router.post('/dashboard', formData, {
            forceFormData: true,
            onSuccess: () => {
                setData({
                    content: '',
                    parent_post_id: null,
                    is_private: false,
                    media: [],
                    hashtags: [],
                });
                setSelectedFiles([]);
                setErrors({});
                hashtagRef.current?.reset();
                fileInputRef.current.value = null;
            },
            onError: (errorBag) => {
                setErrors(errorBag);
            },
        });
    };

    const handleReload = () => {
        setIsLoading(true);
        router.reload({ only: ['posts'] });
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };

    const clearMediaInput = () => {
        setData('media', null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title={translations['Dashboard']} />

            <div className="p-6 text-2xl font-extrabold">{translations["What's new?"]}</div>

            <div className="border-y bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
                <form onSubmit={handlePostSubmit} className="flex flex-col space-y-4">
                    <div className=" flex items-center justify-start">
                        <label className="text-sm text-gray-700 dark:text-gray-200">
                            {translations['Private (Only for subscribers)']}{' '}
                            <span className="text-gray-500">({data.is_private ? translations['Yes'] : translations['No']})</span>
                        </label>
                        <Switch checked={data.is_private} onChange={(val) => setData((prev) => ({ ...prev, is_private: val }))} />
                    </div>
                    <textarea
                        value={data.content}
                        onChange={(e) => setData((prev) => ({ ...prev, content: e.target.value }))}
                        rows={3}
                        placeholder={translations["What's on your mind?"]}
                        className="resize-none rounded-md bg-gray-100 p-3 text-neutral-950 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-neutral-900 dark:text-white dark:focus:ring-blue-600"
                    />
                    {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                    <hr />

                    <div className="flex flex-row flex-wrap gap-4 xl:flex-nowrap">
                        <div className="flex w-full flex-col items-start gap-y-2">
                            <label className="block text-sm text-gray-700 dark:text-gray-200">{translations['Hashtags']}</label>
                            <HashtagInput
                                placeholder={translations['Add hashtag...']}
                                ref={hashtagRef}
                                value={data.hashtags}
                                onChange={(hashtags) => setData((prev) => ({ ...prev, hashtags }))}
                            />
                        </div>
                        <div className="flex-1/2">
                            <label className="block text-sm text-gray-700 dark:text-gray-200">
                                {translations['Upload Media (Images or Videos)']}
                            </label>

                            <div className="mt-3 w-full max-w-full flex items-center gap-2">
                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    onChange={handleMediaChange}
                                    className="w-full break-all"
                                />
                                {data.media && data.media.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData((prev) => ({ ...prev, media: [] }));
                                            setSelectedFiles([]);
                                            if (fileInputRef.current) fileInputRef.current.value = null;
                                        }}
                                        className="shrink-0 rounded-full p-2 bg-gray-200 hover:bg-red-100 dark:bg-neutral-700 dark:hover:bg-red-900 text-gray-600 hover:text-red-600 dark:text-gray-200 dark:hover:text-red-400"
                                        title="Clear media"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>


                            {selectedFiles.length > 0 && (
                                <ul className="mt-2 list-disc pl-4 text-sm text-gray-500 space-y-1 overflow-hidden break-all">
                                    {selectedFiles.map((name, index) => (
                                        <li
                                            key={index}
                                            className="` max-w-6xl"
                                            title={name}
                                        >
                                            {name}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {errors['media.0'] && (
                                <p className="text-sm text-red-500 mt-1">{errors['media.0']}</p>
                            )}
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={!data.content && (!data.media || data.media.length === 0)}
                        className={`self-end rounded-lg px-4 py-2 text-white transition ${
                            !data.content && (!data.media || data.media.length === 0)
                                ? 'cursor-not-allowed bg-gray-400 dark:bg-gray-600'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {translations['Publish']}
                    </button>




                </form>
            </div>

            <div className="flex items-center mx-1 gap-1 justify-between border-b bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{translations['Posts']}</h2>
                <div className="flex gap-2">
                    <select
                        value={sortOption}
                        onChange={handleSortChange}
                        className="ml-auto w-fit rounded-md border bg-gray-100 p-2 text-neutral-950 dark:bg-neutral-900 dark:text-white"
                    >
                        <option value="latest">{translations['Latest']}</option>
                        <option value="oldest">{translations['Oldest']}</option>
                        <option value="likes">{translations['Most Liked']}</option>
                        <option value="comments">{translations['Most Commented']}</option>
                        <option value="reposts">{translations['Most Reposted']}</option>
                        <option value="favorites">{translations['Most Favorited']}</option>
                        <option value="most_activity">{translations['Most Activity']}</option>
                        <option value="followees">{translations['People I Follow']}</option>
                        <option value="followers">{translations['People Who Follow Me']}</option>
                        <option value="mutuals">{translations['Mutual Friends']}</option>
                    </select>

                    <button
                        onClick={handleReload}
                        className="flex items-center rounded-md border p-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-200 dark:text-white dark:hover:bg-neutral-800"
                    >
                        <RefreshCw className={`h-6 w-6 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-neutral-800">
                {posts.length > 0 ? (
                    posts.map((post) => <PostComponent key={post.id} post={post} />)
                ) : (
                    <p className="px-6 py-4 text-gray-500 dark:text-gray-400">{translations['No posts yet.']}</p>
                )}
            </div>
        </AppLayout>
    );
}
