import React, { useState} from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuthStatus } from '@/hooks/useAuthStatus'
import { Table, TableCaption, TableHeader, TableRow, TableHead } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'


const NotificationSidebar = () => {
  const { isAuthenticated, user } = useAuthStatus();
  const { notifications, markAsRead, isLoading, error} = useNotifications();
  
  if (!isAuthenticated || !user) { return null}
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching notifications</div>;
  
  const handleMarkAllAsRead = () => {
    if (!notifications) return
    const unreadIds = notifications.filter(n => !n.read_status).map(n => n.id).join(',');
    if (unreadIds) {
      markAsRead({ userId: user.id, notificationIds: unreadIds });
    }
  };

  const getIcon = (type) => {
    switch (type) {
        case 'VIEW': return <Eye className="h-5 w-5 text-blue-500" />;
        case 'LIKE': return <Heart className="h-5 w-5 text-red-500" />;
        case 'BLOCK': return <UserX className="h-5 w-5 text-gray-500" />;
        case 'MESSAGE': return <MessageSquare className="h-5 w-5 text-green-500" />;
        case 'MATCH': return <Users className="h-5 w-5 text-purple-500" />;
        default: return null;
    }
  };
  
  const getMessage = (type) => {
    switch (type) {
        case 'VIEW': return `${author.username} viewed your profile`;
        case 'LIKE': return `${author.username} liked you`;
        case 'BLOCK': return `${author.username} blocked you`;
        case 'MESSAGE': return `${author.username} sent you a message`; 
        case 'MATCH': return `You matched with ${author.username}`;
        default: return 'Unknown notification type';
    }
  };
  
  return (
    <Popover>
      <PopoverContent>
        <span onClick={handleMarkAllAsRead}>Mark All as Read</span>
        <Table>
          <TableCaption>Notifications</TableCaption>
          <TableHeader>
            {notifications && notifications.map((notification) => (
              <TableRow key={notification.id}>
                <NotificationCard notification={notification} currentUser={user} />
              </TableRow>))}
          </TableHeader>
        </Table>
      </PopoverContent>
      <PopoverTrigger>
        Open notifications
      </PopoverTrigger>
    </Popover>
)}

export default NotificationSidebar;