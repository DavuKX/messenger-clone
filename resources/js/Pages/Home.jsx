import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ChatLayout from "@/Layouts/ChatLayout.jsx";
import {ChatBubbleLeftRightIcon} from "@heroicons/react/24/solid/index.js";
import {useCallback, useEffect, useRef, useState} from "react";
import ConversationHeader from "@/Components/App/ConversationHeader.jsx";
import MessageItem from "@/Components/App/MessageItem.jsx";
import MessageInput from "@/Components/App/MessageInput.jsx";
import {useEventBus} from "@/EventBus.jsx";
import axios from "axios";
import AttachmentPreviewModal from "@/Components/App/AttachmentPreviewModal.jsx";

function Home({ selectedConversation = null, messages = null }) {
    const [localMessages, setLocalMessages] = useState([]);
    const loadMoreIntersect = useRef(null);
    const messageCtrRef = useRef(null);
    const [scrollFromBottom, setScrollFromBottom] = useState(0);
    const [noMoreMessages, setNoMoreMessages] = useState(false);
    const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
    const [previewAttachment, setPreviewAttachment] = useState({});
    const { on } = useEventBus();

    const messageDeleted = ({ message }) => {
        if (
            selectedConversation &&
            selectedConversation.is_group &&
            parseInt(selectedConversation.id) === parseInt(message.group_id)
        ) {
            setLocalMessages((prevMessages) => {
                return prevMessages.filter((msg) => msg.id !== message.id);
            });
        }

        if (
            selectedConversation &&
            selectedConversation.is_user &&
            (parseInt(selectedConversation.id) === parseInt(message.sender_id) ||
                parseInt(selectedConversation.id) === parseInt(message.receiver_id))
        ) {
            setLocalMessages((prevMessages) => {
                return prevMessages.filter((msg) => msg.id !== message.id);
            });
        }
    }

    const onAttachmentClick = (attachments, index) => {
        setPreviewAttachment({
            attachments: attachments,
            index: index,
        });
        setShowAttachmentPreview(true);
    }

    const loadMoreMessages = useCallback(() => {
        if (noMoreMessages) {
            return;
        }

        const firstMessage = localMessages[0];
        axios
            .get(route("message.loadOlder", firstMessage.id))
            .then(({ data }) => {
                if (data.data.length === 0) {
                    setNoMoreMessages(true);
                    return;
                }
                const scrollHeight = messageCtrRef.current.scrollHeight;
                const scrollTop = messageCtrRef.current.scrollTop;
                const clientHeight = messageCtrRef.current.clientHeight;
                const tmpScrollFromBottom = scrollHeight - scrollTop - clientHeight;
                setScrollFromBottom(tmpScrollFromBottom);
                setLocalMessages((prevMessages) => [...data.data.reverse(), ...prevMessages]);
            });

    }, [localMessages, noMoreMessages]);

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
        const offDeleted = on('message.deleted', messageDeleted);

        setScrollFromBottom(0);
        setNoMoreMessages(false);

        return () => {
            offCreated();
            offDeleted();
        };
    }, [selectedConversation]);

    useEffect(() => {
        setLocalMessages(messages ? messages.data.reverse() : []);
    }, [messages]);

    useEffect(() => {
        if (messageCtrRef.current && scrollFromBottom !== null) {
            messageCtrRef.current.scrollTop =
                messageCtrRef.current.scrollHeight -
                messageCtrRef.current.offsetHeight -
                scrollFromBottom;
        }
        if (noMoreMessages) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => entries.forEach(
                (entry) => entry.isIntersecting && loadMoreMessages()
            ),
            {
                rootMargin: "0px 0px 250px 0px",
            }
        );

        if (loadMoreIntersect.current) {
            setTimeout(() => {
                observer.observe(loadMoreIntersect.current);
            }, 100)
        }

        return () => observer.disconnect();
    }, [localMessages]);

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
                                <div ref={loadMoreIntersect}></div>
                                {localMessages.map((message) => (
                                    <MessageItem key={message.id} message={message} attachmentClick={onAttachmentClick} />
                                ))}
                            </div>
                        )}
                    </div>
                    <MessageInput conversation={selectedConversation} />
                </>
            )}
            {previewAttachment.attachments && (
                <AttachmentPreviewModal
                    attachments={previewAttachment.attachments}
                    index={previewAttachment.index}
                    show={showAttachmentPreview}
                    onClose={() => setShowAttachmentPreview(false)}
                />
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
