import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '@/components/UserProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserInfo } from '@/api';
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileUpload from '@/components/FileUpload';
import { deleteProfilePicture } from '@/api';

const PicGallery = ({ profileUsername, userinfo }) => {
  const { displayUser } = userinfo ?? {};

  const queryClient = useQueryClient();

  const deletePicMutation = useMutation({
    mutationFn: deleteProfilePicture,
    onMutate: async ( { username, imageName }) => {
      await queryClient.cancelQueries(['profile', profileUsername]);
      const previousData = queryClient.getQueryData(['profile', profileUsername]);
      const newPics = previousData.displayUser.pics.filter(pic => pic.imageName !== imageName);
      queryClient.setQueryData(['profile', profileUsername], old => ({
        ...old,
        displayUser: {
          ...old.displayUser,
          pics: newPics,
        },
      }));
      return { previousData };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['profile', profileUsername]);
    },
    onError: (err) => {
      queryClient.setQueryData(['profile', profileUsername], old =>
        old
      );
    },
    scope: {
      username: profileUsername,
    }
  });

  const handleDeletePic = async (imageName) => {
    deletePicMutation.mutate({ username : profileUsername, imageName });
  };

  // const handleMakePrincipal = async (imageName) => {
  //   const apiUrl = `${API_URL}/image/make-principal`;
  //   const response = await fetcher(apiUrl, { username: profileUsername, imageName }, 'POST');
  //   console.log("handleMakePrincipal: ", response);
  // };

  return (
    <div className="grid grid-cols-3 gap-4 mt-4 "> 
      {displayUser?.pics?.map((pic, index) => (
        <div
          key={index}
          className="relative group cursor-pointer"
        >
          <img
            src={`data:image/jpeg;base64,${pic.image}`}
            alt={pic.imageName}
            className="object-cover w-56 h-48"
          />
          <div className="absolute inset-0 bg-black bg-opacity-35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              onClick={() => handleDeletePic(pic.imageName)}
              className="mr-2"
            >
              Delete
            </Button>
            {/* <Button
              onClick={() => handleMakePrincipal(pic.imageName)}
            >
              <Star className="mr-2 h-4 w-4" /> Make Default
            </Button> */}
          </div>
        </div>
      ))}
      <FileUpload username={profileUsername} userinfo={userinfo} />
    </div>
  );
};

export default PicGallery;