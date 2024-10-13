import { useEffect } from 'react';
import { useWebSocket } from '@/components/providers/WebSocketProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotificationHistory } from '@/api';
import { useUser } from '@/components/providers/UserProvider';

const APIURL = "http://localhost:3000";

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { socket } = useWebSocket();
  const { user } = useUser();
  const username = user?.username;

  const { data: notifications, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', username],
    queryFn: () => getNotificationHistory(username),
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW') {
        queryClient.setQueryData(['notifications', username], (oldData) => {
          return [...(oldData || []), data.notification];
        });
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, queryClient, username]);

  useEffect(() => {
    console.log('notifications', notifications);
  }, [notifications]);

  const markAsReadMutation = useMutation({
    mutationFn: async ({ userId, notificationIds }) => {
      const response = await fetch(`${APIURL}/notifications/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          notificationIds,
        }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications', username]);
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