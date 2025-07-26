import { Head, Link, router, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import MessageInput from '../../components/message-input.jsx';
import Message from '../../components/message.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar.jsx';
import { useInitials } from '../../hooks/use-initials.jsx';
import AppLayout from '../../layouts/app-layout.jsx';
import { getProfileImageUrl } from '../../lib/utils';

export default function UserChat() {
    const { user, chat_id, init_messages, other_user, translations } = usePage().props;
    const [messages, setMessages] = useState(init_messages || []);
    const scroll = useRef();
    const getInitials = useInitials();
    const scrollToBottom = () => {
        if (scroll && scroll.current) scroll.current.scrollIntoView({ behavior: 'smooth' });
    };

    const webSocketChannel = `chat.${chat_id}`;
    const connectWebSocket = () => {
        window.Echo.private(webSocketChannel).listen('GotPersonalMessage', async (e) => {
            await getMessages();
            const container = document.getElementById('chat-scroll-container');
            if (container && container.scrollHeight <= container.clientHeight) {
                router.post(`/chat/user-chat/${chat_id}/mark-messages-as-read`);
            }
        });
    };

    const isUserAtBottom = () => {
        const container = document.getElementById('chat-scroll-container');
        if (!container) return false;

        const threshold = 10;
        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        return distanceFromBottom < threshold;
    };

    const getMessages = async () => {
        try {
            router.reload({
                only: ['init_messages'],
                preserveState: true,
                preserveScroll: true,
                onSuccess: ({ props }) => {
                    setMessages(props.init_messages || []);
                },
            });
        } catch (err) {
            console.log(err.message);
        }
    };

    useEffect(() => {
        connectWebSocket();
        setTimeout(scrollToBottom, 0);

        const container = document.getElementById('chat-scroll-container');

        const handleScroll = async () => {
            const threshold = 10;
            const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;

            if (distanceFromBottom < threshold) {
                router.post(`/chat/user-chat/${chat_id}/mark-messages-as-read`);
            }
        };

        container.addEventListener('scroll', handleScroll);

        if (container && container.scrollHeight <= container.clientHeight) {
            router.post(`/chat/user-chat/${chat_id}/mark-messages-as-read`);
        }

        return () => {
            container.removeEventListener('scroll', handleScroll);
            window.Echo.leave(webSocketChannel);
        };
    }, []);

    useEffect(() => {
        setMessages(init_messages);
        const shouldScroll = isUserAtBottom();
        if (shouldScroll) {
            setTimeout(scrollToBottom, 0);
        }
    }, [init_messages]);

    // const getProfileImageUrl = (user) => {
    //     if (user?.profile_image?.disk === 's3') {
    //         return user.profile_image?.url;
    //     } else if (user?.profile_image?.file_path) {
    //         return `/storage/${user.profile_image?.file_path}`;
    //     }
    //     return null;
    // };
console.log(other_user);
    return (
        <AppLayout>
            <Head title={`${translations['Chat with']} ${other_user.name}`} />
            <div className="flex h-fit justify-center">
                <div className="w-full">
                    <div className="flex h-16 w-full flex-row items-center bg-gray-200 dark:bg-neutral-700">
                        <Link href={`/user/${other_user.username}`} className="flex cursor-pointer flex-row items-center">
                            <Avatar className="mx-5 h-10 w-10 overflow-hidden rounded-full md:h-12 md:w-12">
                                <AvatarImage src={getProfileImageUrl(other_user)} alt={other_user.name} />
                                <AvatarFallback className="rounded-lg bg-gray-200 text-black dark:bg-neutral-700 dark:text-white">
                                    {getInitials(other_user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="flex items-center gap-1 lg:text-lg text-sm md:text-lg font-bold mr-2 break-all">
                                {`${translations['Chat with']} ${other_user.name} (@${other_user.username})`}
                                {other_user.is_verified && (
                                    <div className="group relative">
                                        <span className="top absolute -top-7 left-1/2 -translate-x-1/2 scale-0 transform rounded-md bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                                            Verified
                                        </span>
                                        <span className="flex items-center rounded-lg bg-blue-500 p-0.5 text-xs font-medium text-white">
                                            <Check className="h-3 w-3" />
                                        </span>
                                    </div>
                                )}
                            </span>
                        </Link>
                    </div>
                    <div className="flex flex-col max-h-[calc(100vh-8.2rem)] h-[calc(100vh-8.2rem)] rounded-lg bg-white shadow-md dark:border-gray-800 dark:bg-neutral-950">
                        <div id="chat-scroll-container" className="flex-1 overflow-y-auto px-4 py-3">
                            {messages?.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {messages.map((message, index) => (
                                        <Message key={message.id || index} userId={user.id} message={message} />
                                    ))}
                                    <span ref={scroll}></span>
                                </div>
                            ) : (
                                <div className="flex h-full items-center justify-center text-center">
                                    {translations['No messages anyone yet.']}
                                </div>
                            )}
                        </div>
                        <div className="border-t p-4">
                            <MessageInput chatId={chat_id} />
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
