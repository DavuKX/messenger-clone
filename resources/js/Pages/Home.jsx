import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ChatLayout from "@/Layouts/ChatLayout.jsx";
import {ChatBubbleLeftRightIcon} from "@heroicons/react/24/solid/index.js";
import {useEffect, useRef, useState} from "react";
import ConversationHeader from "@/Components/App/ConversationHeader.jsx";
import MessageItem from "@/Components/App/MessageItem.jsx";
import MessageInput from "@/Components/App/MessageInput.jsx";
import {useEventBus} from "@/EventBus.jsx";

function Home({ selectedConversation = null, messages = null }) {
    const [localMessages, setLocalMessages] = useState([]);
    const messageCtrRef = useRef(null);
    const { on } = useEventBus();

    const messageCreated = (message) => {
        if (
            selectedConversation &&
            selectedConversation.is_group &&
            parseInt(selectedConversation.id) === parseInt(message.group_id)
        ) {
            setLocalMessages((prevMessages) => [...prevMessages, message]);
        }

        if (
            selectedConversation &&
            selectedConversation.is_user &&
            (parseInt(selectedConversation.id) === parseInt(message.sender_id) ||
            parseInt(selectedConversation.id) === parseInt(message.receiver_id))
        ) {
            setLocalMessages((prevMessages) => [...prevMessages, message]);
        }
    }

    useEffect(() => {
        setTimeout(() => {
            if (messageCtrRef.current) {
                messageCtrRef.current.scrollTop = messageCtrRef.current.scrollHeight;
            }
        }, 10);

        const offCreated = on('message.created', messageCreated);

        return () => {
            offCreated();
        };
    }, [selectedConversation]);

    useEffect(() => {
        setLocalMessages(messages ? messages.data.reverse() : []);
    }, [messages]);

    return (
        <>{!messages && (
            <div className="flex flex-col gap-8 justify-center items-center text-center h-full opacity-35">
                <div className="text-2xl md:text-4xl p-16 text-slate-800">
                    Please select conversation to see messages
                </div>
                <ChatBubbleLeftRightIcon className="w-32 h-32 inline-block"/>
            </div>
        )}
            {messages && (
                <>
                    <ConversationHeader selectedConversation={selectedConversation}/>
                    <div ref={messageCtrRef} className="flex-1 overflow-y-auto p-5">
                    {/* Messages */}
                        {localMessages.length === 0 && (
                            <div className="flex justify-center items-center h-full">
                                <div className="text-lg text-slate-800">
                                    No messages found
                                </div>
                            </div>
                        )}
                        {localMessages.length > 0 && (
                            <div className="flex-1 flex flex-col">
                                {localMessages.map((message) => (
                                    <MessageItem key={message.id} message={message} />
                                ))}
                            </div>
                        )}
                    </div>
                    <MessageInput conversation={selectedConversation} />
                </>
            )}
        </>
    );
}

Home.layout = page => (
    <AuthenticatedLayout user={page.props.auth.user}>
        <ChatLayout children={page} />
    </AuthenticatedLayout>
)

export default Home;
