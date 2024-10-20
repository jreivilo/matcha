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
  const geoLocation = useGeoLocation();

  const { data: userinfo } = useQuery({
    queryKey: ['userData', username],
    queryFn: () => getUserInfo(username),
    enabled: !!username && !isInitialSetup,
  });

  useEffect(() => {
    if (userinfo) {
      const { gender, sexuality, interests, email, biography, coordinates } = userinfo.displayUser || {};
      setValue("gender", gender || "");
      setValue("sexuality", sexuality || "");
      setValue("interests", interests || "");
      setValue("email", email || "");
      setValue("biography", biography || "");
      setValue("coordinates", coordinates || (isInitialSetup ? geoLocation : ""));
    }
  }, [userinfo, setValue, geoLocation, isInitialSetup]);

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
      coordinates: data.coordinates,
    };

    try {
      await updateProfileMutation.mutateAsync({ username, newUserData: profileData });
    } catch (error) {
      console.error("Profile update failed:", error);
    }
  };

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

      <Button type="submit" className="w-full">
        {isInitialSetup ? "Complete Profile" : "Save Changes"}
      </Button>
    </form>
  );
};

export default ProfileForm;

// import React, { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import GenderSelector from "@/components/form/genderselector";
// import SexualitySelector from "@/components/form/sexualityselector";
// import InterestSelector from "@/components/form/interestselector";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { getUserInfo } from "@/api";
// import { updateProfile } from "@/api"
// import { useGeoLocation } from "@/hooks/useGeoLocation";

// const ProfileForm = ({ username, isInitialSetup = false, onSubmitComplete }) => {
//   const { register, handleSubmit, formState: { errors }, setValue } = useForm();
//   const [submitError, setSubmitError] = useState("");
//   const [interests, setInterests] = useState([]);
//   const [newInterest, setNewInterest] = useState("");
//   const [gender, setGender] = useState("");
//   const [sexuality, setSexuality] = useState("");
//   const [coordinates, setCoordinates] = useState("");

//   const queryClient = useQueryClient();

//   const { data : userinfo } = useQuery({
//     queryKey: ['userData', username, username],
//     queryFn: () => getUserInfo(username, username),
//     enabled: !!(username.length > 0) && !isInitialSetup,
//   });

//   useEffect(() => { 
//     if (!isInitialSetup) {
//       setCoordinates(userinfo?.displayUser?.coordinates || "");
//     } else {
//       setCoordinates(useGeoLocation());
//     }
//   }, [userinfo, isInitialSetup, setCoordinates]);

  

//   useEffect(() => {
//     if (userinfo) {
//       setGender(userinfo.displayUser.gender);
//       setSexuality(userinfo.displayUser.sexuality);
//       if (userinfo.displayUser.interests.length > 0) {
//         setInterests(userinfo.displayUser.interests);
//       } else { setInterests([]); }
//       if (!isInitialSetup) {
//         setCoordinates(userinfo.displayUser.coordinates || "");
//       } else {

//       }
//     }
//   }, [userinfo, isInitialSetup, setValue]);

//   const updateProfileMutation = useMutation({
//     mutationFn: updateProfile,
//     onSettled: (data, error, { username }) => {
//       queryClient.invalidateQueries(['userData', username, username]);
//     }
//   });
  
//   const onSubmit = async (data) => {
//     if (!sexuality) { setSexuality("Bisexual"); }

//     const profileData = {
//       username,
//       email: data.email ? data.email : userinfo?.displayUser?.email,
//       interests: interests.join(',') || "",
//       gender,
//       sexuality,
//       coordinates: data.coordinates ? data.coordinates : coordinates,
//       biography: data.biography ? data.biography : userinfo?.displayUser?.biography,
//     };

//     try {
//       await updateProfileMutation.mutateAsync({ username, newUserData: profileData });
//       onSubmitComplete();
//     } catch (error) {
//       console.error('Error submitting profile:', error);
//     }
//   };

//   const handleCoordinatesChange = (e) => {
//     setCoordinates(e.target.value);
//     console.log("coordinates after handler: ", coordinates);
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//       <GenderSelector gender={gender} setGender={setGender} />
//       <SexualitySelector sexuality={sexuality} setSexuality={setSexuality} />
//       <InterestSelector interests={interests} setInterests={setInterests} newInterest={newInterest} setNewInterest={setNewInterest} />

//       <div className="space-y-2">
//         <Label htmlFor="biography">Biography</Label>
//         <Textarea
//           id="biography"
//           defaultValue={userinfo?.displayUser?.biography}
//           {...register('biography')}
//           />
//       </div>

//       {!isInitialSetup && (
//         <div>
//           <div className="space-y-2">
//             <Label htmlFor="email">Email</Label>
//             <Input
//               id="email"
//               defaultValue={userinfo?.displayUser?.email}
//               {...register('email')}
//               />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="coordinates">Coordinates</Label>
//             <Input
//               id="coordinates"
//               defaultValue={userinfo?.displayUser?.coordinates}
//               {...register('coordinates')}
//               />
//           </div>
//         </div>
//       )}

//     <Button type="submit" className="w-full">
//       {isInitialSetup ? "Complete Profile" : "Save Changes"}
//     </Button>
//     {submitError && (
//       <div className="text-red-500">
//         {submitError} 
//       </div>
//     )}
//   </form>
// )}

// export default ProfileForm;
