import React, { useEffect, useRef, useState } from "react";
import Message from "../../components/message.jsx";
import MessageInput from "../../components/message-input.jsx";
import {Head, router, usePage} from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout.jsx";

export default function EveryoneChat () {
    const { user, init_messages, translations } = usePage().props;
    const [messages, setMessages] = useState(init_messages || []);
    const scroll = useRef();
    const scrollToBottom = () => {
        if (scroll && scroll.current)
            scroll.current.scrollIntoView({ behavior: "smooth" });
    };

    const webSocketChannel = `channel_for_everyone`;
    const connectWebSocket = () => {
        window.Echo.private(webSocketChannel)
            .listen('GotMessage', async (e) => {
                console.log(e.message)
                await getMessages();
            });
    }

    const getMessages = async () => {
        try {
            router.reload({
                only: ['init_messages'],
                preserveState: true,
                preserveScroll: true,
                onSuccess: ({ props }) => {
                    setMessages(props.init_messages || []);
                }
            });

        } catch (err) {
            console.log(err.message);
        }
    };

    useEffect(() => {
        connectWebSocket();
        setTimeout(scrollToBottom, 0);
        return () => {
            window.Echo.leave(webSocketChannel);
        }
    }, []);

    useEffect(() => {
        setMessages(init_messages);
        setTimeout(scrollToBottom, 0);
    }, [init_messages]);

    return (
        <AppLayout>
            <Head title={translations['Everyone chat']} />
            <div className="flex justify-center h-fit">
                <div className="w-full">
                    <div className="flex flex-col max-h-[calc(100vh-4.2rem)] h-[calc(100vh-4.2rem)] rounded-lg bg-white shadow-md dark:border-gray-800 dark:bg-neutral-950">
                        <div className="flex-1 flex flex-col overflow-y-auto px-4 py-3">
                            {messages?.length > 0 ? (
                                <>
                                    <div className="mt-auto flex flex-col gap-2">
                                        {messages.map((message, index) => (
                                            <Message
                                                key={message.id || index}
                                                userId={user.id}
                                                message={message}
                                            />
                                        ))}
                                        <span ref={scroll}></span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-center">
                                    {translations['No messages anyone yet.']}
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t">
                            <MessageInput />
                        </div>
                    </div>
                </div>
            </div>

        </AppLayout>
    );
};
