import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const calculateCommonInterests = (userInterests, matchInterests) => {
  if (!userInterests || !matchInterests) return 0;
  const userInterestSet = new Set(userInterests);
  return matchInterests.filter(interest => userInterestSet.has(interest)).length;
};

export const calculateDistance = (coords1, coords2) => {
  // Convert coords strings to arrays of numbers
  const [lat1, lon1] = coords1.split(',').map(Number);
  const [lat2, lon2] = coords2.split(',').map(Number);
  
  // Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const getPfpUrl = (picture_path, pics) => {
  const imageNum = picture_path.split('_')[1].split('.')[0];
  const image = pics[imageNum]
  return `data:image/jpeg;base64,${image.image}`
}
