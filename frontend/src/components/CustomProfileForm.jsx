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
import { CardFooter, Alert, AlertDescription } from "@/components/ui/alert";


const ProfileForm = ({ username, setIsEditMode }) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [interests, setInterests] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [gender, setGender] = useState("");
  const [sexuality, setSexuality] = useState("");
  const [biography, setBiography] = useState("");
  const [coordinates, setCoordinates] = useState("");

  const queryClient = useQueryClient();

  const { data : userinfo } = useQuery({
    queryKey: ['userData', username, username],
    queryFn: () => getUserInfo(username, username),
    enabled: !!(username.length > 0),
  });

  useEffect(() => {
    if (userinfo) {
      setGender(userinfo.displayUser.gender);
      setSexuality(userinfo.displayUser.sexuality);
      setBiography(userinfo.displayUser.biography);
      setInterests(userinfo.displayUser.interests.split(','));
      setCoordinates(userinfo.displayUser.coordinates);
    }
    if (!coordinates) {
      navigator.geolocation.getCurrentPosition(
        (position) => { setCoordinates(`${position.coords.latitude}, ${position.coords.longitude}`); },
        (error) => { console.error('Error retrieving location:', error); }
      );
    }
  }, [userinfo]);

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onMutate: async ({ username, newUserData }) => {
      await queryClient.cancelQueries(['userData', username, username]);
      const previousUserInfo = queryClient.getQueryData(['userData', username, username]);
      queryClient.setQueryData(['userData', username, username], old => ({
        ...old,
        ...newUserData
      }));
      return { previousUserInfo };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['userData', variables.username, variables.username], context.previousUserInfo);
    },
    onSettled: (data, error, { username }) => {
      queryClient.invalidateQueries(['userData', username, username]);
    }
  });

  const onSubmit = async (data) => {
    // TODO: incorporate the comments below or remove // TODO
    // e.preventDefault();
    // const formData = new FormData(e.target);
    // const newUserData = Object.fromEntries(formData.entries());
    // update
    if (!sexuality) { setSexuality("Bisexual"); }
    console.log("coordinates: ", coordinates);
    let coords = coordinates;
    if (!coordinates) {
        try {
            const response = await fetch("http://ip-api.com/json");
            const geoData = await response.json();
            coords = `${geoData.lat}, ${geoData.lon}`;
            console.log("coords: ", coords);
        } catch (error) {
            console.error('Error fetching geo info:', error);
        }
    }

    const profileData = {
      ...data,
      interests: interests.join(','),
      gender,
      sexuality,
      username,
      coordinates: coords,
    };
    try {
      updateProfileMutation.mutate({ username, newUserData: profileData });
      // if (setIsEditMode) { setIsEditMode(false); }
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
          {...register('biography', { required: 'Biography is required' })}
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

        {coordinates ? (
          <div className="space-y-2">
            <Label htmlFor="coordinates">Coordinates</Label>
            <Textarea
              id="coordinates"
              defaultValue={coordinates}
              {...register('coordinates', { required: 'Coordinates are required'})}
            />
          </div>
        ) : <span></span>}
      </div>

      <Button type="submit" className="w-full">Submit</Button>
    </form>
    )
    {(Object.keys(errors).length > 0 || submitError) && (
      <CardFooter>
        <Alert variant="destructive">
          <AlertDescription>
            {Object.values(errors)[0]?.message || submitError}
          </AlertDescription>
        </Alert>
      </CardFooter>
    )}
};

export default ProfileForm