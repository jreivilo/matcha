import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const uploadProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        body: formData,
        credentials: 'include',
        })
    return response.data;
};

const FileUpload = ({ onSuccess }) => {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState(null);

  const mutation = useMutation({
    mutationFn: uploadProfilePicture,
    onMutate: async (file) => {
      await queryClient.cancelQueries(['profile']);
      const previousProfile = queryClient.getQueryData(['profile']);
      
      queryClient.setQueryData(['profile'], old => ({
        ...old,
        displayUser: {
          ...old.displayUser,
          profilePicture: URL.createObjectURL(file),
        },
      }));

      return { previousProfile };
    },
    onError: (error, file, context) => {
      queryClient.setQueryData(['profile'], context.previousProfile);
      console.error("Upload error: ", error);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['profile']);
      if (onSuccess) onSuccess(data);
    },
  });

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (selectedFile) {
      mutation.mutate(selectedFile);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Input type="file" onChange={handleFileChange} />
      <Button onClick={handleUpload} disabled={mutation.isLoading}>
        {mutation.isLoading ? 'Uploading...' : 'Upload'}
      </Button>
    </div>
  );
};

export default FileUpload;