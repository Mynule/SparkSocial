import React, {useRef, useState} from "react";
import {router, usePage} from "@inertiajs/react";
import {SendIcon} from "lucide-react";

export default function MessageInput({ chatId }) {
    const { translations } = usePage().props;
    const [message, setMessage] = useState("");
    const textareaRef = useRef(null);

    const messageRequest = async (text) => {
        try {
            if (!chatId){
                await router.post(`/chat/message`, {
                    text,
                });
            }
            else{
                await router.post(`/chat/user-chat/post-message`, {
                    chatId,
                    text,
                });
            }
        } catch (err) {
            console.log(err.message);
        }
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (message.trim() === "") {
            return;
        }

        messageRequest(message);
        setMessage("");
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e) => {
        if(e.key === 'Enter')
        {
            sendMessage(e);
        }
    };

    const handleChange = (e) => {
        const el = e.target;
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
        setMessage(el.value);
    };


    return (
        <div className="flex h-10 w-full gap-2">
           <textarea
               ref={textareaRef}
               value={message}
               onChange={handleChange}
               onKeyDown={handleKeyDown}
               rows={1}
               placeholder={translations['Write...']}
               autoComplete="off"
               className="flex-grow rounded-lg border border-gray-300 px-4 py-2 text-sm text-black focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white dark:focus:ring-blue-900 resize-none overflow-hidden w-full"
           />
            <button
                onClick={sendMessage}
                type="button"
                className={`rounded-lg px-4 py-2 text-sm text-white transition-colors ${
                    message
                        ? 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-900 dark:hover:bg-blue-950'
                        : 'cursor-not-allowed bg-gray-400 dark:bg-gray-600'
                }`}
            >
                <SendIcon />
            </button>
        </div>
    );
};
