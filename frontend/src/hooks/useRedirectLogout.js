import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '@/components/providers/WebSocketProvider';

export const useRedirectIfLoggedOut = () => {
  const navigate = useNavigate();
  const { socket } = useWebSocket();

  useEffect(() => {
    const user = localStorage.getItem('user');
    
    if (!user || user === 'none') {
      window.dispatchEvent(new Event('authStateChanged'));
      // if (socket) socket.close()
      navigate('/');
    }
  }, [navigate]);
};
