import React, { createContext, useContext, useEffect, useState, useRef} from 'react';
import { useAuthStatus } from '@/hooks/useAuthStatus';

const WebSocketContext = createContext(null);

const HEARTBEAT_INTERVAL = 30000;
const RECONNECT_DELAY = 5000;
const MAX_RECONNECT_ATTEMPTS = 5;

const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { isAuthenticated, user } = useAuthStatus();
  const heartbeatInterval = useRef(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const connectWebsocket = () => {
    if (!isAuthenticated || !user) return;

    const ws = new WebSocket('ws://localhost:3000/notification/ws');

    ws.onopen = () => {
      console.log('Connected to the WebSocket');
      startHeartbeat(ws);
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
      console.log('Disconnected from the WebSocket')
      stopHeartbeat();
      if (isAuthenticated && user && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          connectWebsocket();
        }, RECONNECT_DELAY);
      }
    };
    
    setSocket(ws);
  }

  const startHeartbeat = (ws) => {
    heartbeatInterval.current = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'PING' }));
      }
    }, HEARTBEAT_INTERVAL);
  };

  const stopHeartbeat = () => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      if (socket) {
        socket.close();
      }
      setReconnectAttempts(0);
      connectWebsocket();
    } else if (socket) {
      socket.close();
      stopHeartbeat();
      setSocket(null);
    }
  
    return () => {
      if (socket) socket.close();
      stopHeartbeat();
    };
  }, [isAuthenticated, user]);

  return (
    <WebSocketContext.Provider value={{ socket, connectWebsocket}}>
      {children}
    </WebSocketContext.Provider>
  );
};

function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a websocket context')
  }
  return context
}

export { WebSocketProvider, useWebSocket };