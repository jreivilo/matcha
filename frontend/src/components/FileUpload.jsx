import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadProfilePicture } from '@/api';

const encodeImageAsBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const FileUpload = ({ username, userinfo }) => {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState(null);
  const { displayUser } = userinfo ?? {};

  const picsMutation = useMutation({
    mutationFn: uploadProfilePicture,
    onMutate: async ({ username, file}) => {
      await queryClient.cancelQueries(['profile']);

      const newPics = [
        ...(displayUser?.pics ?? []),
        { image: file, imageName: `${username}_${(displayUser.pics ?? []).length + 1}.png` },
      ]

      queryClient.setQueryData(['profile'], old => ({
        ...userinfo,
        displayUser: {
          ...displayUser,
          pics: newPics,
        },
      }));
      return { userinfo };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profile', username]);
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['profile', username], userinfo);
      console.log("onError: ", error);
    },
  });

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    let imagestring = (await encodeImageAsBase64(selectedFile)).split(',')[1];
    if (selectedFile) {
      picsMutation.mutate({ username, file: imagestring });
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Input type="file" onChange={handleFileChange} />
      {selectedFile && (
        <Button onClick={handleUpload} disabled={picsMutation.isLoading}>
          {picsMutation.isLoading ? 'Uploading...' : 'Upload file'}
        </Button>
      )}
    </div>
  );
};

export default FileUpload;