import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '@/components/UserProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, UserX, AlertTriangle, Star } from "lucide-react";
import CustomLayout from '@/components/MatchaLayout';
import { getUserInfo, toggleLike, toggleBlock } from '@/api';
import PicGallery from '@/components/PicGallery';

const ProfilePage = () => {
  const { user } = useUser();
  const [isSelf, setIsSelf] = useState(false);
  const [hasPics, setHasPics] = useState(false);
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const params = new URLSearchParams(location.search);
  const profileUsername = params.get('username');

  useEffect(() => {
    setIsSelf(profileUsername === user?.username);
  }, [profileUsername, user]);
  
  const { data : userinfo, isLoading, error } = useQuery({
    queryKey: ['profile', profileUsername],
    queryFn: () => getUserInfo(profileUsername, user?.username),
    enabled: !!profileUsername,
  });
  
  const { displayUser, isLiked, isBlocked } = userinfo ?? {};
  
  useEffect(() => {
    if (userinfo?.displayUser?.pics) {
      setHasPics(true);
      // console.log("pfp", pfp);
    } else {
      console.log("no pfps");
    }
  }, [userinfo]);
  
  let pfp;
  if (hasPics) {
    pfp = `data:image/jpeg;base64,${userinfo?.displayUser?.pics[0]?.image}`;
  }
  
  const likeMutation = useMutation({
    mutationFn: toggleLike,
    onError: (err, variables, context) => {
      console.log("like error: ", err);
      console.log("like variables: ", variables);
      console.log("like context: ", context);
    },
    onMutate: async () => {
      await queryClient.cancelQueries(['profile', profileUsername]);
      const previousData = queryClient.getQueryData(['profile', profileUsername]);
      queryClient.setQueryData(['profile', profileUsername], old => ({
        ...old,
        isLiked: !old.isLiked,
      }));
      return { previousData };
    },
    onSuccess: (data) => {
      console.log("like success: ", data);
    },
    onError: (err) => {
      queryClient.setQueryData(['profile', profileUsername], old =>
        old.isLiked
      );
    },
    scope: {
      username: profileUsername,
    }
  });

  // const { blockMutate, blockLoading, data: blockData, error: blockError } = useMutation({
  const blockMutation = useMutation({
    mutationFn: toggleBlock,
    onError : async (variables) => {
      console.log("blockMutation error: ", variables);
    },
    onMutate: async (variables) => {
      console.log("block mutation started")
      await queryClient.cancelQueries(['profile', profileUsername]);
      const previousData = queryClient.getQueryData(['profile', profileUsername]);
      queryClient.setQueryData(['profile', profileUsername], old => ({
        ...old,
        isBlocked: !old.isBlocked,
      }));
      return { previousData };
    },
    onSuccess: (data, variables, context) => {
      // console.log(`data: ${data}, variables: ${variables}, context: ${context}`);
      // isBlocked = !isBlocked
    },
    onError: (err) => {
      console.log("blockMutation error: ", err);
    },
    scope: {
      username: profileUsername,
    }
  });

  if (isLoading) return <div><CustomLayout><h1>Loading...</h1></CustomLayout></div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleLike = () => {
    // console.log("handleLike: ", profileUsername, user?.username, user?.username != profileUsername, isLiked);
    if (user && profileUsername && (user?.username != profileUsername)) {
      likeMutation.mutate({ profileUsername, viewer: user?.username, isLiked });
    } else {
      console.log(`spot the undefined! ${user?.username}, ${profileUsername}, ${user?.username != profileUsername}`);
    }
  };
  
  const handleBlock = () => {
    console.log("handleBlock: ", profileUsername, user?.username, user?.username != profileUsername, isBlocked);
    if (user && profileUsername && (user?.username != profileUsername)) {
      blockMutation.mutate({ profileUsername, viewer: user.username, isBlocked });  
    }
  };

  const handleReport = () => {
    alert("This user has been reported!");
  };

  return (
    <CustomLayout>
      <Card className="w-auto mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {isSelf ? 'Your Profile' : `${profileUsername}'s Profile`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
              {hasPics && pfp && !isSelf && <img src={pfp} alt={profileUsername} />}
              {!hasPics && ( <p>no pics</p>)}
              {isSelf && (
                <PicGallery profileUsername={profileUsername} userinfo={userinfo}/>
              )}
          </div>

          <div className="space-y-2">
            <p><strong>First Name:</strong> {displayUser?.first_name ?? ''}</p>
            <p><strong>Last Name:</strong> {displayUser?.last_name ?? ''}</p>
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
            <p> <strong>Fame Rating:</strong> {displayUser?.famerating ?? 'N/A'}</p>
            <p><strong>Last Online:</strong> {displayUser?.lastOnline ?? 'Unknown'}</p>
          </div>

          {!isSelf && (
            <div className="flex justify-between mt-4">
              <Button onClick={handleLike}
                variant={isLiked ? "default" : "outline"}
                disabled={isBlocked || !hasPics}
              >
                <ThumbsUp className="mr-2 h-4 w-4" /> {isLiked ? 'Unlike' : 'Like'}
              </Button>
              <Button onClick={handleBlock}
                variant={isBlocked ? "default" : "outline"}
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