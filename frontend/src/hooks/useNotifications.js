import { useEffect } from 'react';
import { useWebSocket } from '@/components/providers/WebSocketProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const APIURL = "http://localhost:3000";

export const useNotifications = () => {
  const queryClient = useQueryClient()
  const { socket } = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NOTIFICATIONS') {
        queryClient.setQueryData('notifications', data.notifications);
      } else if (data.type === 'NEW_NOTIFICATION') {
        queryClient.setQueryData('notifications', [data.notification, ...queryClient.getQueryData('notifications')]);
      } else if (data.type === 'PONG') {
        console.log('Received PONG:', data.message);
      } else {
        console.log('Unknown message type:', JSON.stringify(data));
      }
    }

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, queryClient]);

  const markAsReadMutation = useMutation({
    mutationFn: async ({ userId, notificationIds }) => {
      const response = await fetch(APIURL + '/notifications/read', {
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
    onSuccess: (data) => {
      queryClient.invalidateQueries('notifications');
    },
  })

  return {
    notifications: queryClient.getQueryData('notifications'),
    markAsRead: markAsReadMutation.mutate,
    isLoading: markAsReadMutation.isLoading,
    error: markAsReadMutation.error,
  }
}