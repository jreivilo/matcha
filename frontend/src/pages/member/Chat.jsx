import React, { useState, useEffect } from 'react'
import { getChatHistory, getMatches, getUserInfo, sendMessage } from '@/api'
import { useAuthStatus } from '@/hooks/useAuthStatus'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import CustomLayout from '../../components/MatchaLayout'
import { getPfpUrl } from '@/lib/utils'
import ConversationBox from '@/components/chat/Conversation'

const SilentMatches = ({ silentMatches, handleNewChat }) => (
	<div>
		<h2 className='text-lg font-title'>Start talking with: </h2>
		<div className="flex flex-row flex-wrap gap-4 mb-4 mt-4 justify-center">
			{silentMatches?.length > 0 && silentMatches.map(silentMatch => {
                return (
                    <div onClick={() => handleNewChat(silentMatch)} key={silentMatch.matchProfile.username} className="flex items-center gap-3 hover:text-lg">
                        <img
                            className="w-[40px] h-[40px] rounded-[4px] object-cover"
                            src={getPfpUrl(silentMatch.matchProfile.picture_path, silentMatch.matchProfile.pics)}
                            alt={silentMatch.matchProfile.username}
                        />
                        <span>{silentMatch.matchProfile.username}</span>
                    </div>
                )
            })}
		</div>
	</div>
)

const TalkingMatches = ({ talkingMatches, selectedChat, setSelectedChat }) => {
    const isSelected = (talkingMatch) => {
        return selectedChat && selectedChat.matchProfile.username === talkingMatch.matchProfile.username
    }

    return (
	<div className="w-[250px] bg-neutral-800 p-6 rounded-l-md flex flex-col gap-4 border-r border-neutral-700">
		<h2 className="text-lg font-title">Conversations</h2>
		<div className="flex flex-col gap-4">
			{talkingMatches.length > 0 && talkingMatches.map(talkingMatch => (
				<div key={talkingMatch.matchProfile.username} className="flex items-center gap-3 p-2 rounded-md" onClick={() => setSelectedChat(talkingMatch)}>
                    <div className={`${isSelected(talkingMatch) ? 'bg-secondary' : 'bg-neutral-800'}`}>
                        <img
                            className="w-[40px] h-[40px] rounded-[4px] object-cover"
                            src={getPfpUrl(talkingMatch.matchProfile.picture_path, talkingMatch.matchProfile.pics)}
                        />
                        <span>{talkingMatch.matchProfile.username}</span>
                    </div>
				</div>
			))}
		</div>
	</div>
)}

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
    const [noMatches, setNoMatches] = useState(false)

    useEffect(() => {
        if (matches === 'none') {
            setNoMatches(true);
            return;
        }
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

	const handleNewChat = ({matchProfile}) => {
		setSelectedChat({ matchProfile, chatLog: [] })
		setSilentMatches(silentMatches.filter(match => match.matchProfile.username !== matchProfile.username))
		setTalkingMatches([...talkingMatches, { matchProfile, chatLog: [] }])
	}
    return (
        <CustomLayout>
            <div className="mb-10">
            {noMatches ? (<p>Get matching before you can start chatting!</p>) : (
                <>
                    <SilentMatches silentMatches={silentMatches} handleNewChat={handleNewChat} />
                    <div className="w-full h-full min-h-[900px] bg-black text-white shadow-lg rounded-md flex">
                        <TalkingMatches 
                            talkingMatches={talkingMatches} 
                            selectedChat={selectedChat} 
                            setSelectedChat={setSelectedChat} 
                            className="w-1/3 min-h-full overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700" 
                        />
                        <ConversationBox 
                            selectedChat={selectedChat} 
                            user={user} 
                            className="w-2/3 flex flex-col" 
                        />
                    </div>
                </>
            )}
            </div>
        </CustomLayout>
    )
}

export default ChatPanel