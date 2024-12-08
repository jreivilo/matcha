import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useUserData } from '@/hooks/useUserData';
import { fetcher, markView } from '@/api';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { getPfpUrl } from '@/lib/utils';
// components
import PicGallery from '@/components/PicGallery';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import CustomLayout from '@/components/MatchaLayout';
import ProfileForm from '@/components/CustomProfileForm';
import { InteractionMenu } from '@/components/Interaction';

const API_URL = '/api';

const ProfilePage = () => {
  const { isAuthentified, user } = useAuthStatus();
  
  const location = useLocation();
  
  const [isEditMode, setIsEditMode] = useState(false);
  
  const profileUsername = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('username');
  }, [location.search]);
  const isSelf = useMemo(() => user?.username === profileUsername, [profileUsername, user]);
  
  const { data: userInfo, isLoading, error } = useUserData(profileUsername);

  useEffect(() => {
    if (!isSelf && userInfo?.displayUser && user?.username) {
      const alreadyViewed = userInfo.displayUser.viewed_by?.includes(user.username);
      if (!alreadyViewed) {
        markView({ profileUsername, viewer: user.username });
      }
    }
  }, [userInfo, user, isSelf, profileUsername]);  

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // const { displayUser } = userInfo?.displayUser ?? {};
  const displayUser = userInfo?.displayUser;

  const handleVerification = async () => {
    const reqUrl = '/user/request-verification';
    await fetcher(reqUrl, { username: profileUsername }, 'POST');
  }

  const ListToBadge = ({ title, items }) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items && items.map(item => (
          <Badge key={item} variant="secondary">
            <Link to={`/member/profile?username=${item}`} className="text-sm text-white hover:text-lg hover:text-black">
            {item.trim()}
            </Link>
          </Badge>
        ))}
      </div>
    </div>
  );

  const BasicBadge = ({ title, value }) => (
    <div className="p-4 rounded-lg">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold">{value ?? 'Not set'}</p>
    </div>
  );

  return (
    <CustomLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        { isEditMode ? (
          <ProfileForm username={profileUsername} isInitialSetup={false} onSubmitComplete={() => setIsEditMode(false)}/>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    {profileUsername}'s Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="mb-6">
                  <div className="flex justify-center">
                    {(isSelf && !isLoading && !error) ? (
                        <div className='space-y-4'>
                          <PicGallery username={profileUsername} mainpic={displayUser?.picture_path}/>
                        </div> ) : ((displayUser?.picture_path && displayUser?.pics.length > 0) && (
                          <div className='w-48 h-48 rounded-full overflow-hidden'>
                            <img
                            src={getPfpUrl(displayUser.picture_path, displayUser.pics)}
                            alt={profileUsername}
                            />
                          </div>
                        )
                      )}
                  </div>
                  <div className="space-y-4 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <BasicBadge title="First Name" value={displayUser?.first_name ?? 'Not set'} />
                      <BasicBadge title="Last Name" value={displayUser?.last_name ?? 'Not set'} />
                      {isSelf && (
                        <BasicBadge title="Email" value={displayUser?.email ?? 'Not set'} />
                      )}
                      <BasicBadge title="Gender" value={displayUser?.gender ?? 'Not set'} />
                      <BasicBadge title="Sexuality" value={displayUser?.sexuality ?? 'Not set'} />
                    </div>
                </div>
                  <div className="mt-6 flex justify-between">
                    {isSelf ? (
                        <Button onClick={() => setIsEditMode(true)} variant="outline">
                          Edit Profile
                        </Button>
                    ) : (
                      <InteractionMenu profileUsername={profileUsername} user={user}/>
                    )}
                  </div>
                </CardContent>
            </Card>
            <Card className="h-fit">
              <CardHeader>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Biography</h3>
                  <p className="text-gray-700">{displayUser?.biography ?? 'No biography added'}</p>
                </div>

                <ListToBadge title="Interests" items={displayUser?.interests} />"
                <BasicBadge title="Location" value={displayUser?.coordinates ?? 'Not set'} /> 
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <BasicBadge title="Fame Rating" value={displayUser?.famerating ?? 'N/A'} />
                  <BasicBadge title="Last Online" value={displayUser?.lastOnline ?? 'Unknown'} />
                </div>
                <ListToBadge title="Liked by" items={displayUser?.liked_by} />
                <ListToBadge title="Blocked by" items={displayUser?.blocked_by} />
                <ListToBadge title="Recent Visitors" items={displayUser?.viewed_by} />

                <div className="mt-6">
                  {displayUser?.verified ? (
                    <Badge variant="success" className="w-full justify-center">
                      ✓ Email Verified
                    </Badge>
                  ) : (
                    <div className="text-center">
                      <Badge variant="destructive" className="mb-2 text-xl">
                        🚫 Email Unverified
                      </Badge>
                      {isAuthentified &&
                        <Button 
                          onClick={handleVerification} 
                          variant="outline"
                          className="w-full"
                        >
                          Request Verification
                        </Button>}
                      </div>)
                    }
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </CustomLayout>
  );
};

export default ProfilePage;