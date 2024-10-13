import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserInfo } from '@/api';

const icons = {
  VIEW: '👀',
  LIKE: '❤️',
  BLOCK: '🚫',
  MESSAGE: '💬',
  MATCH: '🤝',
};

const messages = {
  VIEW: (username) => `${username} viewed your profile`,
  LIKE: (username) => `${username} liked you`,
  BLOCK: (username) => `${username} blocked you`,
  MESSAGE: (username) => `${username} sent you a message`,
  MATCH: (username) => `You matched with ${username}`,
};

const NotificationCard = ({ notification }) => {
    const { data: userInfo } = useQuery(['author', notification.author], () => getUserInfo(notification.author));
  
    if (!userInfo) {
      return null;
    }
  
    const pfp = userInfo?.displayUser?.pics?.[0];
    const username = userInfo.username;
  
    return (
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          {icons[notification.type] || '🔔'}
        </div>
        <div style={styles.content}>
          <img src={pfp} alt={username} style={styles.avatar} />
          <div style={styles.textContent}>
            <p style={styles.message}>{getMessage(notification.type, username)}</p>
            {notification.message && (
              <p style={styles.additionalContent}>{notification.message}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

const styles = {
  card: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    marginBottom: '12px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
  },
  iconContainer: {
    fontSize: '24px',
    marginRight: '12px',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    marginRight: '12px',
    objectFit: 'cover',
  },
  textContent: {
    flex: 1,
  },
  message: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 500,
  },
  additionalContent: {
    margin: '4px 0 0',
    fontSize: '12px',
    color: '#666',
  },
};

export default NotificationCard;