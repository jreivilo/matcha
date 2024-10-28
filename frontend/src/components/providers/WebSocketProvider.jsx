import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuthStatus } from '@/hooks/useAuthStatus';

const WebSocketContext = createContext(null);

const HEARTBEAT_INTERVAL = 30000;
const RECONNECT_DELAY = 5000;
const MAX_RECONNECT_ATTEMPTS = 5;

const WebSocketProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuthStatus();
  const socketRef = useRef(null);
  const heartbeatInterval = useRef(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const connectWebSocket = () => {
    if (!isAuthenticated || socketRef.current) return;

    const ws = new WebSocket('ws://localhost:3000/notification/ws');

    ws.onopen = () => {
      console.log('Connected to the WebSocket');
      startHeartbeat(ws);
      setReconnectAttempts(0);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ERROR') {
        console.error('WebSocket error:', data.error);
        ws.close();
      } else if (data.type === 'PONG') {
        console.log('Received PONG:', data.message);
      } else {
        console.log('Received message:', data);
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
    };

    ws.onclose = () => {
      console.log('Disconnected from the WebSocket');
      stopHeartbeat();
      socketRef.current = null;
      if (isAuthenticated && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => {
          setReconnectAttempts((prev) => prev + 1);
          connectWebSocket();
        }, RECONNECT_DELAY);
      }
    };

    socketRef.current = ws;
  };

  const startHeartbeat = (ws) => {
    heartbeatInterval.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
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
      connectWebSocket();
    } else if (socketRef.current) {
      socketRef.current.close();
      stopHeartbeat();
      socketRef.current = null;
    }

    return () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      stopHeartbeat();
    };
  }, [isAuthenticated, user]);

  return (
    <WebSocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </WebSocketContext.Provider>
  );
};

function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketContext');
  }
  return context;
}

export { WebSocketProvider, useWebSocket };