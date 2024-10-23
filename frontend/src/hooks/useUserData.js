import { useQuery } from '@tanstack/react-query';
import { getUserInfo } from '@/api';
import { useAuthStatus } from './useAuthStatus';

export const useUserData = (profileUsername) => {
  const { isAuthenticated, user } = useAuthStatus()

  return useQuery({
    queryKey: ['userData', profileUsername, user?.username],
    queryFn: () => getUserInfo(profileUsername, user?.username),
    enabled: Boolean(profileUsername) && Boolean(user?.username) && !!isAuthenticated,
  });
};
