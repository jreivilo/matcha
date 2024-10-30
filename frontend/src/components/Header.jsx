import React from 'react';
import { Button } from './ui/button';
import NotificationFeed from '@/components/notif/NotificationFeed';
import { Link } from 'react-router-dom';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useNotifications } from '@/hooks/useNotifications';
// import { useAuthStatus } from '@/components/providers/AuthProvider';
// import { useNotifications } from '@/components/providers/NotificationsProvider';

import { logout } from '@/lib/logout';
import { useQueryClient } from '@tanstack/react-query';

const Header = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStatus();
  const { username } = user || {};
  const { notifications, markAsRead, isLoading, error, refetch } = useNotifications();

  let unreadCount = notifications?.filter(n => !n.read_status).length || 0;

  const handleLogout = async () => {
    logout(user, queryClient);
    logout(user, queryClient);
  };

  const handleMarkAllAsRead = () => {
    if (!notifications) return;
    const unreadIds = notifications.filter(n => !n.read_status).map(n => n.id);
    if (unreadIds.length) {
      markAsRead({ username, notificationIds: unreadIds.join(',') });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <header className="p-5 bg-gradient-to-br from-background-start to-background-end">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-4xl font-bold text-text-light">
          <Link className="text-secondary hover:underline" to="/">Matcha</Link>
        </h1>
        <nav className="flex items-center space-x-4">
          <Button variant="outline" className="text-text-light" >
            <Link to="/member/dashboard">Dashboard</Link>
          </Button>
          <NotificationFeed unreadCount={unreadCount} notifications={notifications} handleMarkAllAsRead={handleMarkAllAsRead} />
          {!username ? (
            <Button variant="default" className="text-text-light">
              <Link to="/auth/login">Login/Register</Link>
            </Button>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to={`/member/profile?username=${username}`} className="text-text-light">
                {username}
              </Link>
              <Button variant="outline" className="text-text-light" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;