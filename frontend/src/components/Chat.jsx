import React from 'react'
import { getChatHistory, getMatches } from '@/api'
import { useAuthStatus } from '@/hooks/useAuthStatus'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, Typography } from '@/components/ui/card'
import CustomLayout from './MatchaLayout'

const ChatConversation = ({ user, match }) => {

}

const ChatButton = ({ user, match }) => {
    const username = user?.username

    const { data: chatHistory, isLoading: chatLoading, error } = useQuery({
        queryKey: ['chatHistory', match],
        queryFn: () => getChatHistory({user1: user, user2: match}),
        enabled: !!username && !!match
    })

    if (chatLoading) return <p>Loading...</p>
    if (error) return <p>error: {error}</p>

    return (
        <div>
            {chatHistory ? (
                chatHistory.map(message => {
                    <span key={message.id}>
                        {text}</span>
                })
            ) :
            (<p>Start chatting with {match}</p>)
            }
        </div>
    )
}

const ChatPanel = () => {
    // const queryClient = useQueryClient()
    const { user } = useAuthStatus()
    const { data: matches, isLoading: matchLoading, error } = useQuery({
        queryKey: ['matches'],
        queryFn: () => getMatches(user?.username),
        enabled: !!user
    })

    if (matchLoading) return <p>Loading...</p>
    if (error) return <p>error loading matches: {error}</p>

    return (
        <CustomLayout>
            <Card>
                {matches && matches.map(match =>
                    <ChatButton key={match} user={user?.username} match={match} />
                )}
            </Card>
        </CustomLayout>
    )
}

export default ChatPanel