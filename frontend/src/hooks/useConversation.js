import { useEffect } from 'react';
import { useWebSocket } from '@/components/providers/WebSocketProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getChatHistory, sendMessage } from '@/api';
import { useAuthStatus } from './useAuthStatus';

const APIURL = "http://localhost:3000";

export const useConversation = (interlocutor) => {
  const queryClient = useQueryClient();
  const { socket } = useWebSocket();
  const { isAuthenticated, user } = useAuthStatus();
  const username = user?.username;

//   useEffect(() => {
//     if (!socket || !isAuthenticated || !username) return;

//     const handleMessage = (event) => {
//       const data = JSON.parse(event.data);
//       if (data.type === 'NEW' && data.message.startsWith('MSG:')) {
//         const sender = data.message.split(':')[1];
//         const actualMessage = data.message.split(':')[2];
//         queryClient.setQueryData(['conversation', username], (oldData) => {
//           return [...(oldData || []), message];
//         });
//       }
//     };

//     socket.addEventListener('message', handleMessage);

//     return () => {
//       socket.removeEventListener('message', handleMessage);
//     };
//   }, [socket, queryClient, username, isAuthenticated]);

  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries(['chatHistory', interlocutor]);
    },
    onError: (event) => {
      console.error('Error sending message:', event);
    },
  });

  return {
    // conversation: conversation || [],
    sendMessage: sendMessageMutation.mutate,
    // isLoading: isLoading || sendMessageMutation.isLoading,
    // error: error || sendMessageMutation.error,
    // refetch,
  };
};