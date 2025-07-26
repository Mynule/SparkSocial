import {Head, router, usePage} from '@inertiajs/react';

import AppearanceTabs from '../../components/appearance-tabs';
import HeadingSmall from '../../components/heading-small';

import AppLayout from '../../layouts/app-layout';
import SettingsLayout from '../../layouts/settings/layout';
import {useState} from "react";

const breadcrumbs = [
    {
        title: 'Language',
        href: '/settings/language',
    },
];



export default function Language() {
    const { translations } = usePage().props;
    const { locale } = usePage().props;
    const [localeOption, setLocaleOption] = useState(locale || 'en');

    const handleLanguageChange = async (e) => {
        const newLocale = e.target.value;
        setLocaleOption(newLocale);
        router.post(`/settings/language/${newLocale}`, {}, {
            preserveState: false,
            preserveScroll: true,
            only: [],
            onFinish: () => {
                window.location.reload();
            }
        });
    };

    return (<AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Language"/>

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title= {translations["Language"]} description={translations["Update your account's language"]}/>
                    <select
                        value={localeOption}
                        onChange={handleLanguageChange}
                        className="p-2 border rounded-md max-w-36 bg-gray-100 dark:bg-neutral-900 text-neutral-950 dark:text-white"
                    >
                        <option value="en">{translations["English"]}</option>
                        <option value="ua">{translations["Ukrainian"]}</option>
                    </select>
                </div>
            </SettingsLayout>
        </AppLayout>);
}

