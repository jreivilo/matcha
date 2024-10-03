import { useState, useEffect } from 'react';

export const useGeoLocation = (isInitialSetup) => {
  const [coordinates, setCoordinates] = useState('');
  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(false);
  
  useEffect(() => {
    setIsLoadingCoordinates(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates(`${position.coords.latitude}, ${position.coords.longitude}`);
          setIsLoadingCoordinates(false);
        },
        async (error) => {
          console.log('User denied geolocation access, but we will find it anyway:', error);
          try {
            const response = await fetch("http://ip-api.com/json");
            const geoData = await response.json();
            setCoordinates(`${geoData.lat}, ${geoData.lon}`);
          } catch (ipError) {
            console.error('Error fetching geo info:', ipError);
          }
          setIsLoadingCoordinates(false);
        }
      );
  }, [isInitialSetup]);

  return { coordinates, isLoadingCoordinates, setCoordinates };
};