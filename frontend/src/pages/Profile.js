import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Award, TrendingUp, Shield } from 'lucide-react';
import axios from 'axios';
import PlatformFooter from '../components/PlatformFooter';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch profile', error);
    }
  };

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

  if (!user) {
    return <div className="min-h-screen bg-deep-obsidian flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-deep-obsidian text-white p-8 pb-32" data-testid="profile-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>PROFILE</h1>
        <p className="text-gray-400" style={{ fontFamily: 'Outfit, sans-serif' }}>Manage your account and view achievements</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          className="glass-panel p-8 text-center"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-core to-electric-violet flex items-center justify-center">
            <User className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{user.name}</h2>
          <p className="text-gray-400 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>{user.email}</p>
          <div className="px-4 py-2 bg-cyan-core/20 text-cyan-core border border-cyan-core/30 inline-block" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {user.role.toUpperCase()}
          </div>
        </motion.div>

        <div className="lg:col-span-2 space-y-6">
          <motion.div
            className="glass-panel p-8"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>STATISTICS</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Award, label: 'Modules', value: stats?.completed_modules || 0, color: 'cyan-core' },
                { icon: Shield, label: 'Files', value: stats?.uploaded_files || 0, color: 'acid-lime' },
                { icon: TrendingUp, label: 'Streak', value: `${stats?.learning_streak || 0}d`, color: 'laser-yellow' },
                { icon: Award, label: 'Rank', value: 'Expert', color: 'electric-violet' }
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={idx}
                    className="glass-panel p-4 text-center"
                    whileHover={{ y: -5 }}
                    data-testid={`profile-stat-${idx}`}
                  >
                    <Icon className={`w-8 h-8 text-${stat.color} mx-auto mb-2`} />
                    <p className="text-2xl font-bold mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{stat.value}</p>
                    <p className="text-xs text-gray-400" style={{ fontFamily: 'Outfit, sans-serif' }}>{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            className="glass-panel p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>ACHIEVEMENTS</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { title: 'First Module', desc: 'Complete your first learning module', color: 'cyan-core' },
                { title: 'File Analyst', desc: 'Analyze 10 files in Forensics Lab', color: 'acid-lime' },
                { title: 'Threat Hunter', desc: 'Investigate 5 security threats', color: 'neon-red' },
                { title: 'Quick Learner', desc: 'Complete a course in 1 week', color: 'electric-violet' },
                { title: 'Dedicated', desc: 'Maintain a 7-day learning streak', color: 'laser-yellow' },
                { title: 'Expert', desc: 'Complete all advanced courses', color: 'bright-blue' }
              ].map((achievement, idx) => (
                <motion.div
                  key={idx}
                  className={`glass-panel p-4 border-l-4 border-${achievement.color}`}
                  whileHover={{ scale: 1.05 }}
                  data-testid={`achievement-${idx}`}
                >
                  <Award className={`w-8 h-8 text-${achievement.color} mb-2`} />
                  <h3 className="font-bold mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{achievement.title}</h3>
                  <p className="text-xs text-gray-400" style={{ fontFamily: 'Outfit, sans-serif' }}>{achievement.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      
      <PlatformFooter />
      </div>
    </div>
  );
};

export default Profile;