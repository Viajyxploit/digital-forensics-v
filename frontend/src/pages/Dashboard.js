import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, BookOpen, Shield, Activity, User, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import DashboardHome from '../components/DashboardHome';
import AIAssistant from '../components/AIAssistant';
import PlatformFooter from '../components/PlatformFooter';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', color: 'cyan-core' },
    { icon: BookOpen, label: 'Learning', path: '/learning', color: 'electric-violet' },
    { icon: Shield, label: 'Forensics', path: '/forensics', color: 'acid-lime' },
    { icon: Activity, label: 'Threats', path: '/threats', color: 'neon-red' },
    { icon: User, label: 'Profile', path: '/profile', color: 'bright-blue' }
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-deep-obsidian text-white relative" data-testid="dashboard-page">
      <div className="p-8">
        <DashboardHome stats={stats} />
      </div>

      <motion.div
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 glass-panel px-6 py-4 flex items-center gap-6 z-40"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        data-testid="dock-navigation"
      >
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <motion.button
              key={idx}
              onClick={() => navigate(item.path)}
              className={`p-3 rounded-lg transition-all ${
                isActive ? `bg-${item.color}/20 text-${item.color}` : 'hover:bg-white/5'
              }`}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              data-testid={`nav-${item.label.toLowerCase()}-btn`}
            >
              <Icon className={`w-6 h-6 ${isActive ? `text-${item.color}` : 'text-white'}`} />
            </motion.button>
          );
        })}
        
        <div className="w-px h-8 bg-white/20 mx-2" />
        
        <motion.button
          onClick={handleLogout}
          className="p-3 rounded-lg hover:bg-neon-red/20 transition-all"
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.95 }}
          data-testid="nav-logout-btn"
        >
          <LogOut className="w-6 h-6 text-neon-red" />
        </motion.button>
      </motion.div>

      <motion.button
        onClick={() => setShowAI(!showAI)}
        className="fixed bottom-8 right-8 px-6 py-3 bg-electric-violet text-white font-bold clip-path-button hover:bg-cyan-core transition-colors duration-300"
        style={{ fontFamily: 'Rajdhani, sans-serif', zIndex: 99999 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-testid="ai-assistant-toggle-btn"
      >
        AI ASSISTANT
      </motion.button>

      {showAI && <AIAssistant onClose={() => setShowAI(false)} />}

      <PlatformFooter />
    </div>
  );
};

export default Dashboard;