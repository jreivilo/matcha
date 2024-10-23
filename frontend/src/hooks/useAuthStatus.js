import { useState, useEffect } from 'react';
import { fetcher } from '@/api';

const API_URL = 'http://localhost:3000';

export const useAuthStatus = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetcher(`${API_URL}/user/whoami`, {}, 'GET');
        if (res.success === 'true') {
          setUser({
            username: res.username,
            id: 5
          });
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();

    window.addEventListener('authStateChanged', checkAuthStatus);

    return () => {
      window.removeEventListener('authStateChanged', checkAuthStatus);
    };
  }, []);

  return { isAuthenticated, user, loading };
};
