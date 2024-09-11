import './App.css'
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage'
import Login from './pages/Login';
import Dashboard from './pages/member/Dashboard';
import FillInfo from './pages/FillInfo';
import ProfilePage from './pages/member/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/fill-profile" element={<FillInfo />} />
        <Route path="/member/dashboard" element={<Dashboard />} />
        <Route path="/member/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
