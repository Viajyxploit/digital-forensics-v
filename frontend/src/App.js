import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomCursor from './components/CustomCursor';
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import LearningHub from './pages/LearningHub';
import ForensicsLab from './pages/ForensicsLab';
import ThreatMonitor from './pages/ThreatMonitor';
import Profile from './pages/Profile';
import CourseDetail from './pages/CourseDetail';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const ProtectedRoute = ({ children }) => {
    return token ? children : <Navigate to="/auth" />;
  };

  return (
    <div className="App">
      <CustomCursor />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth setToken={setToken} />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/learning" element={<ProtectedRoute><LearningHub /></ProtectedRoute>} />
          <Route path="/learning/:courseId" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
          <Route path="/forensics" element={<ProtectedRoute><ForensicsLab /></ProtectedRoute>} />
          <Route path="/threats" element={<ProtectedRoute><ThreatMonitor /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;