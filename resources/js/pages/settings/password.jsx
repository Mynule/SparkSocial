import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useRef } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const breadcrumbs = [
    {
        title: 'Password settings',
        href: '/settings/password',
    },
];

export default function Password() {
    const passwordInput = useRef(null);
    const currentPasswordInput = useRef(null);
    const { translations } = usePage().props;

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (<AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings"/>

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title={translations["Update password"]} description={translations["Ensure your account is using a long, random password to stay secure"]}/>

                    <form onSubmit={updatePassword} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="current_password">{translations["Current password"]}</Label>

                            <Input id="current_password" ref={currentPasswordInput} value={data.current_password} onChange={(e) => setData('current_password', e.target.value)} type="password" className="mt-1 block w-full" autoComplete="current-password" placeholder={translations["Current password"]}/>

                            <InputError message={errors.current_password}/>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">{translations["New password"]}</Label>

                            <Input id="password" ref={passwordInput} value={data.password} onChange={(e) => setData('password', e.target.value)} type="password" className="mt-1 block w-full" autoComplete="new-password" placeholder={translations["New password"]}/>

                            <InputError message={errors.password}/>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">{translations["Confirm password"]}</Label>

                            <Input id="password_confirmation" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} type="password" className="mt-1 block w-full" autoComplete="new-password" placeholder={translations["Confirm password"]}/>

                            <InputError message={errors.password_confirmation}/>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>{translations["Save password"]}</Button>

                            <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                                <p className="text-sm text-neutral-600">{translations["Saved"]}</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>);
}

