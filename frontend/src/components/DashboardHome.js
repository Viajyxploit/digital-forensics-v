import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Target, Zap } from 'lucide-react';

const DashboardHome = ({ stats }) => {
  const statCards = [
    { icon: BookOpen, label: 'Modules Completed', value: stats?.completed_modules || 0, color: 'cyan-core' },
    { icon: Target, label: 'Files Analyzed', value: stats?.uploaded_files || 0, color: 'electric-violet' },
    { icon: Zap, label: 'Active Threats', value: stats?.active_threats || 0, color: 'neon-red' },
    { icon: TrendingUp, label: 'Learning Streak', value: `${stats?.learning_streak || 0} days`, color: 'acid-lime' }
  ];

  return (
    <div className="space-y-8" data-testid="dashboard-home">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>COMMAND CENTER</h1>
        <p className="text-gray-400" style={{ fontFamily: 'Outfit, sans-serif' }}>Your digital forensics operations hub</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              className="glass-panel p-6 hover:border-cyan-core/50 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              data-testid={`stat-card-${idx}`}
            >
              <Icon className={`w-10 h-10 text-${stat.color} mb-4`} />
              <h3 className="text-3xl font-bold mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{stat.value}</h3>
              <p className="text-gray-400 text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="glass-panel p-8"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>QUICK ACTIONS</h2>
          <div className="space-y-4">
            {[
              { label: 'Start Learning Module', color: 'electric-violet' },
              { label: 'Analyze New File', color: 'acid-lime' },
              { label: 'Review Threats', color: 'neon-red' }
            ].map((action, idx) => (
              <motion.button
                key={idx}
                className={`w-full py-3 border border-${action.color}/30 text-${action.color} font-semibold hover:bg-${action.color}/10 transition-all`}
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
                data-testid={`quick-action-${idx}`}
              >
                {action.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="glass-panel p-8"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>RECENT ACTIVITY</h2>
          <div className="space-y-4">
            {[
              { action: 'Completed: Evidence Collection Module', time: '2 hours ago', color: 'cyan-core' },
              { action: 'Analyzed: suspicious_file.exe', time: '5 hours ago', color: 'acid-lime' },
              { action: 'Alert: New threat detected', time: '1 day ago', color: 'neon-red' }
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3" data-testid={`activity-${idx}`}>
                <div className={`w-2 h-2 rounded-full bg-${activity.color} mt-2`} />
                <div>
                  <p className="text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{activity.action}</p>
                  <p className="text-xs text-gray-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardHome;