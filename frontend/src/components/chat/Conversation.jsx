import React, { useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getChatHistory, sendMessage } from '@/api';
import { getPfpUrl } from '@/lib/utils';

const ConversationBox = ({ user, selectedChat }) => {
    const interlocutor = selectedChat?.matchProfile;
    const messagesEndRef = useRef(null);

    const { data: chatLog, isLoading, error, refetch } = useQuery({
        queryKey: ['chatHistory', interlocutor?.username],
        queryFn: () => getChatHistory({ sender: user?.username, receiver: interlocutor?.username }),
        enabled: !!interlocutor?.username && !!user?.username
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatLog]);

    const sendMessageMutation = useMutation({
        mutationFn: sendMessage,
        onSuccess: () => { refetch(); },
        onError: (event) => {
            console.error('Error sending message:', event);
        },
    });

    const handleSendMessage = (event) => {
        event.preventDefault();
        const message = event.target.elements.message.value.trim();
        if (!message) return;

        sendMessageMutation.mutate({
            sender: user?.username,
            receiver: interlocutor?.username,
            message
        });
        event.target.reset();
    };

    if (isLoading) return (
        <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </div>
    );
    if (error) return (
        <div className="flex-1 flex items-center justify-center text-red-500">
            Error: {error.message}
        </div>
    );

    return (
        <div className="flex-1 bg-neutral-900 flex flex-col rounded-r-md relative">
            <div className="w-full p-4 bg-neutral-800 flex items-center gap-3 border-b border-neutral-700 rounded-tr-md">
                {selectedChat ? (
                    <>
                        <img
                            className="w-10 h-10 rounded-full object-cover border-2 border-neutral-700"
                            src={getPfpUrl(selectedChat?.matchProfile?.picture_path, selectedChat?.matchProfile?.pics)}
                            alt="Profile"
                        />
                        <div>
                            <h3 className="font-semibold">
                                <a href={`http://localhost:4000/member/profile?username=${interlocutor?.username}`}>
                                    {interlocutor?.username}
                                </a>
                            </h3>
                            <span className="text-xs text-neutral-400">Online</span>
                        </div>
                    </>
                ) : (
                    <h3 className="text-lg font-medium">Start a conversation</h3>
                )}
            </div>

            <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-900" id="chat-messages">
                <div className="space-y-4">
                    {chatLog?.map((message, idx) => (
                        <div
                            key={idx}
                            className={`flex ${message.sender_username === user?.username ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`
                                max-w-[75%] px-4 py-2 rounded-2xl
                                ${message.sender_username === user?.username 
                                    ? 'bg-blue-600 rounded-br-sm' 
                                    : 'bg-neutral-700 rounded-bl-sm'}
                            `}>
                                <p className="text-sm mb-1">{message.text}</p>
                                <div className="text-[10px] text-neutral-300 text-right">
                                    {new Date(message.timestamp).toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="bg-neutral-800 border-t border-neutral-700">
                <form onSubmit={handleSendMessage} className="h-[80px] bg-neutral-800 flex items-center p-4">
                    <input
                        type="text"
                        name="message"
                        className="flex-1 bg-neutral-700 text-neutral-100 rounded-full px-4 py-2 
                                focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Type a message..."
                    />
                    <button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 h-10 w-10 
                                flex items-center justify-center transition-colors"
                    >
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ConversationBox;
