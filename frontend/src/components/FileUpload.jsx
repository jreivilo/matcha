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

const FileUpload = ({ username, setMain }) => {
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
      setSelectedFile(null);
    },
    onSuccess: (data) => {
      if (data.imageNumber === 1) {
        setMain(data.imageName);
      }
    },
    onSettled: () => {
      setSelectedFile(null);
    },
    enabled: Boolean(username),
    retry: 4
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
      img.onload = async () => {
        if (img.width < 12000 && img.height < 12000) {
          const imageString = await encodeImageAsBase64(file);
          setSelectedFile(imageString);
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
      // const imageString = await encodeImageAsBase64(selectedFile);
      picsMutation.mutate({ username, file: selectedFile });
    } catch (error) {
      console.error("File encoding error:", error);
    } finally {
      setUploading(false);
    }
  }, [selectedFile, username, picsMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {'image/*' : ['.png']},
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