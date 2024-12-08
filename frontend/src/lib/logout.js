import { fetcher } from '@/api';
const API_URL = '/api';

export const logout = async (user, queryClient) => {
  try {
    const response = await fetcher('user/logout', {}, 'POST');
    if (!response) {
      throw new Error('Logout failed');
    }
    document.cookie = "jwt=; Max-Age=0; path=/;";
    queryClient.clear()
    window.location.href = "/";
  } catch (error) {
    console.error('Logout failed:', error);
  }
};