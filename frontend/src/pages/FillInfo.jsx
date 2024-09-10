import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CustomLayout from "../components/MatchaLayout";
import { useLocation, useNavigate } from "react-router-dom";
import PicGallery from '@/components/PicGallery';
import { useQuery} from '@tanstack/react-query';
import { getUserInfo } from '@/api';
import { fetcher } from '@/api';
import ProfileForm from '@/components/CustomProfileForm';

const FillInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const usernameParam = params.get('username');
    if (usernameParam) {
      setUsername(usernameParam);
    } else {
      navigate('/member/dashboard');
    }
  }, [location, navigate]);

  // get user info
  const { data : userinfo } = useQuery({
    queryKey: ['userData', username, username],
    queryFn: () => getUserInfo(username, username),
    enabled: !!(username.length > 0),
  });

  const { displayUser} = userinfo ?? {};

  return (
    <CustomLayout >
      <Card className="w-[450px] mx-auto mt-auto">
        <CardHeader>
          <CardTitle>Fill Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <PicGallery profileUsername={username} mainpic={displayUser?.picture_path} pics={displayUser?.pics}/>
          <ProfileForm username={username}/>
        </CardContent>
        {(Object.keys(errors).length > 0 || submitError) && (
          <CardFooter>
            <Alert variant="destructive">
              <AlertDescription>
                {Object.values(errors)[0]?.message || submitError}
              </AlertDescription>
            </Alert>
          </CardFooter>
        )}
      </Card>
    </CustomLayout >
  );
};

export default FillInfo;