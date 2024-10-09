import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStatus } from '@/hooks/useAuthStatus';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { isAuthenticated, user } = useAuthStatus();

  const connectWebsocket = () => {
    if (!isAuthenticated || !user) return;

    const ws = new WebSocket('ws://localhost:3000/notification/ws');

    ws.onopen = () => {
      console.log('Connected to the WebSocket');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ERROR') {
        console.error('WebSocket error:', data.error);
      } else if (data.type === 'PONG') {
        console.log('Received PONG:', data.message);
      } else {
        console.log('Unknown message type:', JSON.stringify(data));
      }
    };

    ws.onerror = (event) => {
      console.error(event);
    };

    ws.onclose = () => {
      console.log('Disconnected from the WebSocket');
    };
    
    setSocket(ws);
  }

  useEffect(() => {
    connectWebsocket();

    return () => {
      if (socket) socket.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket, connectWebsocket}}>
      {children}
    </WebSocketContext.Provider>
  );
};

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a websocket context')
  }
  return context
}