import { logout } from '@/lib/logout';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const AuthContext = createContext();

const API_URL = 'http://localhost:3000';

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const checkAuthStatus = async () => {
    const options = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    };
    try {
      const response = await fetch(API_URL + '/user/whoami', options);
      const data = await response?.json();


      if (response.ok && data.success) {
        setIsAuthenticated(true);
        setUser(data);
      } else {
        // if (isAuthenticated) {
        //   logout(queryClient);
        // }
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      // if (isAuthenticated) {
      //   logout(queryClient);
      // }
      console.log("You are not authenticated");
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    window.addEventListener('authStateChanged', checkAuthStatus);
    return () => window.removeEventListener('authStateChanged', checkAuthStatus);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthStatus = () => {
  return useContext(AuthContext);
};
