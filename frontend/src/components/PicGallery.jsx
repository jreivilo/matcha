import React, { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import FileUpload from '@/components/FileUpload';
import CustomLayout from '@/components/MatchaLayout';
import { deleteProfilePicture, changeMainPicture, getUserPics, getProfileAuth } from '@/api';
import { PicItem } from '@/components/PicItem';
// import { useAuthStatus } from '@/hooks/useAuthStatus';

const getImageNumber = (imageName) => parseInt(imageName.match(/_(\d+)\.png$/)[1], 10);

const PicGallery = ({username, mainpic}) => {
  const queryClient = useQueryClient();
  const [main, setMain] = useState(mainpic || null);

  const { data: pics, isLoading, error } = useQuery({
    queryKey: ['pics', username],
    queryFn: () => getUserPics(username),
    enabled: !!username,
    onError: (err) => console.log('pics error', err),
    onSettled: () => {
      setMain(mainpic);
    }
  });

  // Optimistic update for deleting a picture
  const deletePicMutation = useMutation({
    mutationFn: deleteProfilePicture,
    onMutate: async ({ imageName }) => {
      await queryClient.cancelQueries(['pics', username]);    
      const previousPics = queryClient.getQueryData(['pics', username]);
    
      const optimisticPics = previousPics.filter(pic => pic.imageName !== imageName);
    
      const reindexedPics = optimisticPics.map((pic, index) => ({
        ...pic,
        imageName: `${username}_${index + 1}.png`, // Re-index to maintain sequential naming
      }));
    
      let newMain = main;
      if (main === imageName) {
        newMain = reindexedPics[0]?.imageName || null;
      } else if (getImageNumber(main) > getImageNumber(imageName)) {
        newMain = `${username}_${getImageNumber(main) - 1}.png`;
      }
      const previousMain = main;
      setMain(newMain);
      queryClient.setQueryData(['pics', username], reindexedPics);
      return { previousPics, previousMain };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['pics', username], context.previousPics);
      setMain(context.previousMain);
    },
    retry: 4
  });

  const changeMainPicMutation = useMutation({
    mutationFn: changeMainPicture,
    onMutate: async ({ image }) => {
      await queryClient.cancelQueries(['pics', username]);
      const previousMain = main;
      setMain(image);
      return { previousMain };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['pics', username], context.previousPics);
      setMain(context.previousMain);
      console.error('Error changing main picture:', err);
      setError("Failed to set main picture. Please try again.");
    },
    retry: 4
  });

  const handleDeletePic = useCallback((imageName) => {
    const imageNumber = parseInt(imageName.match(/_(\d+)\.png$/)[1], 10);
    deletePicMutation.mutate({ username, imageName, imageNumber })
  }, [deletePicMutation]);

  const handleSetMainPic = useCallback((imageName) => {
    changeMainPicMutation.mutate({ username, image: imageName });
  }, [changeMainPicMutation]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

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
      <FileUpload username={username} setMain={setMain} />
    </CustomLayout>
  );
};

export default PicGallery;