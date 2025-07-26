import TextLink from '@/components/text-link.jsx';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarSeparator } from './ui/sidebar';
import { UserInfo } from './user-info.jsx';

export function AppExtraSidebar() {
    const { auth, translations } = usePage().props;
    const user = auth?.user;
    const [users, setUsers] = useState([]);
    const [hashtags, setHashtags] = useState([]);
    const isLargeScreen = useMediaQuery('(min-width: 1024px)');

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/users-list');
                const users = await response.json();
                setUsers(users);
            } catch (error) {
                console.error('Error fetching users:', error);
            }

            try {
                const response = await fetch('/popular-hashtags');
                const hashtags = await response.json();
                setHashtags(hashtags);
            } catch (error) {
                console.error('Error fetching hashtags:', error);
            }
        }

        fetchData();
    }, [user]);

    function useMediaQuery(query) {
        const [matches, setMatches] = useState(window.matchMedia(query).matches);

        useEffect(() => {
            const mediaQuery = window.matchMedia(query);
            const handleChange = () => setMatches(mediaQuery.matches);

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }, [query]);

        return matches;
    }

    return (
        <Sidebar
            side="right"
            variant="inset"
            // collapsible={isLargeScreen ? "offcanvas" : "none"}
            collapsible="none"
            className="fixed top-16 right-0 hidden h-[calc(100vh-4rem)] w-[17rem] bg-transparent pr-2.5 shadow-md lg:block"
        >
            <SidebarHeader></SidebarHeader>

            <SidebarContent>
                <SidebarMenu className="px-2.5 py-1">
                    <h2 className="m-2 font-bold">{translations["Let's get acquainted"]}</h2>
                    {users.length === 0 ? (
                        <p className="text-gray-500">{translations['No users yet.']}</p>
                    ) : (
                        <ul className="flex flex-col gap-2">
                            {users.map((user) => (
                                <SidebarMenuButton asChild key={user.id} className="flex items-center gap-y-2 border py-10 dark:border-gray-700">
                                    <Link href={`/user/${user.username}`} className="flex w-full items-center">
                                        <UserInfo user={user} />
                                    </Link>
                                </SidebarMenuButton>
                            ))}
                        </ul>
                    )}
                    <TextLink
                        href={'/dashboard/users'}
                        className="mx-4 my-1 text-blue-500 no-underline hover:text-blue-600 hover:underline dark:hover:text-blue-400"
                    >
                        {translations['All users']}
                    </TextLink>
                    <SidebarSeparator />
                    <h2 className="m-2 font-bold">
                        <Link href="/show-popular-hashtags">{translations['Popular hashtags']}</Link>
                    </h2>
                    {hashtags.length === 0 ? (
                        <p className="text-gray-500">{translations['No hashtags yet.']}</p>
                    ) : (
                        <div className="mb-1 flex flex-col gap-1">
                            {hashtags.map((hashtag) => (
                                <TextLink
                                    key={hashtag.id}
                                    href={`/posts-by-hashtag/${hashtag.hashtag}`}
                                    className="mx-3 flex items-center gap-1 text-blue-500 no-underline hover:text-blue-600 hover:underline dark:hover:text-blue-400"
                                >
                                    <span className="inline-block max-w-[200px] truncate">#{hashtag.hashtag}</span>
                                    <span className="whitespace-nowrap text-gray-500 dark:text-gray-400">({hashtag.uses_count})</span>
                                </TextLink>
                            ))}
                        </div>
                    )}
                    <SidebarSeparator />
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    );
}
