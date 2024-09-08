import { useQuery } from '@tanstack/react-query';
import { getUserInfo } from '@/api';

export const useUserData = (profileUsername, viewerUsername) => {
  return useQuery({
    queryKey: ['userData', profileUsername, viewerUsername],
    queryFn: () => getUserInfo(profileUsername, viewerUsername),
    enabled: Boolean(profileUsername) && Boolean(viewerUsername),
  });
};
