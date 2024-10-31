import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotificationHistory, fetcher } from '@/api';
import { useAuthStatus } from './useAuthStatus';
import useWebSocket, { ReadyState } from 'react-use-websocket';
const APIURL = "http://localhost:3000";
const WS_URL = 'ws://localhost:3000/notification/ws';

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStatus();
  const username = user?.username;

  const { lastMessage, readyState, sendJsonMessage } = useWebSocket(WS_URL, {
    onOpen: () => console.log('WebSocket connected'),
    onClose: () => console.log('WebSocket disconnected'),
    onMessage: async (message) => {
      console.log("oneMessage: ",message)
      if (!message) return;
      
      const data = JSON.parse(message.data)
      if (data.type === 'NEW') {
        if (data.message === 'MSG') {
          queryClient.invalidateQueries(['chatHistory', data.author]);
        }
        queryClient.invalidateQueries(['notifications', username]);
      }
    },
    share: true,
    filter: () => true,
    retryOnError: true,
    shouldReconnect: () => true,
    reconnectInterval: 3000,
    credentials: true,
  });


  const { data: notifications, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', username],
    queryFn: () => getNotificationHistory(username),
    enabled: !!username,
    refetchOnWindowFocus: false,
    retry: 4,
    delay: 1000,
  });

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
    readyState,
    notifications: notifications || [],
    markAsRead: markAsReadMutation.mutate,
    isLoading: isLoading || markAsReadMutation.isLoading,
    error: error || markAsReadMutation.error,
    refetch,
  };
};