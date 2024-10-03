import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useRedirectIfLoggedOut = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    
    if (!user || user === 'none') {
      navigate('/');
    }
  }, [navigate]);
};
