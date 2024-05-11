import React, {useEffect, useState} from 'react';
import {usePage} from "@inertiajs/react";
import {PencilSquareIcon} from "@heroicons/react/24/outline/index.js";
import TextInput from "@/Components/TextInput.jsx";
import ConversationItem from "@/Components/App/ConversationItem.jsx";
import {useEventBus} from "@/EventBus.jsx";

const ChatLayout = ({ children }) => {
    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversation = page.props.selectedConversation;
    const [localConversations, setLocalConversations] = useState([]);
    const [sortedConversations, setSortedConversations] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState({});
    const {on} = useEventBus();

    const isUserOnline = (userId) => onlineUsers[userId];

    const onSearch = (event) => {
        const search = event.target.value.toLowerCase();
        setLocalConversations(
            conversations.filter((conversation) => {
                return (
                    conversation.name.toLowerCase().includes(search)
                )
            })
        )
    }

    const messageCreated = (message) => {
        setLocalConversations((oldUsers) => {
            return oldUsers.map((user) => {
                if (message.receiver_id &&
                    !user.is_group &&
                    (user.id == message.sender_id || user.id == message.receiver_id)
                ) {
                    user.last_message = message.message;
                    user.last_message_date = message.created_at;
                    return user;
                }

                if (message.group_id && user.is_group && user.id == message.group_id) {
                    user.last_message = message.message;
                    user.last_message_date = message.created_at;
                    return user;
                }

                return user;
            })
        });
    }

    const messageDeleted = ({ prevMessage }) => {
        if (!prevMessage) {
            return;
        }

        messageCreated(prevMessage);
    }

    useEffect(() => {
        setSortedConversations(
            localConversations.sort((a, b) => {
                if (a.blocked_at && b.blocked_at) {
                    return a.blocked_at > b.blocked_at ? 1 : -1;
                } else if (a.blocked_at) {
                    return 1;
                } else if(b.blocked_at) {
                    return -1;
                }
                if (a.last_message_date && b.last_message_date) {
                    return b.last_message_date.localeCompare(
                        a.last_message_date
                    );
                } else if (a.last_message_date) {
                    return -1;
                } else if(b.last_message_date) {
                    return 1;
                } else {
                    return 0;
                }
            })
        )
    }, [localConversations]);

    useEffect(() => {
        setLocalConversations(conversations)
    }, [conversations]);

    useEffect(() => {
        Echo.join('online')
            .here((users) => {
                const onlineUsersObject = Object.fromEntries(
                    users.map((user) => [user.id, user])
                );

                setOnlineUsers((prevOnlineUsers) => {
                    return { ...prevOnlineUsers, ...onlineUsersObject}
                });
            })
            .joining((user) => {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = { ...prevOnlineUsers };
                    updatedUsers[user.id] = user;
                    return updatedUsers;
                })
            })
            .leaving((user) => {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = { ...prevOnlineUsers };
                    delete updatedUsers[user.id];
                    return updatedUsers;
                })
            }).error((error) => {
                console.error(error)
        })

        return () => {
            Echo.leave("online");
        }
    }, []);

    useEffect(() => {
        const offCreated = on('message.created', messageCreated);
        const offDeleted = on('message.deleted', messageDeleted);

        return () => {
            offCreated();
            offDeleted();
        }
    }, [on]);

    return (
        <>
            <div className="flex-1 w-full flex overflow-hidden">
                <div
                    className={`transition-all w-full sm:w-[220px] md:w-[300px] flex flex-col overflow-hidden ${
                        selectedConversation ? "-ml-[100%] sm:ml-0" : ""
                    }`}
                >
                    <div className="flex items-center justify-between py-2 px-3 text-xl font-medium">
                        My Conversations
                        <div className="tooltip tooltip-left" data-tip="Create new Group">
                            <button className="text-gray-500 hover:text-gray-900">
                                <PencilSquareIcon className="w-4 h-4 inline-block ml-2" />
                            </button>
                        </div>
                    </div>
                    <div className="p-3">
                        <TextInput
                            onKeyUp={onSearch}
                            placeholder="Filter users and groups"
                            className="w-full"
                        />
                    </div>
                    <div className="flex-1 overflow-auto">
                        {sortedConversations && sortedConversations.map((conversation) => (
                            <ConversationItem
                                key={`${conversation.is_group ? "group_" : "user_"}${conversation.id}`}
                                conversation={conversation}
                                online={!!isUserOnline(conversation.id)}
                                selectedConversation={selectedConversation}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex-1 flex flex-col overflow-hidden">
                    {children}
                </div>
            </div>
        </>
    );
};

export default ChatLayout;
