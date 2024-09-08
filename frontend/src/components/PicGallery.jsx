import React, { useCallback, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import FileUpload from '@/components/FileUpload';
import { deleteProfilePicture, changeMainPicture } from '@/api';
import { PicItem } from '@/components/PicItem';

const PicGallery = ({ profileUsername, mainpic, pics }) => {
  const [main, setMain] = useState(mainpic); // Initialize local state with mainpic
  const queryClient = useQueryClient();

  const deletePicMutation = useMutation({
    mutationFn: deleteProfilePicture,
    onMutate: async ({ username, imageName }) => {
      await queryClient.cancelQueries(['userData', username, username]);
      const previousUserData = queryClient.getQueryData(['userData', username, username]);

      queryClient.setQueryData(['userData', username, username], old => {
        const updatedPics = old.displayUser.pics.filter(pic => pic.imageName !== imageName);
        const deletedIndex = old.displayUser.pics.findIndex(pic => pic.imageName === imageName);
        
        // Determine the new main picture index
        let newMainIndex = old.displayUser.pics.findIndex(pic => pic.imageName === old.displayUser.picture_path);
        if (newMainIndex === deletedIndex) {
          newMainIndex = updatedPics.length > 0 ? 0 : -1; // Set to first picture or -1 if none left
        } else if (newMainIndex > deletedIndex) {
          newMainIndex--;
        }

        // Rename remaining pictures and update main status
        const renamedPics = updatedPics.map((pic, index) => ({
          ...pic,
          imageName: `${username}_${index + 1}.png`,
          isMain: index === newMainIndex
        }));

        return {
          ...old,
          displayUser: {
            ...old.displayUser,
            pics: renamedPics,
            picture_path: newMainIndex !== -1 ? renamedPics[newMainIndex].imageName : null // Update picture_path
          }
        };
      });

      return { previousUserData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['userData', variables.username, variables.username], context.previousUserData);
    },
    onSettled: (data, error, { username }) => {
      queryClient.invalidateQueries(['userData', username, username]);
    },
  });

  const changeMainPicMutation = useMutation({
    mutationFn: changeMainPicture,
    onMutate: async ({ username, image }) => {
      await queryClient.cancelQueries(['userData', username, username]);
      const previousUserData = queryClient.getQueryData(['userData', username, username]);

      queryClient.setQueryData(['userData', username, username], old => {
        const updatedPics = old.displayUser.pics.map(pic => ({
          ...pic,
          isMain: pic.imageName === image
        }));
        return {
          ...old,
          displayUser: {
            ...old.displayUser,
            pics: updatedPics,
            picture_path: image // Update picture_path to the new main picture
          }
        };
      });

      return { previousUserData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['userData', variables.username, variables.username], context.previousUserData);
    },
    onSettled: (data, error, { username }) => {
      queryClient.invalidateQueries(['userData', username, username]);
    },
  });

  const handleDeletePic = useCallback((imageName) => {
    const imageNumber = parseInt(imageName.split('_')[1].split('.')[0], 10);
    deletePicMutation.mutate({ username: profileUsername, imageName, imageNumber });
  }, [deletePicMutation, profileUsername]);

  const handleSetMainPic = useCallback((imageName) => {
    setMain(imageName); // Update local state for main picture
    changeMainPicMutation.mutate({ username: profileUsername, image: imageName });
  }, [changeMainPicMutation, profileUsername]);

  // Update local main state if the main picture prop changes
  useEffect(() => {
    setMain(mainpic);
  }, [mainpic]);

  return (
    <div className="grid grid-cols-3 gap-4 mt-4"> 
      {pics?.map((pic) => (
        <PicItem 
          key={pic.imageName} 
          pic={pic} 
          onDelete={handleDeletePic} 
          onSetMain={handleSetMainPic}
          isMainPicture={pic.imageName === main} // Highlight the main picture
        />
      ))}
      <FileUpload username={profileUsername} />
    </div>
  );
};

export default PicGallery;