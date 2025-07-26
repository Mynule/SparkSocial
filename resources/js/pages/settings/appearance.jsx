import { Head, usePage } from '@inertiajs/react';

import AppearanceTabs from '../../components/appearance-tabs';
import HeadingSmall from '../../components/heading-small';

import AppLayout from '../../layouts/app-layout';
import SettingsLayout from '../../layouts/settings/layout';

const breadcrumbs = [
    {
        title: 'Appearance settings',
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    const { translations } = usePage().props;
    return (<AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings"/>

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title={translations["Appearance settings"]} description={translations["Update your account's appearance settings"]}/>
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>);
}

