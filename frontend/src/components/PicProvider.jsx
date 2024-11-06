import React, { createContext, useContext, useState } from 'react';
import { deleteProfilePicture, changeMainPicture, getUserPics } from '@/api';

const PicContext = createContext();

export const PicProvider = ({ children }) => {
const [pics, setPics] = useState([]);
const [error, setError] = useState(null);

const fetchPics = async (username) => {
    try {
        const data = await getUserPics(username);
        setPics(data);
    } catch (err) {
        setError('Failed to load pictures');
    }
};

const deletePic = async (imageName) => {
    try {
        await deleteProfilePicture({ imageName });
        setPics((prevPics) => prevPics.filter(pic => pic.imageName !== imageName));
    } catch (err) {
        setError('Failed to delete picture');
    }
};

const setMainPic = async (imageName) => {
    try {
        await changeMainPicture({ imageName });
        setPics((prevPics) =>
            prevPics.map(pic =>
            pic.imageName === imageName ? { ...pic, isMain: true } : { ...pic, isMain: false }
        )
    );
    } catch (err) {
        setError('Failed to update main picture');
    }
};

return (
    <PicContext.Provider value={{ pics, error, fetchPics, deletePic, setMainPic }}>
        {children}
    </PicContext.Provider>
);
};

export const usePics = () => useContext(PicContext);
