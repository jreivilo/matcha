import React, { createContext, useContext, useEffect, useState } from 'react';
import { deleteProfilePicture, changeMainPicture, getUserPics, uploadProfilePicture } from '@/api';
import { useAuthStatus } from './AuthProvider';

const PicContext = createContext();

export const PicProvider = ({ children }) => {
    const [pics, setPics] = useState([]);
    const [error, setError] = useState(null);
    const [inProgress, setInProgress] = useState(false);
    const { user } = useAuthStatus();

    const fetchPics = async (username) => {
        try {
            setInProgress(true);
            const data = await getUserPics(username);
            setPics(data);
        } catch (err) {
            setError('Failed to load pictures');
        } finally {
            setInProgress(false);
        }
    };

    const deletePic = async (username, imageNumber) => {
        try {
            setInProgress(true);
            await deleteProfilePicture({ username, imageNumber });
        } catch (err) {
            setError('Failed to delete picture');
        } finally {
            fetchPics(username);
            setInProgress(false);
        }
    };

    const setMainPic = async (username,imageName) => {
        try {
            setInProgress(true);
            await changeMainPicture({ username, image: imageName });
        } catch (err) {
            setError('Failed to update main picture');
        } finally {
            fetchPics(username);
            setInProgress(false);
        }
    };

    const uploadPic = async (file, username) => {
        try {
            setInProgress(true);
            await uploadProfilePicture({ file, username });
        } catch (err) {
            setError('Failed to upload picture');
        } finally {
            fetchPics(user?.username);
            setInProgress(false);
        }
      };
    

    useEffect(() => {
        fetchPics(user?.username);
    }, [user?.username]);

    return (
        <PicContext.Provider
          value={{
            pics,
            error,
            inProgress,
            fetchPics,
            deletePic,
            setMainPic,
            uploadPic,
          }}
        >
          {children}
          {inProgress && (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
              <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-gray-600" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          )}
        </PicContext.Provider>
      );
    };

export const usePics = () => useContext(PicContext);
