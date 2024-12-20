import './App.css'
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage'
import Login from './pages/Login';
import Dashboard from './pages/member/Dashboard';
import FillInfo from './pages/member/FillInfo';
import ProfilePage from './pages/member/Profile';
import Header from '@/components/Header';
import Explore from './pages/member/Explore';
import ChatPanel from './pages/member/Chat';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useAuthStatus } from '@/hooks/useAuthStatus'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10,
    },
  },
});

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStatus();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
Profile
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/auth/*"
          element={
            <AuthRoutes />
        }/>
        <Route
          path="/member/*"
          element={
            <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools initialIsOpen={false} />
            <ProtectedRoute>
                <Header/>
                <MemberRoutes />
            </ProtectedRoute>
            </QueryClientProvider>
          }/>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function AuthRoutes() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
    </Routes>
  )
}

function MemberRoutes() {
  return (
    <Routes>
        <Route path="fill-profile" element={<FillInfo />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="explore" element={<Explore />} />
        <Route path="chat" element={<ChatPanel/>} />
    </Routes>
  )
}

export default App;
