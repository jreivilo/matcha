import React from 'react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationCard from '@/components/NotificationCard';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { logout } from '@/lib/logout';
import { useUser } from '@/components/providers/UserProvider';

const Header = () => {
  const { isAuthenticated, _ } = useAuthStatus();
  const { user } = useUser();
  const { username, id } = user || {};
  const { notifications, markAsRead, isLoading, error, refetch } = useNotifications();

  let unreadCount = notifications?.filter(n => !n.read_status).length || 0;

  const handleLogout = async () => {
    logout(user);
  };

  const handleMarkAllAsRead = () => {
    if (!notifications) return;
    const unreadIds = notifications.filter(n => !n.read_status).map(n => n.id);
    if (unreadIds.length) {
      markAsRead({ username, notificationIds: unreadIds.join(',') });
    }
  };

  return (
    <header className="p-5 bg-gradient-to-br from-background-start to-background-end">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-4xl font-bold text-text-light">
          <Link className="text-secondary hover:underline" to="/">Matcha</Link>
        </h1>
        <nav className="flex items-center space-x-4">
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="relative">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 bg-gray-800 text-white">
                <div className="flex justify-between items-center mb-2 p-2">
                  <h3 className="font-semibold">Notifications</h3>
                  <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                    Mark All as Read
                  </Button>
                </div>
                <ScrollArea className="h-[300px]">
                  {notifications && notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <NotificationCard key={notification.id} notification={notification} />
                    ))
                  ) : (
                    <p className="text-center text-gray-400">No notifications</p>
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {!username ? (
            <Button variant="default" className="text-text-light">
              <Link to="/login">Login/Register</Link>
            </Button>
          ) : (
            <div className="flex items-center space-x-4">
              <span className="text-text-light">{username}</span>
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
