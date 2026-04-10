import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Auth = ({ setToken }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      console.log("API URL:", `${API}${endpoint}`);

      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, name: formData.name };

      const response = await axios.post(`${API}${endpoint}`, payload);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setToken(response.data.token);
      
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep-obsidian flex items-center justify-center px-6 relative overflow-hidden" data-testid="auth-page">
      <div className="absolute inset-0 hero-glow" />
      
      <motion.div
        className="glass-panel p-10 max-w-md w-full relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <Shield className="w-10 h-10 text-cyan-core" />
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>CYBERSENTINELS</h1>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-8" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          {isLogin ? 'ACCESS PLATFORM' : 'CREATE ACCOUNT'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-core" />
                <motion.input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-surface/50 border border-white/10 focus:border-cyan-core/50 focus:ring-1 focus:ring-cyan-core/50 outline-none transition-all"
                  placeholder="Enter your name"
                  required={!isLogin}
                  whileFocus={{ scale: 1.01 }}
                  data-testid="signup-name-input"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                />
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-core" />
              <motion.input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-surface/50 border border-white/10 focus:border-cyan-core/50 focus:ring-1 focus:ring-cyan-core/50 outline-none transition-all"
                placeholder="your@email.com"
                required
                whileFocus={{ scale: 1.01 }}
                data-testid="auth-email-input"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-core" />
              <motion.input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-surface/50 border border-white/10 focus:border-cyan-core/50 focus:ring-1 focus:ring-cyan-core/50 outline-none transition-all"
                placeholder="••••••••"
                required
                whileFocus={{ scale: 1.01 }}
                data-testid="auth-password-input"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              />
            </div>
          </div>

          <motion.button
            type="submit"
            className="w-full py-3 bg-cyan-core text-black font-bold clip-path-button hover:bg-white transition-colors duration-300 flex items-center justify-center gap-2"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            data-testid="auth-submit-btn"
          >
            {loading ? 'PROCESSING...' : (isLogin ? 'LOGIN' : 'SIGN UP')}
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-deep-obsidian text-gray-400" style={{ fontFamily: 'Outfit, sans-serif' }}>OR</span>
            </div>
          </div>

          <motion.button
            onClick={() => toast.info('Google OAuth integration ready - add your credentials')}
            className="mt-4 w-full py-3 border border-white/20 text-white font-semibold hover:border-cyan-core hover:bg-white/5 transition-all flex items-center justify-center gap-3"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid="google-oauth-btn"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            CONTINUE WITH GOOGLE
          </motion.button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-cyan-core hover:text-white transition-colors"
            style={{ fontFamily: 'Outfit, sans-serif' }}
            data-testid="auth-toggle-btn"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
