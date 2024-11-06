import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import CustomLayout from "../../components/MatchaLayout";
import { useLocation, useNavigate } from "react-router-dom";
import PicGallery from '@/components/PicGallery';
import ProfileForm from '@/components/CustomProfileForm';
import { useAuthStatus } from '@/components/AuthProvider'
import { useUserData } from '@/hooks/useUserData'

const FillInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStatus()
  const { data: userinfo } = useUserData(user?.username);
  
  const { displayUser} = userinfo ?? {};
  const username = displayUser?.username;

  return (
    <CustomLayout >
      <Card className="w-[450px] mx-auto mt-auto">
        <CardHeader>
          <CardTitle>Fill Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <PicGallery profileUsername={username} mainpic={displayUser?.picture_path} pics={displayUser?.pics}/>
          <ProfileForm username={username} isInitialSetup={true} onSubmitComplete={ () => navigate('/member/dashboard') }/>
        </CardContent>
      </Card>
    </CustomLayout >
  );
};

export default FillInfo;