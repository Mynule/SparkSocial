import { Head, useForm, usePage } from '@inertiajs/react';
import { EyeOff, LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { useState } from 'react';


export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const { translations } = usePage().props;
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [cpasswordVisible, setCPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => setPasswordVisible((prev) => !prev);
    const toggleCPasswordVisibility = () => setCPasswordVisible((prev) => !prev);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title={translations["Join Spark"]}
            description={translations["Enter your details below to create your account"]}
        >
            <Head title={translations["Sign Up"]} />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-5">
                        <Label htmlFor="name">{translations["Full Name"]}</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder={translations["Full Name"]}
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">{translations["Email Address"]}</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder={translations["email@example.com"]}
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">{translations["Password"]}</Label>
                        <div className="flex gap-1.5">
                            <Input
                                id="password"
                                type={passwordVisible ? "text" : "password"}
                                required
                                tabIndex={3}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder={translations["Password"]}
                            />
                            <button type="button" className="flex items-center" onClick={togglePasswordVisibility}>
                                <EyeOff className="h-5 w-5 hover:cursor-pointer" />
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">{translations["Confirm Password"]}</Label>
                        <div className="flex gap-1.5">
                            <Input
                                id="password_confirmation"
                                type={cpasswordVisible ? "text" : "password"}
                                required
                                tabIndex={4}
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                disabled={processing}
                                placeholder={translations["Confirm Password"]}
                            />
                            <button type="button" className="flex items-center" onClick={toggleCPasswordVisibility}>
                                <EyeOff className="h-5 w-5 hover:cursor-pointer" />
                            </button>
                        </div>
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {translations["Create Account"]}
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    {translations["Already have an account?"]}{' '}
                    <TextLink href={route('login')} tabIndex={6}>
                        {translations["Log In"]}
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
