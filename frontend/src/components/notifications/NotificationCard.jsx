import React from 'react';
import { Eye, Heart, UserX, MessageSquare, Users } from 'lucide-react';
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { fetchUserInfo } from '@/api';

const NotificationCard = ({ notification, currentUser }) => {
    const { data: userInfo } = useQuery(['author', notification.author.id], () => fetchUserInfo(notification.author.username));

    const author = userInfo?.displayUser?.username;
    const pfp = userInfo?.displayUser?.pics?.[0]?.url;

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
        <Card className="mb-4">
        <CardContent className="flex items-center p-4">
            <Avatar className="h-10 w-10 mr-4">
            <img src={user.avatar} alt={user.username} />
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