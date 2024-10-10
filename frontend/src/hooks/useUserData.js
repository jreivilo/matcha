import { useQuery } from '@tanstack/react-query';
import { getUserInfo } from '@/api';
import { useAuthStatus } from './useAuthStatus';

export const useUserData = (profileUsername, viewerUsername) => {
  const { isAuthenticated } = useAuthStatus()

  return useQuery({
    queryKey: ['userData', profileUsername, viewerUsername],
    queryFn: () => getUserInfo(profileUsername, viewerUsername),
    enabled: Boolean(profileUsername) && Boolean(viewerUsername) && !!isAuthenticated,
  });
};
