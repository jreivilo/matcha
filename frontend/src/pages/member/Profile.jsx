import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '@/components/UserProvider';
import { useUserData } from '@/hooks/useUserData';
import PicGallery from '@/components/PicGallery';
// components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, UserX, AlertTriangle } from "lucide-react";
import CustomLayout from '@/components/MatchaLayout';
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toggleLike, toggleBlock, markView } from "@/api"
import ProfileForm from '@/components/CustomProfileForm';
import { useRedirectIfLoggedOut } from '@/hooks/useRedirectLogout'

const ProfilePage = () => {
  const { user } = useUser();
  useRedirectIfLoggedOut();
  
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const [isEditMode, setIsEditMode] = useState(false);
  
  const profileUsername = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('username');
  }, [location.search]);
  
  const { data: userInfo, isLoading, error } = useUserData(profileUsername, user?.username);

  const likeMutation = useMutation({
    mutationFn: toggleLike,
    onMutate: async ({ profileUsername, viewer, isLiked }) => {
      await queryClient.cancelQueries(['userData', profileUsername, viewer]);
      const previousUserInfo = queryClient.getQueryData(['userData', profileUsername, viewer]);
      queryClient.setQueryData(['userData', profileUsername, viewer], old => ({
        ...old,
        isLiked: !isLiked
      }));
      return { previousUserInfo };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['userData', variables.profileUsername, variables.viewer], context.previousUserInfo);
    },
    onSettled: (data, error, { profileUsername, viewer }) => {
      queryClient.invalidateQueries(['userData', profileUsername, viewer]);
    }
  });

  const blockMutation = useMutation({
    mutationFn: toggleBlock,
    onMutate: async ({ profileUsername, viewer, isBlocked }) => {
      await queryClient.cancelQueries(['userData', profileUsername, viewer]);
      const previousUserInfo = queryClient.getQueryData(['userData', profileUsername, viewer]);
      queryClient.setQueryData(['userData', profileUsername, viewer], old => ({
        ...old,
        isBlocked: !isBlocked,
        isLiked: !isBlocked ? false : old.isLiked // Unlike if blocking
      }));
      return { previousUserInfo };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['userData', variables.profileUsername, variables.viewer], context.previousUserInfo);
    },
    onSettled: (data, error, { profileUsername, viewer }) => {
      queryClient.invalidateQueries(['userData', profileUsername, viewer]);
    }
  });

  const handleLike = () => {
    if (user && profileUsername && (user?.username != profileUsername)) {
      likeMutation.mutate({ profileUsername, viewer: user?.username, isLiked: userInfo.isLiked });
    }
  };
  
  const handleBlock = () => {
    if (user && profileUsername && (user?.username != profileUsername)) {
      blockMutation.mutate({ profileUsername, viewer: user.username, isBlocked: userInfo.isBlocked });  
    }
  };

  const handleReport = () => {
    alert("This user has been reported!!");
  }

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const { displayUser, isLiked, isBlocked } = userInfo ?? {};
  const isSelf = user?.username === profileUsername;
  const hasPics = displayUser?.pics?.length > 0;
  if (!displayUser?.viewed_by?.includes(user?.username) && !isSelf) {
    markView({ profileUsername: profileUsername, viewer: user?.username });
  }

  return (
    <CustomLayout>
      <Card className="w-auto mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {profileUsername}'s Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
              {displayUser?.pics && !isSelf && <img src={`data:image/jpeg;base64,${displayUser?.pics[0]?.image}`} alt={profileUsername} />}
              {isSelf && !isLoading && !error &&
              <PicGallery profileUsername={profileUsername} mainpic={displayUser?.picture_path} pics={displayUser?.pics}
              />}
          </div>
          { (isEditMode && isSelf) ? <ProfileForm username={profileUsername} isInitialSetup={false} onSubmitComplete={() => setIsEditMode(false)}/> : (
          <div className="space-y-2">
            <p><strong>First Name:</strong> {displayUser?.first_name ?? ''}</p>
            <p><strong>Last Name:</strong> {displayUser?.last_name ?? ''}</p>
            {isSelf && <p><strong>Email:</strong> {displayUser?.email ?? ''}</p>}
            <p><strong>Gender:</strong> {displayUser?.gender ?? ''}</p>
            <p><strong>Sexuality:</strong> {displayUser?.sexuality ?? ''}</p>
            <p><strong>Biography:</strong> {displayUser?.biography ?? ''}</p>
            <p><strong>Location:</strong> {displayUser?.coordinates ?? ''}</p>

            <div>
              <strong>Interests:</strong> 
              {displayUser?.interests?.length > 0 &&
                displayUser.interests.split(',').map(interest => (
                  <Badge key={interest} variant="secondary" className="mr-1">
                    {interest.trim()}
                  </Badge>
                ))
              }
            </div>
          </div>
          )}
          <div>
            <p><strong>Fame Rating:</strong> {displayUser?.famerating ?? 'N/A'}</p>
            <p><strong>Last Online:</strong> {displayUser?.lastOnline ?? 'Unknown'}</p>
            <p><strong>Liked by:</strong> {displayUser?.liked_by ?? 'N/A'}</p>
            <p><strong>Blocked by:</strong> {displayUser?.blocked_by ?? 'N/A'}</p>
            <p><strong>Viewed by:</strong> {displayUser?.viewed_by ?? 'N/A'}</p>
          </div>

          {!isSelf ? (
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
          ) : (
            <div className="flex justify-between mt-4">
              { !isEditMode &&
                <Button onClick={() => setIsEditMode(true)} variant="outline">
                  Edit Profile
                </Button>
              }
            </div>
          )}
        </CardContent>
      </Card>
    </CustomLayout>
  );
};

export default ProfilePage;