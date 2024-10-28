import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUserData } from '@/hooks/useUserData';

const icons = {
  VIEW: '👀',
  LIKE: '❤️',
  BLOCK: '🚫',
  MESSAGE: '💬',
  MATCH: '🤝',
  MSG: '📨',
};

const getPfp = (userInfo) => {
  const pfpname = userInfo?.displayUser?.picture_path;
  if (pfpname) {
    const res = userInfo?.displayUser?.pics?.find(pic => pic.imageName === pfpname);
    const prefix = "data:image/jpeg;base64,";
    return (prefix + res?.image);
  }
  return null;
}

const getMessage = (type, username) => {
  switch (type) {
    case 'VIEW': return `${username} viewed your profile`;
    case 'LIKE': return `${username} liked you`;
    case 'BLOCK': return `${username} blocked you`;
    case 'MSG': return `${username} sent you a message`;
    case 'MATCH': return `You matched with ${username}`;
    default: return 'Unknown notification type';
  }
};

const NotificationCard = ({ notification }) => {
  if (!notification.author) return null;
  const { data: userInfo } = useUserData(notification.author);

  if (!userInfo) {
    return null;
  }

  const pfp = getPfp(userInfo);;
  const username = notification.author;

  return (
    <Card className="mb-2">
      <CardContent className="flex items-center p-4">
        <div className="mr-4 text-2xl">{icons[notification.type] || '🔔'}</div>
        <Avatar className="mr-4">
          <AvatarImage src={pfp} alt={username} />
          <AvatarFallback>{username}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{getMessage(notification.message, username)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default NotificationCard;