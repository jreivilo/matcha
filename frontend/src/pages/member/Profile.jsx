import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  const queryClient = useQueryClient();
  
  const params = new URLSearchParams(location.search);
  const profileUsername = params.get('username');

  console.log("user id in client state ", user?.id);

  useEffect(() => {
    setIsSelf(profileUsername === user?.username);
  }, [profileUsername, user]);

  const { data, isLoading, error } = useQuery({
    queryKey: profileUsername ? ['profile', profileUsername] : null,
    queryFn: () => getUserInfo(profileUsername, user?.id),
    enabled: !!profileUsername,
  });
  
  const { displayUser, isLiked, isBlocked } = data ?? {};

  const likeMutation = useMutation({
    mutationFn: toggleLike(profileUsername, user?.username, isLiked),
    onMutate: async (variables) => { 
      await queryClient.invalidateQueries(['profile', profileUsername]);
      const previousData = queryClient.getQueryData(['profile', profileUsername]);
      queryClient.setQueryData(['profile', profileUsername], old => ({
        ...old,
        isLiked: !old.isLiked,
      }));
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['profile', profileUsername], previousData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profile', profileUsername]);
    },
  })

  const blockMutation = useMutation({
    mutationFn: toggleBlock(profileUsername, user?.username, isBlocked),
    onMutate: async (variables) => { 
      await queryClient.invalidateQueries(['profile', profileUsername]);
      const previousData = queryClient.getQueryData(['profile', profileUsername]);
      queryClient.setQueryData(['profile', profileUsername], old => ({
        ...old,
        isBlocked: !old.isBlocked,
      }));
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['profile', profileUsername], previousData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profile', profileUsername]);
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  console.log(`displayUser: ${JSON.stringify(displayUser)}`);
  // console.log(`isLiked: ${JSON.stringify(isLiked)}`);
  // console.log(`isBlocked: ${JSON.stringify(isBlocked)}`);

  const handleLike = () => {
    console.log('handleLike called');
    if (user && profileUsername) {
      console.log('Attempting to like/unlike', { user: user.username, profileUsername, isLiked });
      likeMutation.mutate({ username: user.username, liked_username: profileUsername });
    } else {
      console.log('Like failed: missing user or profileUsername', { user, profileUsername });
    }
  };
  
  const handleBlock = () => {
    console.log('handleBlock called');
    if (user && profileUsername) {
      // console.log('Attempting to block/unblock', { src: user.username, profileUsername, isBlocked });
      blockMutation.mutate({ username: user.username, blocked_username: profileUsername });
    } else {
      console.log('Block failed: missing user or profileUsername', { user, profileUsername });
    }
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
              <AvatarImage src={displayUser?.profilePicture} alt={profileUsername} />
              <AvatarFallback>{profileUsername?.charAt(0).toUpperCase() ?? 'U'}</AvatarFallback>
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

// for like button, should add as prop:  disabled={displayUser?.profilePicture}

export default ProfilePage;