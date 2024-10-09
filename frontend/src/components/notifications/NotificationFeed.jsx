import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/components/providers/UserProvider'

const APIURL = "ws://localhost:3000";

const NotificationCard = ({ notification, user }) => {
  const { displayUser } = user;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {notification.username === user.username ? (
            <img src={user.picture_path} alt={user.username} className="w-12 h-12 rounded-full" />
          ) : (
            <img src={displayUser.picture_path} alt={displayUser.username} className="w-12 h-12 rounded-full" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-text-light">{notification.username}</p>
            {isSelf && <p className="text-sm text-text-light">You</p>}
          </div>
          <p className="text-sm text-text-light">{notification.message}</p>
        </div>
      </div>
    </div>
  );
};

export const NotificationFeed = () => {
  const [notifications, setNotifications] = useState([]);
  const [ws, setWs] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const socket = new WebSocket(`${APIURL}/notification/ws`);

    socket.onopen = () => {
      console.log('Connected to the WebSocket');
      setWs(socket);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NOTIFICATIONS') {
        setNotifications(data.notifications);
      } else if (data.type === 'NEW_NOTIFICATION') {
        setNotifications((prevNot) => [data.notification, ...prevNot]);
      } else if (data.type === 'PONG') {
        console.log('Received PONG:', data.message);
      } else {
        console.log('Unknown message type:', JSON.stringify(data));
      }
    };

    socket.onerror = (event) => {
      console.error(event);
    };

    socket.onclose = () => {
      console.log('Disconnected from the WebSocket');
    };
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  useEffect(() => {
    setIsLoading(false);
  }, [notifications]);

  const markAsRead = async () => {
    const notificationIds = notifications.map((n) => n.id).join(',');
    await fetch('/notifications/read', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        notificationIds,
      }),
    });
    setNotifications((prevNot) => prevNot.map((notification) => ({
      ...notification,
      read_status: 'READ'
    })));
  };

  if (isLoading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div>
      <h2>Notifications</h2>
      <Button onClick={markAsRead}>Mark All as Read</Button>
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          currentUser={user}
        />
      ))}
    </div>
  );
};