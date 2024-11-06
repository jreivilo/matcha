import { useQuery } from '@tanstack/react-query';
import { getUserInfo } from '@/api';
import { useAuthStatus } from '@/components/AuthProvider';

export const useUserData = (profileUsername) => {
  const { isAuthenticated, user } = useAuthStatus()

  return useQuery({
    queryKey: ['userData', profileUsername],
    queryFn: () => getUserInfo(profileUsername, user?.username),
    enabled: Boolean(profileUsername) && Boolean(user?.username) && !!isAuthenticated,
    staleTime: 60 * 1000,
    delay: 800,
    cachingTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnFocus: false,
  });
};
