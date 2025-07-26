// Components
import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import TextLink from '../../components/text-link';
import { Button } from '../../components/ui/button';
import AuthLayout from '../../layouts/auth-layout';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});
    const { translations } = usePage().props;
    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (<AuthLayout title={translations["Verify email"]} description={translations["Please verify your email address by clicking on the link we just emailed to you."]}>
            <Head title={translations["Email verification"]}/>

            {status === 'verification-link-sent' && (<div className="my-[-0.5rem]"><div className="text-sm font-medium text-green-600">
                {translations["A new verification link has been sent to the email address you provided during registration."]}
                </div>
                <div className="mb-4 text-sm text-green-600 font-extrabold">
                    {translations["Please make sure to check your spam inbox!"]}
                </div></div>)}

            <form onSubmit={submit} className="space-y-6 text-center">
                <Button disabled={processing} variant="secondary">
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin"/>}
                    {translations["Resend verification email"]}
                </Button>

                <TextLink href={route('logout')} method="post" className="mx-auto block text-sm">
                    {translations["Log out"]}
                </TextLink>
            </form>
        </AuthLayout>);
}

