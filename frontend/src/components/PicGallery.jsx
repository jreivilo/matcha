import React, { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import FileUpload from '@/components/FileUpload';
import CustomLayout from '@/components/MatchaLayout';
import { deleteProfilePicture, changeMainPicture, getUserPics, getProfileAuth } from '@/api';
import { PicItem } from '@/components/PicItem';
// import { useAuthStatus } from '@/hooks/useAuthStatus';

const PicGallery = ({username, mainpic}) => {
  const queryClient = useQueryClient();
  // const { user } = useAuthStatus();
  // const username = user?.username;
  const [main, setMain] = useState(mainpic);

  const { data: pics, isLoading } = useQuery({
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
  // useEffect(() => {
  //   if (reducedData?.displayUser?.picture_path && !main) {
  //     setMain(reducedData.displayUser.picture_path);
  //   }
  // }, [reducedData, main]);

  // if (isLoadingData) return <div>Loading...</div>;
  // if (error) return <div>Error: {error.message}</div>;

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