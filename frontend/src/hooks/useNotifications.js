import { useEffect } from 'react';
import { useWebSocket } from '@/components/providers/WebSocketProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotificationHistory } from '@/api';

const APIURL = "http://localhost:3000";

export const useNotifications = () => {
  const queryClient = useQueryClient()
  const { socket } = useWebSocket();

  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotificationHistory,
    initialData: [],
    staleTime: Infinity
  })

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW') {
        queryClient.setQueryData('notifications', [
          ...queryClient.getQueryData('notifications'),
          data.notification])
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