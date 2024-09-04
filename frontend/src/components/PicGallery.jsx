import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '@/components/UserProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserInfo } from '@/api';
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileUpload from '@/components/FileUpload';

const PicGallery = ({ profileUsername, userinfo }) => {
  const { displayUser } = userinfo ?? {};

  const handleDeletePic = async (imageName) => {
    const apiUrl = `${API_URL}/image/delete`;
    const response = await fetcher(apiUrl, { username: profileUsername, imageName }, 'POST');
    console.log("handleDeletePic response: ", response);
  };

  const handleMakePrincipal = async (imageName) => {
    const apiUrl = `${API_URL}/image/make-principal`;
    const response = await fetcher(apiUrl, { username: profileUsername, imageName }, 'POST');
    console.log("handleMakePrincipal response: ", response);
  };

  return (
    <div className="grid grid-cols-3 gap-4 mt-4 "> 
      {displayUser?.pics?.map((pic, index) => (
        <div
          key={index}
          className="relative group cursor-pointer"
          onClick={() => setSelectedPic(pic)}
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
            <Button
              onClick={() => handleMakePrincipal(pic.imageName)}
            >
              <Star className="mr-2 h-4 w-4" /> Make Default
            </Button>
          </div>
        </div>
      ))}
      <FileUpload username={profileUsername} userinfo={userinfo} />
    </div>
  );
};

export default PicGallery;