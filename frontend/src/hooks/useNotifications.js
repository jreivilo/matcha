import { useEffect } from 'react';
import { useWebSocket } from '@/components/providers/WebSocketProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotificationHistory, fetcher } from '@/api';
import { useAuthStatus } from './useAuthStatus';

const APIURL = "http://localhost:3000";

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { socket } = useWebSocket();
  const { isAuthenticated, user } = useAuthStatus();
  const username = user?.username;

  const { data: notifications, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', username],
    queryFn: () => getNotificationHistory(username),
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    delay: 1200,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (!socket || !isAuthenticated || !username) return;

    const handleMessage = (event) => {
      console.log("Adding WebSocket message listener.");
      const data = JSON.parse(event.data);
      if (data.type === 'NEW') {
        if (data.message === "MESSAGE") {
          console.log("new msg: ", data)
          queryClient.refetchQueries({
            queryKey: ['chatHistory', data.author]})
        }
        queryClient.setQueryData(['notifications', username], (oldData) => {
          return [...(oldData || []), {
            id: data.id,
            author: data.author,
            message: data.message,
            read_status: data.read_status,
          }];
        });
      } else {
        console.log(data)
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, queryClient, username, isAuthenticated]);

  const markAsReadMutation = useMutation({
    mutationFn: async ({ username, notificationIds }) => {
      const response = await fetcher(`${APIURL}/notification/read`, { username, notificationIds }, 'PUT');
      if (response.code) {
        throw new Error('Error marking notifications as read', response.code);
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications', username]);
    },
    onError: (event) => {
      console.error('Error marking notifications as read:', event);
    },
  });

  return {
    notifications: notifications || [],
    markAsRead: markAsReadMutation.mutate,
    isLoading: isLoading || markAsReadMutation.isLoading,
    error: error || markAsReadMutation.error,
    refetch,
  };
};