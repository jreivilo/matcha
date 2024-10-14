import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useRedirectIfLoggedOut = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');

    if (user === 'none') {
      localStorage.removeItem('user')
    }
    
    if (!user) { 
      window.dispatchEvent(new Event('authStateChanged'));
      navigate('/');
    }
  }, [navigate]);
};
