import React from 'react';
import { Eye, Heart, UserX, MessageSquare, Users } from 'lucide-react';
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { fetchUserInfo } from '@/api';

const NotificationCard = ({ notification, currentUser }) => {
    const { data: userInfo } = useQuery(['author', notification.author.id], () => fetchUserInfo(notification.author.username));

    const author = userInfo?.displayUser?.username;
    const pfp = userInfo?.displayUser?.pics?.[0];

    return (
        <Card className="mb-4">
        <CardContent className="flex items-center p-4">
            <Avatar className="h-10 w-10 mr-4">
                <img src={pfp} alt={author.username} />
            </Avatar>
            <div className="flex-grow">
            <p className="text-sm font-medium">{getMessage(notification.type)}</p>
            {notification.content && (
                <p className="text-sm text-gray-500 mt-1">{notification.content}</p>
            )}
            </div>
            {getIcon(notification.type)}
        </CardContent>
        </Card>
    );
};

export default NotificationCard;