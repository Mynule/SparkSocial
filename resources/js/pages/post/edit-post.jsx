import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AppLayout from '../../layouts/app-layout';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { useState } from 'react';
import { HashtagInput } from '../../components/hashtag-input.jsx';
import { X } from 'lucide-react';
import { getMediaUrl } from '@/lib/utils';

export default function EditPost() {
    const { post, auth, translations } = usePage().props;

    const [removedMediaPaths, setRemovedMediaPaths] = useState([]);

    const { data, setData, post: submit, processing, errors } = useForm({
        content: post.content || '',
        is_private: post.is_private || false,
        media: null,
        remove_media: [],
        hashtags: (post.hashtags || []).map((h) => h.hashtag),
        _method: 'PATCH',
    });
    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('content', data.content);
        formData.append('is_private', data.is_private ? '1' : '0');
        formData.append('_method', 'PATCH');

        removedMediaPaths.forEach(path => {
            formData.append('remove_media[]', path);
        });

        data.hashtags.forEach(tag => {
            formData.append('hashtags[]', tag);
        });

        if (data.media) {
            for (let i = 0; i < data.media.length; i++) {
                formData.append('media[]', data.media[i]);
            }
        }

        submit(route('post.update', post.id), {
            data: formData,
            forceFormData: true,
        });
    };

    const clearMediaInput = () => {
        setData('media', null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const canUpdate =
        (data.content && data.content.trim() !== '') ||
        (data.media && data.media.length > 0) ||
        (post.media?.some(m => !removedMediaPaths.includes(m.file_path)));

    // const getMediaUrl = (file) => {
    //     if (file?.disk === 's3') {
    //         return file.url;
    //     } else if (file?.file_path) {
    //         return `/storage/${file.file_path}`;
    //     }
    //     return null;
    // };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'My Posts', href: `/user/${auth.user.username}` },
                { title: 'Edit Post', href: `/posts/${post.id}` },
            ]}
        >
            <Head title={translations['Edit Post']} />

            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">{translations['Edit Post']}</h1>

                <div className="flex items-center justify-start my-3">
                    <label className="text-sm text-gray-700 dark:text-gray-200">
                        {translations['Private (Only for subscribers)']} <span className="text-gray-500">({data.is_private ? translations['Yes'] : translations['No']})</span>
                    </label>
                    <Switch checked={data.is_private} onChange={(val) => setData('is_private', val)} />
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
                    <div>
                        <label className="mb-2 block text-gray-700 dark:text-gray-200">{translations['Content']}</label>
                        <textarea
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            rows={5}
                            className={`w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-gray-900 dark:text-white shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.content ? 'border-red-500' : ''
                            }`}
                        />
                        {errors.content && <div className="mt-1 text-red-500 text-sm">{errors.content}</div>}
                    </div>

                    {post.media?.length > 0 && (
                        <div className="space-y-2">
                            <label className="block text-gray-700 dark:text-gray-200">{translations['Current Media']}</label>
                            <div className="grid grid-cols-2 gap-4">
                                {post.media
                                    .filter((m) => !removedMediaPaths.includes(m.file_path))
                                    .map((m) => (
                                        <div key={m.file_path} className="relative rounded-md overflow-hidden border dark:border-gray-700 group">
                                            {m.file_type.includes('image') ? (
                                                <img
                                                    src={getMediaUrl(m)}
                                                    alt=""
                                                    className="h-40 w-full object-contain bg-gray-100 dark:bg-neutral-800"
                                                />
                                            ) : (
                                                <video
                                                    src={getMediaUrl(m)}
                                                    controls
                                                    className="h-40 w-full object-contain bg-gray-100 dark:bg-neutral-800"
                                                />
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = [...removedMediaPaths, m.file_path];
                                                    setRemovedMediaPaths(updated);
                                                    setData('remove_media', updated);
                                                }}

                                                className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-md text-xs hover:bg-red-700"
                                            >
                                                {translations['Remove']}
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-row flex-wrap gap-4 xl:flex-nowrap">
                        <div className="flex w-full flex-col items-start gap-y-2">
                            <label className="block text-sm text-gray-700 dark:text-gray-200">
                                {translations['Hashtags']}
                            </label>
                            <HashtagInput
                                placeholder={translations['Add hashtag...']}
                                initialHashtags={(post.hashtags || []).map((h) => h.hashtag)}
                                value={data.hashtags}
                                onChange={(hashtags) => setData('hashtags', hashtags)}
                            />
                        </div>

                        <div className="flex-1/2">
                            <label className="block text-sm text-gray-700 dark:text-gray-200">
                                {translations['Upload Media (Images or Videos)']}
                            </label>

                            <div className="mt-3 w-full max-w-full flex items-center gap-2">
                                <Input
                                    type="file"
                                    multiple
                                    onChange={(e) => setData('media', e.target.files)}
                                    className="w-full break-all"
                                />
                                {data.media && (
                                    <button
                                        type="button"
                                        onClick={clearMediaInput}
                                        className="shrink-0 rounded-full p-2 bg-gray-200 hover:bg-red-100 dark:bg-neutral-700 dark:hover:bg-red-900 text-gray-600 hover:text-red-600 dark:text-gray-200 dark:hover:text-red-400"
                                        title="Clear media"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {data.media && data.media.length > 0 && (
                                <ul className="mt-2 list-disc pl-4 text-sm text-gray-500 space-y-1 overflow-hidden break-all">
                                    {Array.from(data.media).map((file, index) => (
                                        <li key={index} className="max-w-6xl" title={file.name}>
                                            {file.name}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {errors['media.0'] && (
                                <p className="text-sm text-red-500 mt-1">{errors['media.0']}</p>
                            )}
                        </div>
                    </div>


                    <div className="flex justify-end gap-2">
                        <Link
                            href={`/post/${post.id}`}
                            className="rounded-md bg-gray-300 px-4 py-2 text-gray-900 hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                        >
                            {translations['Cancel']}
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing || !canUpdate}
                            className={`px-4 py-5 self-end text-white transition ${!canUpdate ? 'cursor-not-allowed bg-gray-400 dark:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {translations['Update']}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
