import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '@/components/UserProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserInfo } from '@/api';
import FileUpload from '@/components/FileUpload';

const PicGallery = ({ profileUsername, userinfo }) => {
  const { displayUser } = userinfo ?? {};

  return (
    <div className="grid grid-cols-3 gap-4 mt-5">
      {displayUser?.pics?.map((pic, index) => (
        <div key={index}>
          <img src={`data:image/jpeg;base64,${pic.image}`} alt={pic.imageName} />
        </div>
      ))}
      <FileUpload username={profileUsername} userinfo={userinfo} />
    </div>
  );
};

export default PicGallery;