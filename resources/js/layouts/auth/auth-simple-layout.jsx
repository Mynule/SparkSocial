import { usePage, Link } from '@inertiajs/react';
import { Globe } from "lucide-react";
import AppearanceToggle from "../../components/appearance-toggle";
import Icon from "../../components/ui/logo-icon.jsx";
import { useState } from 'react';

import AuthLanguageToggle from '../../components/ui/auth-language-toggle';


export default function AuthSimpleLayout({ children, title, description, imageSrc, titleSrc }) {
    const { locale } = usePage().props;
    const [localeOption, setLocaleOption] = useState(locale || 'en');
    const { translations } = usePage().props;
    return (
        <div className="bg-background flex min-h-svh">
            <div
                className="relative hidden bg-cover bg-center md:flex md:w-5/12 md:items-start md:justify-center lg:w-1/2"
                style={{ backgroundImage: `url(${imageSrc})` }}
            >
                <img src={titleSrc} alt="Title" className="mt-20 w-3/4 object-fill" />
            </div>

            <div className="flex w-full flex-col p-6 md:w-7/12 md:p-10">
                <div className="mb-6 flex w-full items-center justify-between">
                    <Icon className="h-10" />

                    <div className="flex items-center gap-2">
                        <AppearanceToggle className="justify-center p-2.5" />
                        <AuthLanguageToggle className="justify-center p-2.5" />
                    </div>
                </div>

                <div className="flex flex-1 flex-col items-center justify-center">
                    <div className="w-full max-w-sm">
                        <div className="mb-8">
                            <span className="text-5xl font-extrabold sm:text-5xl md:text-4xl lg:text-5xl">
                                {translations['In the Comfort Zone']}
                            </span>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col items-start gap-4">
                                <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
                                    <span className="sr-only">{title}</span>
                                </Link>
                                <div className="space-y-2 text-start">
                                    <h1 className="text-xl font-medium">{title}</h1>
                                    <p className="text-muted-foreground text-sm">{description}</p>
                                </div>
                            </div>
                            {children}
                        </div>
                    </div>
                </div>

                <footer className="mx-auto mt-16 flex flex-col flex-wrap items-center justify-center gap-4 text-center text-sm text-gray-500">
                    <div className="mx-auto flex flex-wrap items-center justify-center gap-4 self-center">
                        <a href="#" className="hover:underline">
                            {translations['About us']}
                        </a>
                        <a href="#" className="hover:underline">
                            {translations['Terms of service']}
                        </a>
                        <a href="#" className="hover:underline">
                            {translations['Privacy Policy']}
                        </a>
                        <a href="#" className="hover:underline">
                            {translations['Cookie Policy']}
                        </a>
                        <a href="#" className="hover:underline">
                            {translations['Contact and Registration Information']}
                        </a>
                        <a href="#" className="hover:underline">
                            {translations['Accessibility']}
                        </a>
                        <a href="#" className="hover:underline">
                            {translations['Advertising Information']}
                        </a>
                        <a href="#" className="hover:underline">
                            {translations['Blog']}
                        </a>
                        <a href="#" className="hover:underline">
                            {translations['Advertising']}
                        </a>
                        <a href="#" className="hover:underline">
                            {translations['Settings']}
                        </a>
                    </div>

                    <b>© 2025 SparkCorp</b>
                </footer>
            </div>
        </div>
    );
}














