import { router, usePage } from '@inertiajs/react';
import { Globe } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AuthLanguageToggle({ className = '', ...props }) {
    const { locale, translations } = usePage().props;

    const toggleLanguage = () => {
        const newLocale = locale === 'en' ? 'ua' : 'en';

        router.post(`/settings/language/${newLocale}`, {}, {
            preserveState: false,
            preserveScroll: true,
            onFinish: () => {
                window.location.reload();
            }
        });
    };

    return (
        <button
            className={cn(
                'flex items-center gap-2 rounded-full bg-neutral ml-1 transition dark:bg-neutral',
                'hover:bg-neutral-300 dark:hover:bg-neutral-700 bg-gray-100 dark:bg-neutral-800',
                className
            )}
            onClick={toggleLanguage}
            {...props}
        >
            <Globe className="h-5 w-5 " />
            {locale === 'en' ? 'EN' : 'УКР'}
        </button>
    );
}
