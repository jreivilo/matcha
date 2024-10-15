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
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW') {
        queryClient.setQueryData(['notifications', username], (oldData) => {
          return [...(oldData || []), {
            id: data.id,
            author: data.author,
            message: data.message,
            read_status: data.read_status,
          }];
        });
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, queryClient, username]);

  const markAsReadMutation = useMutation({
    mutationFn: async ({ username, notificationIds }) => {
      const response = await fetch(`${APIURL}/notification/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username,
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