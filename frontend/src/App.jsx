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
import { UserProvider } from '@/components/providers/UserProvider';
import { WebSocketProvider } from './components/providers/WebSocketProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10,
    },
  },
});

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/auth/*"
          element={
            <UserProvider>
              <AuthRoutes />
            </UserProvider>
        }/>
        <Route
          path="/member/*"
          element={
            <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools initialIsOpen={false} />
            <UserProvider>
            <WebSocketProvider>
                <Header/>
                <MemberRoutes />
            </WebSocketProvider>
            </UserProvider>
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
