import React, { useState, useEffect } from 'react'
import { getChatHistory, getMatches, getUserInfo } from '@/api'
import { useAuthStatus } from '@/hooks/useAuthStatus'
import { useConversation } from '@/hooks/useConversation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import CustomLayout from '../../components/MatchaLayout'
import { Button } from '@/components/ui/button'

const SilentMatches = ({ silentMatches, handleNewChat }) => (
	<div>
		<h2 className='text-lg font-title'>Start talking with: </h2>
		<div className="flex flex-row flex-wrap gap-4 mb-4 mt-4 justify-center">
			{silentMatches?.length > 0 && silentMatches.map(silentMatch => (
				<div onClick={() => handleNewChat(silentMatch)} key={silentMatch.matchProfile.username} className="flex items-center gap-3 hover:text-lg">
					<img
						className="w-[40px] h-[40px] rounded-[4px] object-cover"
						src="https://tools-api.webcrumbs.org/image-placeholder/40/40/avatars/1"
						alt={silentMatch.matchProfile.username}
					/>
					<span>{silentMatch.matchProfile.username}</span>
				</div>
			))}
		</div>
	</div>
)

const TalkingMatches = ({ talkingMatches, selectedChat, setSelectedChat }) => (
	<div className="w-[250px] bg-neutral-800 p-6 rounded-l-md flex flex-col gap-4 border-r border-neutral-700">
		<h2 className="text-lg font-title">Conversations</h2>
		<div className="flex flex-col gap-4">
			{talkingMatches.length > 0 && talkingMatches.map(talkingMatch => (
				<div key={talkingMatch.matchProfile.username} className="flex items-center gap-3" onClick={() => setSelectedChat(talkingMatch)}>
					{selectedChat && selectedChat.matchProfile.username === talkingMatch.matchProfile.username && (
						<div className="bg-primary-600 p-3 rounded-[4px] max-w-xs text-sm">YEAH</div>
					)}
					<img
						className="w-[40px] h-[40px] rounded-[4px] object-cover"
						src="https://tools-api.webcrumbs.org/image-placeholder/40/40/avatars/1"
						alt={talkingMatch.matchProfile.username}
					/>
					<span>{talkingMatch.matchProfile.username}</span>
				</div>
			))}
		</div>
	</div>
)

const ConversationBox = ({ user, selectedChat }) => {
    const { sendMessage } = useConversation(selectedChat?.matchProfile?.username);
    const match_username = selectedChat?.matchProfile?.username;

    const handleSendMessage = (event) => {
        event.preventDefault();
        const message = event.target.elements.message.value;
        sendMessage({
            sender: user?.username,
            receiver: match_username, 
            message
        });
        event.target.reset();
    };

    if (!selectedChat) return <div>Start a conversation</div>;

    return (
        <div className="flex-1 bg-neutral-900 flex flex-col rounded-r-md">
            <div className="w-full p-4 bg-neutral-800 flex items-center gap-3 border-b border-neutral-700 rounded-t-md">
                <img
                    className="w-[40px] h-[40px] rounded-[4px] object-cover"
                    src="https://tools-api.webcrumbs.org/image-placeholder/40/40/avatars/4"
                    alt="Current User"
                />
                <div>
                    <h3 className="text-lg">{match_username}</h3>
                    <p className="text-sm text-neutral-400">Online</p>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {selectedChat.chatLog && selectedChat.chatLog.length > 0 && selectedChat.chatLog.map((message, idx) => (
                    <div
                        key={idx}
                        className={`flex ${message.sender_username === user?.username ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[75%] p-3 rounded-lg text-white ${message.sender_username === user?.username ? 'bg-blue-600' : 'bg-gray-700'} relative`}>
                            <p className="text-sm">{message.text}</p>
                            <span className="text-xs text-neutral-400 absolute bottom-1 right-2">
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSendMessage} className="w-full p-4 bg-neutral-800 flex items-center gap-3 border-t border-neutral-700 rounded-b-md">
                <input
                    type="text"
                    name="message" // Use name to target the input in handleSendMessage
                    className="flex-1 bg-neutral-600 text-neutral-50 rounded-[4px] p-2 focus:outline-none"
                    placeholder="Type a message..."
                />
                <button type="submit" className="bg-green-600 text-white rounded-md p-2 h-[40px] w-[40px] flex items-center justify-center">
                    <span className="material-symbols-outlined">send</span>
                </button>
            </form>
        </div>
    );
};



const ChatPanel = () => {
    const queryClient = useQueryClient()
    const { user, isLoading: authLoading } = useAuthStatus()

    const { data: matches, isLoading: matchLoading, error: matchError } = useQuery({
        queryKey: ['matches'],
        queryFn: () => getMatches(user?.username),
        enabled: !!user,
    })

    const [talkingMatches, setTalkingMatches] = useState([])
    const [silentMatches, setSilentMatches] = useState([])
	const [selectedChat, setSelectedChat] = useState(null)

    useEffect(() => {
        if (!matches) return

        const fetchProfilesAndChats = async () => {
            const talking = []
            const silent = []

            await Promise.all(
                matches.map(async (match) => {
                    let matchProfile = queryClient.getQueryData(['userData', match])
                    if (matchProfile === undefined) {
						await queryClient.prefetchQuery({
							queryKey: ['userData', match],
							queryFn: () => getUserInfo(match, user?.username),
							enabled: !!match && !!user?.username
						})
                        matchProfile = queryClient.getQueryData(['userData', match])
                    }

                    let chatLog = queryClient.getQueryData(['chatHistory', match])
                    if (!chatLog) {
                        await queryClient.prefetchQuery({
							queryKey: ['chatHistory', match],
							queryFn: () => getChatHistory({ sender: user?.username, receiver: match }),
							enabled: !!match && !!user?.username
						})
                        chatLog = queryClient.getQueryData(['chatHistory', match]) || []
                    }

                    if (chatLog.length > 0) {
						talking.push({ matchProfile: matchProfile.displayUser, chatLog })
                    } else {
						silent.push({ matchProfile: matchProfile.displayUser })
                    }
                })
            )
            setTalkingMatches(talking)
            setSilentMatches(silent)
        }

        fetchProfilesAndChats()
    }, [matches, user?.username, queryClient])

    if (matchLoading || authLoading) return <p>Loading...</p>
    if (matchError) return <p>Error loading matches: {matchError.message}</p>

	const handleNewChat = ({matchProfile}) => {
		setSelectedChat({ matchProfile, chatLog: [] })
		setSilentMatches(silentMatches.filter(match => match.matchProfile.username !== matchProfile.username))
		// chatlog
		const { data: chatLog, isLoading, error, refetch } = useQuery({
			queryKey: ['chatHistory', matchProfile.username],
			queryFn: () => getChatHistory({ sender: user?.username, receiver: matchProfile.username }),
			enabled: !!matchProfile && !!user?.username
		})
		setTalkingMatches([...talkingMatches, { matchProfile, chatLog }])
	}

    return (
        <CustomLayout>
			<SilentMatches silentMatches={silentMatches} handleNewChat={handleNewChat} />
            <div id="webcrumbs">
                <div className="w-[900px] min-h-[600px] bg-black text-white shadow-lg rounded-md flex">
                    <TalkingMatches talkingMatches={talkingMatches} selectedChat={selectedChat} setSelectedChat={setSelectedChat}/>
					<ConversationBox selectedChat={selectedChat} user={user}/>
                </div>
            </div>
        </CustomLayout>
    )
}

export default ChatPanel
