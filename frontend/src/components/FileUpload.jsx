import React, { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadProfilePicture } from '@/api';

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
  const [isEditMode, setIsEditMode] = useState(false);

  

  const picsMutation = useMutation({
    mutationFn: uploadProfilePicture,
    onMutate: async ({ username, file }) => {
      await queryClient.cancelQueries(['userData', username, username]);
      const previousUserInfo = queryClient.getQueryData(['userData', username, username]);
      if (previousUserInfo?.displayUser?.pics?.length === 5) {
        throw new Error("You can only upload up to 5 pictures.");
      }
      queryClient.setQueryData(['userData', username, username], old => ({
        ...old,
        displayUser: {
          ...old.displayUser,
          pics: [...(old.displayUser.pics || []), { image: file, imageName: selectedFile.name }],
        },
      }));
      return { previousUserInfo };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['userData', variables.username, variables.username], context.previousUserInfo);
      console.error("Upload error:", err);
    },
    onSettled: (data, error, { username }) => {
      queryClient.invalidateQueries(['userData', username, username]);
      setSelectedFile(null);
    },
  });

  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    } else {
      console.error("Invalid file type. Please select an image.");
      setSelectedFile(null);
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFile) {
      try {
        const imageString = await encodeImageAsBase64(selectedFile);
        picsMutation.mutate({ username, file: imageString });
      } catch (error) {
        console.error("File encoding error:", error);
      }
    }
  }, [selectedFile, username, picsMutation]);



  return (
    <div className="flex flex-col items-center space-y-4">
      <Input 
        type="file" 
        onChange={handleFileChange} 
        accept="image/png" 
        disabled={picsMutation.isLoading}
      />
      {selectedFile && (
        <Button 
          onClick={handleUpload} 
          disabled={picsMutation.isLoading}
        >
          {picsMutation.isLoading ? 'Uploading...' : 'Upload file'}
        </Button>
      )}
      {picsMutation.isError && (
        <p className="text-red-500">Upload failed. Please try again.</p>
      )}
    </div>
  );
};

export default React.memo(FileUpload);