import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '@/components/providers/UserProvider';
import { useUserData } from '@/hooks/useUserData';
import PicGallery from '@/components/PicGallery';
// components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CustomLayout from '@/components/MatchaLayout';
import { markView } from "@/api"
import ProfileForm from '@/components/CustomProfileForm';
import { useRedirectIfLoggedOut } from '@/hooks/useRedirectLogout'
import { InteractionMenu } from '@/components/Interaction';

const ProfilePage = () => {
  const { user } = useUser();
  useRedirectIfLoggedOut();
  
  const location = useLocation();
  
  const [isEditMode, setIsEditMode] = useState(false);
  
  const profileUsername = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('username');
  }, [location.search]);
  
  const { data: userInfo, isLoading, error } = useUserData(profileUsername, user?.username);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const { displayUser, isLiked, isBlocked } = userInfo ?? {};
  const isSelf = user?.username === profileUsername;
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
          { isEditMode ?
          <ProfileForm username={profileUsername} isInitialSetup={false} onSubmitComplete={() => setIsEditMode(false)}/>
          : (
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

          {isSelf ? (
            <div className="flex justify-between mt-4">
            { !isEditMode &&
              <Button onClick={() => setIsEditMode(true)} variant="outline">
                Edit Profile
              </Button>
            }
          </div>
          ) : (
            <InteractionMenu profileUsername={profileUsername} user={user}/>
          )}
        </CardContent>
      </Card>
    </CustomLayout>
  );
};

export default ProfilePage;