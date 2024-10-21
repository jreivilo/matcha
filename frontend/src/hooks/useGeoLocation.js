import { useState, useEffect } from 'react';

export const useGeoLocation = () => {
  const [coordinates, setCoordinates] = useState('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates(`${position.coords.latitude}, ${position.coords.longitude}`);
      },
      async (error) => {
        try {
          const response = await fetch("http://ip-api.com/json");
          const geoData = await response.json();
          setCoordinates(`${geoData.lat}, ${geoData.lon}`);
        } catch (ipError) {
          console.error('Error fetching geo info:', ipError);
        }
      }
    );
  }, []);

  return coordinates;
};