import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/api';

const API_URL = 'http://localhost:3000';

export const useAuthStatus = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ['authStatus'],
    queryFn: () => fetcher(`${API_URL}/user/whoami`, {}, 'GET'),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2
  });

  const isAuthenticated = data?.success === true;
  const user = isAuthenticated ? { username: data.username, id: data.id } : null;

  return { isAuthenticated, user, loading: isLoading, error };
};
