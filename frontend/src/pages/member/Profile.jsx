import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '@/components/providers/UserProvider';
import { useUserData } from '@/hooks/useUserData';
import PicGallery from '@/components/PicGallery';
// components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import CustomLayout from '@/components/MatchaLayout';
import { markView } from "@/api"
import ProfileForm from '@/components/CustomProfileForm';
import { InteractionMenu } from '@/components/Interaction';
import { fetcher } from '@/api';
import { useAuthStatus } from '@/hooks/useAuthStatus';

const API_URL = 'http://localhost:3000';

const ProfilePage = () => {
  const { user } = useUser();
  const { isAuthentified } = useAuthStatus();
  
  const location = useLocation();
  
  const [isEditMode, setIsEditMode] = useState(false);
  
  const profileUsername = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('username');
  }, [location.search]);
  
  const { data: userInfo, isLoading, error } = useUserData(profileUsername, user?.username);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const { displayUser } = userInfo ?? {};
  const isSelf = user?.username === profileUsername;
  if (!displayUser?.viewed_by?.includes(user?.username) && !isSelf) {
    markView({ profileUsername: profileUsername, viewer: user?.username });
  }

  const handleVerification = async () => {
    const reqUrl = `${API_URL}/user/request-verification`;
    await fetcher(reqUrl, { username: profileUsername }, 'POST');
  }

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
                    {(isSelf && !isLoading && !error && displayUser?.pics) ? (
                        <div className='space-y-4'>
                          <PicGallery profileUsername={profileUsername} mainpic={displayUser?.picture_path} pics={displayUser?.pics}/>
                        </div> ) : (
                        <div className='w-48 h-48 rounded-full overflow-hidden'>
                          <img
                            src={`data:image/jpeg;base64,${displayUser?.pics[0]?.image}`}
                            alt={profileUsername}
                          />
                        </div>
                    )}
                  </div>
                  <div className="space-y-4 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">First Name</p>
                        <p className="font-medium">{displayUser?.first_name ?? 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Name</p>
                        <p className="font-medium">{displayUser?.last_name ?? 'Not set'}</p>
                      </div>
                      {isSelf && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{displayUser?.email ?? 'Not set'}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="font-medium">{displayUser?.gender ?? 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Sexuality</p>
                        <p className="font-medium">{displayUser?.sexuality ?? 'Not set'}</p>
                      </div>
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
                <CardTitle className="text-xl font-bold">Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Biography</h3>
                  <p className="text-gray-700">{displayUser?.biography ?? 'No biography added'}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {displayUser?.interests?.map(interest => (
                      <Badge key={interest} variant="secondary">
                        {interest.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Fame Rating</p>
                    <p className="text-xl font-bold">{displayUser?.famerating ?? 'N/A'}</p>
                  </div>
                  <div className="p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Last Online</p>
                    <p className="text-xl font-bold">{displayUser?.lastOnline ?? 'Unknown'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Liked by</h3>
                    <div className="flex flex-wrap gap-2">
                      {displayUser?.liked_by && displayUser.liked_by.map(user => (
                        <Link key={user} to={`?username=${user.trim()}`}>
                          <Badge variant="outline" className="hover:bg-gray-200">
                            {user.trim()}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Recent Visitors</h3>
                    <div className="flex flex-wrap gap-2">
                      {displayUser?.viewed_by?.map(user => (
                        <Link key={user} to={`?username=${user.trim()}`}>
                          <Badge variant="outline" className="hover:bg-gray-200">
                            {user.trim()}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

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