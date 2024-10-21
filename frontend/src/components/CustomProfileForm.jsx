import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import GenderSelector from "@/components/form/genderselector";
import SexualitySelector from "@/components/form/sexualityselector";
import InterestSelector from "@/components/form/interestselector";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserInfo } from "@/api";
import { updateProfile } from "@/api";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { useUserData } from "@/hooks/useUserData";

const ProfileForm = ({ username, isInitialSetup = false, onSubmitComplete }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      email: "",
      biography: "",
      coordinates: "",
      gender: "",
      sexuality: "",
      interests: []
    },
  });
  const queryClient = useQueryClient();
  const geolocation = useGeoLocation();
  
  const { data: userInfo, isLoading, error } = useUserData(username, username);
  
  useEffect(() => {
    if (userInfo) {
      const { gender, sexuality, interests, email, biography, coordinates } = userInfo.displayUser || {};
      setValue("gender", gender || "");
      setValue("sexuality", sexuality || "");
      setValue("interests", interests || "");
      setValue("email", email || "");
      setValue("biography", biography || "");
      setValue("coordinates", isInitialSetup ? geolocation : (coordinates || ""));
    }
  }, [userInfo, setValue, isInitialSetup]);
  
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(['userData', username]);
      onSubmitComplete();
    },
    onError: (error) => {
      console.error('Error submitting profile:', error);
    }
  });

  const onSubmit = async (data) => {
    const profileData = {
      username,
      email: data.email,
      biography: data.biography,
      interests: data.interests.join(','),
      gender: data.gender,
      sexuality: data.sexuality || "Bisexual",
      coordinates: data.coordinates ? data.coordinates : geolocation,
    };

    try {
      await updateProfileMutation.mutateAsync({ username, newUserData: profileData });
    } catch (error) {
      console.error("Profile update failed:", error);
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <GenderSelector gender={watch('gender')} setGender={(value) => setValue("gender", value)} />
      
      <SexualitySelector sexuality={watch('sexuality')} setSexuality={(value) => setValue("sexuality", value)} />

      <InterestSelector interests={watch('interests')} setInterests={(value) => setValue("interests", value)} />

      <div className="space-y-2">
        <Label htmlFor="biography">Biography</Label>
        <Textarea id="biography" {...register('biography')} />
      </div>

      {!isInitialSetup && (
        <>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" {...register('email')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coordinates">Coordinates</Label>
            <Input id="coordinates" {...register('coordinates')} />
          </div>
        </>
      )}

      {errors && <p>{JSON.stringify(errors)}</p>}

      <Button type="submit" className="w-full">
        {isInitialSetup ? "Complete Profile" : "Save Changes"}
      </Button>
    </form>
  );
};

export default ProfileForm;