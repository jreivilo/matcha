import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@/components/UserProvider';
// components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, UserX, AlertTriangle, Star } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CustomLayout from '@/components/MatchaLayout';

const ProfilePage = () => {
  const { user } = useUser();
  const [displayUser, setDisplayUser] = useState();
  const [isSelf, setIsSelf] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [error, setError] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const usernameParam = params.get('username');

    setIsSelf(usernameParam === user?.username);
    
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:3000/user/getinfo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: usernameParam }),
          credentials: 'include',
        });
        const responseData = await response.json();
        if (responseData.user) {
            responseData.user.username = usernameParam;
          setDisplayUser({
            ...responseData.user,
          }
          );
          setIsLiked(responseData.isLiked);
          setIsBlocked(responseData.isBlocked);
        } else {
          setError(responseData.message || 'Failed to fetch user profile');
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        setError('An error occurred while fetching the profile');
      }
    };

    fetchUser();
  }, [location, navigate]);

  const handleLike = async () => {
    // Implement like functionality
    setIsLiked(!isLiked);
  };

  const handleBlock = async () => {
    // Implement block functionality
    setIsBlocked(!isBlocked);
  };

  const handleReport = async () => {
    // Implement report functionality
    alert('User reported as fake account');
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!displayUser) {
    return <div>Loading...</div>;
  }

  return (
    <CustomLayout>
      <Card className="w-[350px] mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">{isSelf ? 'Your Profile' : `${displayUser.username}'s Profile`}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Avatar className="w-32 h-32">
              <AvatarImage src={displayUser.profilePicture} alt={displayUser.username} />
              <AvatarFallback>{displayUser.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          
          <div className="space-y-2">
            <p><strong>Name:</strong> {displayUser.first_name} {displayUser.last_name}</p>
            <p><strong>Gender:</strong> {displayUser.gender}</p>
            <p><strong>Sexuality:</strong> {displayUser.sexuality}</p>
            <p><strong>Biography:</strong> {displayUser.biography}</p>
            <div><strong>Interests:</strong> {displayUser.interests.split(',').map(interest => (
              <Badge key={interest} variant="secondary" className="mr-1">
                {interest.trim()}
              </Badge>
            ))}</div>
            <p><strong>Fame Rating:</strong> <Star className="inline" /> {displayUser.fameRating}</p>
            <p><strong>Last Online:</strong> {displayUser.lastOnline}</p>
          </div>

          {!isSelf && (
            <div className="flex justify-between mt-4">
              <Button 
                onClick={handleLike}
                variant={isLiked ? "default" : "outline"}
                disabled={!displayUser.profilePicture}
              >
                <ThumbsUp className="mr-2 h-4 w-4" /> {isLiked ? 'Unlike' : 'Like'}
              </Button>
              <Button 
                onClick={handleBlock}
                variant={isBlocked ? "destructive" : "outline"}
              >
                <UserX className="mr-2 h-4 w-4" /> {isBlocked ? 'Unblock' : 'Block'}
              </Button>
              <Button onClick={handleReport} variant="outline">
                <AlertTriangle className="mr-2 h-4 w-4" /> Report
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </CustomLayout>
  );
};

export default ProfilePage;