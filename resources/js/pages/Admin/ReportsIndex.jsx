import React from 'react';
import AppLayout from '../../layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';

export default function ReportsIndex({ reports }) {
    const { translations } = usePage().props;

    const handleDeletePostAndReport = (reportId, postId) => {
        if (confirm(translations['Are you sure you want to delete this post? This action cannot be undone.'])) {
            router.delete(route('admin.reports.destroyPostAndReport', { report: reportId, post: postId }), {
                onSuccess: () => {
                    router.reload({ only: ['reports'] });
                },
                onError: (errors) => {
                    alert(translations['Error deleting post:'] + JSON.stringify(errors));
                }
            });
        }
    };
    const handleDeleteReportOnly = (reportId) => {
        if (confirm(translations['Are you sure you want to delete this report?'])) {
            router.delete(route('admin.reports.destroyReport', { report: reportId }), {
                onSuccess: () => {
                    router.reload({ only: ['reports'] });
                },
                onError: (errors) => {
                    alert(translations['Error deleting report:'] + JSON.stringify(errors));
                }
            });
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: translations['Admin Reports'], href: '/admin/reports' }]}>
            <Head title={translations['Admin Reports']} />

            <div className="p-6 text-2xl font-extrabold">{translations['All Reports']}</div>

            <div className="mb-4 min-w-0 rounded-lg bg-white shadow-md dark:bg-neutral-950">
                {reports.data.length > 0 ? (
                    <div className="w-full overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-800">
                            <thead className="bg-gray-50 dark:bg-neutral-900">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
                                    >
                                        {translations['ID']}
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
                                    >
                                        {translations['Reported By']}
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
                                    >
                                        {translations['Post Content']}
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
                                    >
                                        {translations['Reason']}
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
                                    >
                                        {translations['Actions']}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-neutral-800 dark:bg-neutral-950">
                                {reports.data.map((report) => (
                                    <tr key={report.id}>
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-white">{report.id}</td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-700 dark:text-gray-300">
                                            <Link href={`/user/${report.user.username}`} className="text-blue-500 hover:underline">
                                                {report.user.name}
                                            </Link>
                                        </td>
                                        <td className="max-w-sm truncate px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                            {report.post ? (
                                                <Link href={`/post/${report.post.id}`} className="text-blue-500 hover:underline">
                                                    {report.post.content.substring(0, 50)}...
                                                </Link>
                                            ) : (
                                                translations['Post deleted']
                                            )}
                                        </td>
                                        <td className="max-w-xs px-6 py-4 text-sm whitespace-normal text-gray-700 dark:text-gray-300">
                                            {report.reason}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                            <div className="flex flex-col items-center space-y-1">
                                                {report.post && (
                                                    <button
                                                        onClick={() => handleDeletePostAndReport(report.id, report.post.id)}
                                                        className="w-full rounded-md border border-red-500 bg-transparent px-3 py-1 text-center text-sm text-red-500 transition-colors duration-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        {translations['Delete Post']}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteReportOnly(report.id)}
                                                    className="w-full rounded-md bg-blue-600 px-3 py-1 text-center text-sm text-white transition-colors duration-200 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                                                >
                                                    {translations['Delete Report']}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="p-6 text-gray-500 dark:text-gray-400">{translations['No reports to display.']}</p>
                )}

                {reports.links.length > 3 && (
                    <div className="mt-4 flex justify-center pb-4">
                        {reports.links.map((link, key) => (
                            <Link
                                key={key}
                                href={link.url || '#'}
                                className={`mx-1 border px-3 py-2 leading-tight ${
                                    link.active
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300 dark:hover:bg-neutral-700'
                                } ${!link.url ? 'cursor-not-allowed opacity-50' : ''} `}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
