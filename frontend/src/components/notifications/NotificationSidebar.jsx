import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import NotificationCard from './NotificationCard';

const NotificationSidebar = () => {
  const { isAuthenticated, user } = useAuthStatus();
  const { notifications, markAsRead, isLoading, error } = useNotifications();

  if (!isAuthenticated || !user) {
    return null;
  }

  if (isLoading) return <div style={styles.loading}>Loading...</div>;
  if (error) return <div style={styles.error}>Error fetching notifications</div>;

  const unreadCount = notifications?.filter(n => !n.read_status).length || 0;

  const handleMarkAllAsRead = () => {
    if (!notifications) return;
    const unreadIds = notifications.filter(n => !n.read_status).map(n => n.id);
    if (unreadIds.length) {
      markAsRead({ userId: user.id, notificationIds: unreadIds.join(',') });
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.notificationButton} onClick={() => setIsOpen(!isOpen)}>
        Notifications {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
      </button>
      {isOpen && (
        <div style={styles.popover}>
          <div style={styles.popoverHeader}>
            <h3 style={styles.popoverTitle}>Notifications</h3>
            <button style={styles.markAllRead} onClick={handleMarkAllAsRead}>Mark All as Read</button>
          </div>
          <div style={styles.notificationList}>
            {notifications && notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            ) : (
              <p style={styles.noNotifications}>No notifications</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    display: 'inline-block',
  },
  notificationButton: {
    padding: '10px 15px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '5px',
  },
  badge: {
    backgroundColor: 'red',
    color: 'white',
    borderRadius: '50%',
    padding: '2px 6px',
    fontSize: '12px',
    marginLeft: '5px',
  },
  popover: {
    display: 'none',
    position: 'absolute',
    right: 0,
    backgroundColor: 'white',
    minWidth: '300px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    borderRadius: '5px',
    zIndex: 1,
  },
  popoverHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 15px',
    borderBottom: '1px solid #eee',
  },
  popoverTitle: {
    margin: 0,
    fontSize: '18px',
  },
  markAllRead: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    fontSize: '14px',
  },
  notificationList: {
    maxHeight: '400px',
    overflowY: 'auto',
    padding: '10px',
  },
  noNotifications: {
    textAlign: 'center',
    color: '#666',
  },
  loading: {
    padding: '20px',
    textAlign: 'center',
  },
  error: {
    padding: '20px',
    textAlign: 'center',
    color: 'red',
  },
};

export default NotificationSidebar;