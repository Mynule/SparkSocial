import AppLayout from '../layouts/app-layout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Button } from '../components/ui/button';

export default function ReportPost({ post, translations }) {
    const { data, setData, post: submitForm, processing, errors } = useForm({
        reason: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        submitForm(`/report-post/${post.id}`, {
            onSuccess: () => {
                router.visit('/dashboard');
            },
            onError: (errorBag) => {
                console.error('Report submission failed:', errorBag);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: translations['Report Post'], href: `/report-post/${post.id}` }]}>
            <Head title={translations['Report Post']} />

            <div className="max-w-2xl mx-auto p-4 bg-white dark:bg-neutral-900 shadow-md rounded-lg mt-8">
                <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                    {translations['Report Post']}
                </h1>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    {translations['You are reporting the following post by']} @{post.user.username}:
                </p>
                <div className="border border-gray-200 dark:border-neutral-700 p-3 rounded-md mb-4 bg-gray-50 dark:bg-neutral-800">
                    <p className="font-semibold text-gray-900 dark:text-white">{post.user.name}</p>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">{post.content}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="reason"
                               className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            {translations['Reason for reporting']}
                        </label>

                        <textarea
                            id="reason"
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            rows={3}
                            placeholder={translations['Please describe why you are reporting this post...']}
                            className="w-full resize-none rounded-md bg-gray-100 p-3 text-neutral-950 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-neutral-800 dark:text-white dark:focus:ring-blue-600"
                        />
                        {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
                    </div>

                    <Button type="submit" disabled={processing}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
                        {processing ? translations['Submitting...'] : translations['Submit Report']}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
