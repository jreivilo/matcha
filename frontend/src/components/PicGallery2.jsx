import React, { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import FileUpload from '@/components/FileUpload';
import CustomLayout from '@/components/MatchaLayout';
import { deleteProfilePicture, changeMainPicture, getUserPics, getProfileAuth } from '@/api';
import { PicItem } from '@/components/PicItem';
import { useAuthStatus } from '@/components/providers/AuthProvider';

const PicGallery = ({mainpic}) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStatus();
  const username = user?.username || '';
  // const [username, setUsername] = useState(user?.username);
  const [main, setMain] = useState(null);

  const { data: pics, isLoading } = useQuery({
    queryKey: ['pics', username],
    queryFn: () => getUserPics(username),
    enabled: !!username,
    onError: (err) => console.log('pics error', err),
  });

  // Optimistic update for deleting a picture
  const deletePicMutation = useMutation({
    mutationFn: deleteProfilePicture,
    onMutate: async ({ imageName, imageIndex }) => {
      await queryClient.cancelQueries(['pics', username]);
      const previousPics = queryClient.getQueryData(['pics', username]);
      const optimisticPics = previousPics
        .filter(pic => pic.imageName !== imageName)
        .map(pic => {
          const currentIndex = parseInt(pic.imageName.match(/_(\d+)\.png$/)[1], 10);
          if (currentIndex > imageIndex) {
            return { ...pic, imageName: `${username}_${currentIndex - 1}.png` };
          }
          return pic;
        });

      let newMain = main;
      if (main === imageName) {
        newMain = optimisticPics[0]?.imageName || null;
      } else if (parseInt(main.match(/_(\d+)\.png$/)[1], 10) > imageIndex) {
        newMain = `${username}_${parseInt(main.match(/_(\d+)\.png$/)[1], 10) - 1}.png`;
      }
      setMain(newMain);
      queryClient.setQueryData(['pics', username], optimisticPics);

      return { previousPics, previousMain: main };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['pics', username], context.previousPics);
      setMain(context.previousMain);
    },
    onSettled: () => {
      // queryClient.invalidateQueries(['pics', username], { refetchInactive: false });
    },
  });

  // Optimistic update for setting main picture
  const changeMainPicMutation = useMutation({
    mutationFn: changeMainPicture,
    onMutate: async ({ image }) => {
      await queryClient.cancelQueries(['pics', username]);
      const previousPics = queryClient.getQueryData(['pics', username]);
      
      queryClient.setQueryData(['pics', username], old => 
        old.map(pic => ({
          ...pic,
          isMain: pic.imageName === image,
        }))
      );
      
      return { previousPics };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['pics', username], context.previousPics);
    },
  });

  // Handlers
  const handleDeletePic = useCallback((imageName) => {
    const imageNumber = parseInt(imageName.match(/_(\d+)\.png$/)[1], 10);
    deletePicMutation.mutate({ username, imageName, imageNumber })
  }, [deletePicMutation]);

  const handleSetMainPic = useCallback((imageName) => {
    setMain(imageName);
    changeMainPicMutation.mutate({ username, image: imageName });
  }, [changeMainPicMutation]);

  // Initialize main picture only once
  useEffect(() => {
    if (mainpic && !main) {
      setMain(mainpic);
    }
  }, [reducedData, main]);

  return (
    <CustomLayout>
      {isLoading ? (
        <div className="h-48 w-full rounded-lg bg-gray-200 animate-pulse">Loading</div>
      ) : (
        <div className="flex flex-row flex-wrap justify-center gap-4">
          {pics?.map((pic) => (
            <PicItem
              key={pic.imageName} 
              pic={pic} 
              onDelete={handleDeletePic} 
              onSetMain={() => handleSetMainPic(pic.imageName)}
              isMainPicture={pic.imageName === main}
            />
          ))}
        </div>
      )}
      <FileUpload username={username} />
    </CustomLayout>
  );
};

export default PicGallery;

import React, { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { uploadProfilePicture } from '@/api';
import { useDropzone } from 'react-dropzone'

const encodeImageAsBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

const FileUpload = ({ username }) => {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const picsMutation = useMutation({
    mutationFn: uploadProfilePicture,
    onMutate: async ({username, file}) => {
      await queryClient.cancelQueries(['pics', username]);
      const previousPics = queryClient.getQueryData(['pics', username]) || [];
      if (previousPics.length >= 5) {
        console.warn('Maximum number of images reached.');
        return;
      }
      const newImageNumber = previousPics.length + 1;
      const newImageName = `${username}_${newImageNumber}.png`;
      const optimisticPics = [
        ...previousPics,
        { imageName: newImageName, image: file }
      ];
      if (newImageNumber === 1) {
        setMain(newImageName);
      }
      queryClient.setQueryData(['pics', username], optimisticPics);
      return { previousPics };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['pics', username], context.previousPics);
      console.error('Error uploading picture:', error);
    },
    onSuccess: (data) => {
      if (data.imageNumber === 1) {
        setMain(data.imageName);
      }
    },
  });

  const validateFile = useCallback((file) => {
    if (!file.type.startsWith('image/')) {
        setError("Invalid file type. Please select a valid image file.");
        return false;
    }
    if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB.");
        return false;
    }
    return true;
  }, []);

  const onDrop = useCallback((files) => {
    setError(null);
    const file = files[0];

    if (validateFile(file)) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        if (img.width < 12000 && img.height < 12000) {
          setSelectedFile(file);
        } else {
          setError("Image dimensions must be 1200x1200px or less");
        }
        URL.revokeObjectURL(img.src)
      }
    }
  }, [validateFile])

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const imageString = await encodeImageAsBase64(selectedFile);
      picsMutation.mutate({ username, file: imageString });
    } catch (error) {
      console.error("File encoding error:", error);
    } finally {
      setUploading(false);
    }
  }, [selectedFile, username, picsMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/png',
    multiple: false,
    maxSize: 5 * 1024 * 1024,
  });

  return (
    <div className="flex flex-col items-center space-y-4">
      {error && (
        <div className="text-red-500 bg-black p-2 rounded-lg">
          {error}
        </div>
      )}
      <div {...getRootProps()} className={`p-4 border-2 border-dashed rounded-lg w-full text-center ${
        isDragActive ? 'border-green-500' : 'border-gray-500'
      }`}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>
      {selectedFile && (
        <Button 
          onClick={handleUpload} 
          disabled={uploading || picsMutation.isLoading}
        >
          {uploading ? 'Uploading...' : 'Upload file'}
        </Button>
      )}
      {picsMutation.isError && (
        <p className="text-red-500">Upload failed. Please try again.</p>
      )}
    </div>
  );
};

export default React.memo(FileUpload);