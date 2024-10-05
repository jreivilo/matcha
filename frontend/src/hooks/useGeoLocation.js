import { useState, useEffect } from 'react';

export const useGeoLocation = () => { 
  let coordinates = '';
  navigator.geolocation.getCurrentPosition(
    (position) => {
      coordinates = `${position.coords.latitude}, ${position.coords.longitude}`;
    },
    async (error) => {
      console.log('User denied geolocation access, but we will find it anyway:', error);
      try {
        const response = await fetch("http://ip-api.com/json");
        const geoData = await response.json();
        coordinates = `${geoData.lat}, ${geoData.lon}`;
        console.log(coordinates);
      } catch (ipError) {
        console.error('Error fetching geo info:', ipError);
      }
    }
  );
  return coordinates;
};