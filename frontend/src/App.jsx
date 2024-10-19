import './App.css'
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage'
import Login from './pages/Login';
import Dashboard from './pages/member/Dashboard';
import FillInfo from './pages/member/FillInfo';
import ProfilePage from './pages/member/Profile';
import Header from '@/components/Header';
import { UserProvider } from '@/components/providers/UserProvider';
import { WebSocketProvider } from './components/providers/WebSocketProvider';

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
            <UserProvider>
              <WebSocketProvider>
                <Header/>
                <MemberRoutes />
              </WebSocketProvider>
            </UserProvider>
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
      <Route path="fill-profile" element={<FillInfo />} />
    </Routes>
  )
}

function MemberRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="profile" element={<ProfilePage />} />
    </Routes>
  )
}

export default App;
