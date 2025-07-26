import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';



export default function SettingsLayout({ children }) {
    const { translations } = usePage().props;
    const sidebarNavItems = [
        {
            title: translations["Profile"],
            url: '/settings/profile',
            icon: null,
        },
        {
            title: translations["Password"],
            url: '/settings/password',
            icon: null,
        },
        {
            title: translations["Appearance"],
            url: '/settings/appearance',
            icon: null,
        },
        {
            title: translations["Language"],
            url: '/settings/language',
            icon: null,
        },
    ];

    const currentPath = window.location.pathname;

    return (<div className="px-4 py-6">
        <Heading
            title={translations["Settings"]}
            description={translations["Manage your profile and account settings"]}
        />

        <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
            <aside className="w-full max-w-xl lg:w-48">
                <nav className="flex flex-col space-y-1 space-x-0">
                    {sidebarNavItems.map((item) => (
                        <Button
                            key={item.url}
                            size="sm"
                            variant="ghost"
                            asChild
                            className={cn('w-full justify-start', {
                                'bg-muted': currentPath === item.url,
                            })}
                        >
                            <Link href={item.url} prefetch>
                                {item.title}
                            </Link>
                        </Button>
                    ))}
                </nav>
            </aside>

            <Separator className="my-6 md:hidden" />

            <div className="flex-1 md:max-w-2xl">
                <section className="max-w-xl space-y-12">{children}</section>
            </div>
        </div>
    </div>);
}

