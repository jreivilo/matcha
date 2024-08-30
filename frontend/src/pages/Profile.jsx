import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@/components/UserProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, UserX, AlertTriangle, Star } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CustomLayout from '@/components/MatchaLayout';
import { getUserInfo, toggleLike, toggleBlock } from '@/api';

const ProfilePage = () => {
  const { user } = useUser();
  const [isSelf, setIsSelf] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const params = new URLSearchParams(location.search);
  const profileUsername = params.get('username');

  useEffect(() => {
    setIsSelf(profileUsername === user?.username);
  }, [profileUsername, user]);

  const { data, isLoading, error } = useQuery({
    queryKey: profileUsername ? ['profile', profileUsername] : null,
    queryFn: () => getUserInfo(profileUsername),
    enabled: !!profileUsername,
  });

  const likeMutation = useMutation({
    mutationFn: toggleLike,
    onSuccess: () => {
      queryClient.invalidateQueries(['profile', profileUsername]);
    },
  })

  const blockMutation = useMutation({
    mutationFn: toggleBlock,
    onSuccess: () => {
      queryClient.invalidateQueries(['profile', profileUsername]);
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const { displayUser, isLiked, isBlocked } = data ?? {};

  // useEffect(() => {

  //   setIsSelf(usernameParam === user?.username);
    
  //   const fetchUser = async () => {
  //     try {
  //       const response = await fetch(`http://localhost:3000/user/getinfo`, {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({ username: usernameParam }),
  //         credentials: 'include',
  //       });
  //       const responseData = await response.json();
  //       if (responseData.user) {
  //           responseData.user.username = usernameParam;
  //         setDisplayUser({
  //           ...responseData.user,
  //         }
  //         );
  //         setIsLiked(responseData.isLiked);
  //         setIsBlocked(responseData.isBlocked);
  //       } else {
  //         setError(responseData.message || 'Failed to fetch user profile');
  //       }
  //     } catch (error) {
  //       console.error('Profile fetch error:', error);
  //       setError('An error occurred while fetching the profile');
  //     }
  //   };

  //   fetchUser();
  // }, [location, navigate]);

  const handleLike = async () => {
    likeMutation.mutate({ username: profileUsername, liked_username: displayUser.username });
  };
  const handleBlock = async () => {
    blockMutation.mutate({ username: profileUsername, blocked_username: displayUser.username });
  };
  const handleReport = async () => {
    alert('User reported as fake account');
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <CustomLayout>
      <Card className="w-[350px] mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {isSelf ? 'Your Profile' : `${profileUsername}'s Profile`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Avatar className="w-32 h-32">
              <AvatarImage src={displayUser?.profilePicture} alt={displayUser?.username} />
              <AvatarFallback>{displayUser?.username?.charAt(0).toUpperCase() ?? 'U'}</AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-2">
            <p><strong>Name:</strong> {displayUser?.first_name ?? ''} {displayUser?.last_name ?? ''}</p>
            <p><strong>Gender:</strong> {displayUser?.gender ?? ''}</p>
            <p><strong>Sexuality:</strong> {displayUser?.sexuality ?? ''}</p>
            <p><strong>Biography:</strong> {displayUser?.biography ?? ''}</p>
            <div>
              <strong>Interests:</strong> 
              {displayUser?.interests ? 
                displayUser.interests.split(',').map(interest => (
                  <Badge key={interest} variant="secondary" className="mr-1">
                    {interest.trim()}
                  </Badge>
                )) : <span></span>
              }
            </div>
            <p><strong>Fame Rating:</strong> <Star className="inline" /> {displayUser?.fameRating ?? 'N/A'}</p>
            <p><strong>Last Online:</strong> {displayUser?.lastOnline ?? 'Unknown'}</p>
          </div>

          {!isSelf && (
            <div className="flex justify-between mt-4">
              <Button 
                onClick={handleLike}
                variant={isLiked ? "default" : "outline"}
                disabled={displayUser?.profilePicture}
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