import React, { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import FileUpload from '@/components/FileUpload';
import CustomLayout from '@/components/MatchaLayout';
import { deleteProfilePicture, changeMainPicture, getUserPics, getProfileAuth } from '@/api';
import { PicItem } from '@/components/PicItem';
import { usePics} from '@/components/PicProvider';

const getImageNumber = (imageName) => parseInt(imageName.match(/_(\d+)\.png$/)[1], 10);

const PicGallery = ({ username }) => {
  const queryClient = useQueryClient();
  const { pics, error, isLoading, inProgress, deletePic, setMainPic, uploadPic } = usePics();

  // const { data: pics, isLoading, error } = useQuery({
  //   queryKey: ['pics', username],
  //   queryFn: () => getUserPics(username),
  //   enabled: !!username,
  //   onError: (err) => console.log('pics error', err),
  //   refetchOnWindowFocus: false,
  //   refetchOnMount: false,
  //   refetchOnReconnect: false,
  //   refetchOnFocus: false,
  // });

  // const deletePicMutation = useMutation({
  //   mutationFn: deleteProfilePicture,
  //   onError: (err, variables, context) => {
  //     queryClient.setQueryData(['pics', username], context.previousPics);
  //   },
  //   onSettled: async () => {
  //     queryClient.cancelQueries({ queryKey: ['pics', username] });
  //   },
  //   retry: 4,
  // });

  // const setMainPicMutation = useMutation({
  //   mutationFn: changeMainPicture,
  //   onSettled: () => {
  //     queryClient.invalidateQueries({
  //       queryKey: ['pics', username],
  //       exact: true,
  //       refetchActive: false
  //     });
  //   },
  //   retry: 4,
  //   enabled: Boolean(pics)
  // })

  const handleDeletePic = useCallback((imageName) => {
    const imageNumber = getImageNumber(imageName);
    deletePic(username, imageNumber)
  }, [deletePic]);

  const handleSetMainPic = useCallback((image) => {
    if (image.isMain) return;
    // setMainPicMutation.mutate({ username, image: image.imageName });
    setMainPic(username, image.imageName)
  }, [setMainPic]);

  if (inProgress) return <div>Loading...</div>;
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
              onSetMain={handleSetMainPic}
            />
          ))}
        </div>
      )}
      <FileUpload username={username}/>
    </CustomLayout>
  );
};

export default PicGallery;