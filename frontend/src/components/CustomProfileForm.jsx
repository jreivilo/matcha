import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserInfo } from "@/api";
import { updateProfile } from "@/api"

const ProfileForm = ({ username, isInitialSetup = false, onSubmitComplete }) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [interests, setInterests] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [gender, setGender] = useState("");
  const [sexuality, setSexuality] = useState("");
  const [biography, setBiography] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(false);

  const queryClient = useQueryClient();

  const { data : userinfo } = useQuery({
    queryKey: ['userData', username, username],
    queryFn: () => getUserInfo(username, username),
    enabled: !!(username.length > 0) && !isInitialSetup,
  });

  useEffect(() => {
    if (userinfo) {
      setGender(userinfo.displayUser.gender);
      setSexuality(userinfo.displayUser.sexuality);
      setBiography(userinfo.displayUser.biography);
      setInterests(userinfo.displayUser.interests.split(','));
      if (!isInitialSetup) {
        setCoordinates(userinfo.displayUser.coordinates || "");
      }
    }
  }, [userinfo, isInitialSetup, setValue]);

  useEffect(() => {
    if (isInitialSetup && !coordinates) {
      setIsLoadingCoordinates(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates(`${position.coords.latitude}, ${position.coords.longitude}`);
          setIsLoadingCoordinates(false);
        },
        async (error) => {
          console.error('Error retrieving location:', error);
          try {
            const response = await fetch("http://ip-api.com/json");
            const geoData = await response.json();
            setCoordinates(`${geoData.lat}, ${geoData.lon}`);
          } catch (ipError) {
            console.error('Error fetching geo info:', ipError);
          }
          setIsLoadingCoordinates(false);
        }
      );
    }
  }, [isInitialSetup, coordinates]);

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
  
  const handleInterestAdd = (e) => {
    e.preventDefault();
    if (newInterest && !interests.includes(newInterest)) {
      setInterests([...interests, newInterest]);
      setNewInterest('');
    }
  };

  const removeInterest = (index) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const handleCoordinatesChange = (e) => {
    setCoordinates(e.target.value);
    console.log("coordinates after handler: ", coordinates);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Gender</Label>
        <div className="flex space-x-2">
          {['Male', 'Female', 'Other'].map((option) => (
            <Button
              key={option}
              type="button"
              variant={gender === option ? "default" : "outline"}
              onClick={() => setGender(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Sexuality</Label>
        <div className="flex space-x-2">
          {['Straight', 'Gay', 'Bisexual'].map((option) => (
            <Button
              key={option}
              type="button"
              variant={sexuality === option ? "default" : "outline"}
              onClick={() => setSexuality(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="biography">Biography</Label>
        <Textarea
          id="biography"
          defaultValue={biography}
          {...register('biography')}
          />
      </div>

      <div className="space-y-2">
        <Label htmlFor="interests">Interests</Label>
        <div className="flex space-x-2">
          <Input
            id="interests"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleInterestAdd(e);
              }
            }}
            placeholder="Add an interest"
          />
          <Button type="button" onClick={handleInterestAdd}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {interests.map((interest, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => removeInterest(index)}
            >
              {interest} ×
            </Badge>
          ))}
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
    </div>
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
