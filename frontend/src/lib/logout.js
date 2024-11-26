import { fetcher } from '@/api';
const API_URL = '/api';

export const logout = async (user, queryClient) => {
  try {
    const response = await fetcher(`http://localhost:3000/user/logout`, {}, 'GET');
    if (!response) {
      throw new Error('Logout failed');
    }
    document.cookie = "jwt=; Max-Age=0; path=/;";
    queryClient.clear()
    // window.dispatchEvent(new Event('authStateChanged'));
    window.location.href = 'http://localhost:4000/';
    // window.location.reload();
  } catch (error) {
    console.error('Logout failed:', error);
  }
};