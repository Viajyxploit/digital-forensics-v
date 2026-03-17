import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Activity, Shield, TrendingUp } from 'lucide-react';
import axios from 'axios';
import PlatformFooter from '../components/PlatformFooter';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ThreatMonitor = () => {
  const [threats, setThreats] = useState([]);

  useEffect(() => {
    fetchThreats();
  }, []);

  const fetchThreats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/threats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setThreats(response.data);
    } catch (error) {
      console.error('Failed to fetch threats', error);
    }
  };

  const severityColors = {
    critical: 'neon-red',
    high: 'solar-orange',
    medium: 'laser-yellow',
    low: 'acid-lime'
  };

  const severityIcons = {
    critical: AlertTriangle,
    high: AlertTriangle,
    medium: Activity,
    low: Shield
  };

  return (
    <div className="min-h-screen bg-deep-obsidian text-white p-8 pb-32" data-testid="threat-monitor-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>THREAT MONITOR</h1>
        <p className="text-gray-400" style={{ fontFamily: 'Outfit, sans-serif' }}>Real-time security threat detection and analysis</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Threats', value: threats.length, color: 'cyan-core', icon: Activity },
          { label: 'Critical', value: threats.filter(t => t.severity === 'critical').length, color: 'neon-red', icon: AlertTriangle },
          { label: 'Active', value: threats.filter(t => t.status === 'active').length, color: 'solar-orange', icon: TrendingUp },
          { label: 'Resolved', value: 0, color: 'acid-lime', icon: Shield }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              className="glass-panel p-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              data-testid={`threat-stat-${idx}`}
            >
              <Icon className={`w-8 h-8 text-${stat.color} mb-3`} />
              <p className="text-3xl font-bold mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{stat.value}</p>
              <p className="text-sm text-gray-400" style={{ fontFamily: 'Outfit, sans-serif' }}>{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>ACTIVE THREATS</h2>
        
        {threats.map((threat, idx) => {
          const color = severityColors[threat.severity] || 'cyan-core';
          const Icon = severityIcons[threat.severity] || Activity;
          
          return (
            <motion.div
              key={threat.id}
              className={`glass-panel p-6 border-l-4 border-${color} hover:border-cyan-core/50 transition-all duration-300`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              whileHover={{ x: 5 }}
              data-testid={`threat-card-${idx}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <Icon className={`w-6 h-6 text-${color} mt-1 flex-shrink-0`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{threat.title}</h3>
                      <span className={`px-3 py-1 text-xs font-bold bg-${color}/20 text-${color} border border-${color}/30`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {threat.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>{threat.description}</p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {new Date(threat.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <motion.button
                  className="px-4 py-2 border border-acid-lime/30 text-acid-lime text-sm font-semibold hover:bg-acid-lime/10 transition-all"
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  data-testid={`threat-investigate-btn-${idx}`}
                >
                  INVESTIGATE
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <PlatformFooter />
    </div>
  );
};

export default ThreatMonitor;