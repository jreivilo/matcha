import React, { useEffect, useState } from "react";
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
import { updateProfile } from "@/api"
import { useGeoLocation } from "@/hooks/useGeoLocation";

const ProfileForm = ({ username, isInitialSetup = false, onSubmitComplete }) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [interests, setInterests] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [gender, setGender] = useState("");
  const [sexuality, setSexuality] = useState("");
  const [biography, setBiography] = useState("");

  const queryClient = useQueryClient();

  const { data : userinfo } = useQuery({
    queryKey: ['userData', username, username],
    queryFn: () => getUserInfo(username, username),
    enabled: !!(username.length > 0) && !isInitialSetup,
  });

  const { coordinates, isLoadingCoordinates, setCoordinates } = useGeoLocation(isInitialSetup);

  useEffect(() => {
    if (userinfo) {
      setGender(userinfo.displayUser.gender);
      setSexuality(userinfo.displayUser.sexuality);
      setBiography(userinfo.displayUser.biography);
      if (userinfo.displayUser.interests.length > 0) {
        setInterests(userinfo.displayUser.interests.split(','));
      } else { setInterests([]); }
      if (!isInitialSetup) {
        setCoordinates(userinfo.displayUser.coordinates || "");
      } else {

      }
    }
  }, [userinfo, isInitialSetup, setValue]);

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSettled: (data, error, { username }) => {
      queryClient.invalidateQueries(['userData', username, username]);
    }
  });
  
  const onSubmit = async (data) => {

    if (!sexuality) { setSexuality("Bisexual"); }

    const profileData = {
      interests: interests.join(',') || "",
      gender,
      sexuality,
      username,
      coordinates: data.coordinates ? data.coordinates : coordinates,
      biography: data.biography ? data.biography : biography,
    };

    try {
      await updateProfileMutation.mutateAsync({ username, newUserData: profileData });
      onSubmitComplete();
    } catch (error) {
      console.error('Error submitting profile:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <GenderSelector gender={gender} setGender={setGender} />
      <SexualitySelector sexuality={sexuality} setSexuality={setSexuality} />
      <InterestSelector interests={interests} setInterests={setInterests} newInterest={newInterest} setNewInterest={setNewInterest} />

      <div className="space-y-2">
        <Label htmlFor="biography">Biography</Label>
        <Textarea
          id="biography"
          defaultValue={biography}
          {...register('biography')}
          />
      </div>

      {!isInitialSetup && (
        <div className="space-y-2">
          <Label htmlFor="coordinates">Coordinates</Label>
          {isLoadingCoordinates ? (
            <div>Loading coordinates...</div>
          ) : (
            <Input
              id="coordinates"
              defaultValue={coordinates}
              {...register('coordinates')}
              />
            )}
        </div>
      )}
    <Button type="submit" className="w-full">
      {isInitialSetup ? "Complete Profile" : "Save Changes"}
    </Button>
    {submitError && (
      <div className="text-red-500">
        {submitError} 
      </div>
    )}
  </form>
)}

export default ProfileForm;
