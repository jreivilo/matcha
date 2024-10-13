import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useRedirectIfLoggedOut = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (window.socket) {
      window.socket.disconnect();
    }
    
    if (!user || user === 'none') {
      if (user) { localStorage.removeItem('user')} 
      window.dispatchEvent(new Event('authStateChanged'));
      navigate('/');
    }
  }, [navigate]);
};
