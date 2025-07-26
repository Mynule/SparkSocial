// Components
import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '../../components/input-error';
import TextLink from '../../components/text-link';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import AuthLayout from '../../layouts/auth-layout';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });
    const { translations } = usePage().props;
    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <AuthLayout
            title={translations["Forgot Password"]}
            description={translations["Enter your email to receive a password reset link"]}
        >
            <Head title={translations["Forgot Password"]} />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>
            )}

            <div className="space-y-6">
                <form onSubmit={submit}>
                    <div className="grid gap-4 mt-4">
                        <Label htmlFor="email">{translations["Email Address"]}</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="off"
                            value={data.email}
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder={translations["email@example.com"]}
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="my-10 flex items-center justify-start">
                        <Button className="w-full" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            {translations["Email password reset link"]}
                        </Button>
                    </div>
                </form>

                <div className="text-muted-foreground space-x-1 text-center text-sm">
                    <span>{translations["Or return to"]}</span>
                    <TextLink href={route('login')}>{translations["Log In"]}</TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}

