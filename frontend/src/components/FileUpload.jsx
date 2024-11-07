
import React, { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { useDropzone } from 'react-dropzone'
import { usePics } from '@/components/PicProvider';

const encodeImageAsBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

const FileUpload = ({ username }) => {
  const { uploadPic, inProgress, error: picError } = usePics();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // const picsMutation = useMutation({
  //   mutationFn: uploadProfilePicture,
  //   onError: (error, variables, context) => {
  //     queryClient.setQueryData(['pics', username], context.previousPics);
  //     console.error('Error uploading picture:', error);
  //     setSelectedFile(null);
  //   },
  //   onSettled: async () => {
  //     setSelectedFile(null);
  //     queryClient.invalidateQueries({ queryKey: ['pics', username]});
  //   },
  //   retry: 4,
  // });

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
      uploadPic(selectedFile, username)
      // picsMutation.mutate({ username, file: selectedFile });
    } catch (error) {
      console.error("File encoding error:", error);
    } finally {
      setUploading(false);
    }
  }, [selectedFile, username, uploadPic]);

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
          disabled={uploading || inProgress}
        >
          {uploading ? 'Uploading...' : 'Upload file'}
        </Button>
      )}
      {error && (
        <p className="text-red-500">Upload failed. Please try again.</p>
      )}
    </div>
  );
};

export default React.memo(FileUpload);