import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, TrendingUp, Shield, Activity, Bug, AlertTriangle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PlatformFooter from '../components/PlatformFooter';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LearningHub = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses', error);
    }
  };

  const iconMap = {
    Shield: Shield,
    Activity: Activity,
    Bug: Bug,
    AlertTriangle: AlertTriangle
  };

  const colorMap = {
    'cyan-core': 'cyan-core',
    'neon-red': 'neon-red',
    'electric-violet': 'electric-violet',
    'solar-orange': 'solar-orange'
  };

  return (
    <div className="min-h-screen bg-deep-obsidian text-white p-8 pb-32" data-testid="learning-hub-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>LEARNING HUB</h1>
        <p className="text-gray-400" style={{ fontFamily: 'Outfit, sans-serif' }}>Master digital forensics and cybersecurity</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {courses.map((course, idx) => {
          const Icon = iconMap[course.icon] || Shield;
          const color = colorMap[course.color] || 'cyan-core';
          
          return (
            <motion.div
              key={course.id}
              className="glass-panel overflow-hidden group hover:border-cyan-core/50 transition-all duration-500"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              data-testid={`course-card-${idx}`}
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={course.image_url} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-obsidian to-transparent" />
                <div className="absolute top-4 right-4">
                  <Icon className={`w-12 h-12 text-${color}`} />
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 text-xs font-bold bg-${color}/20 text-${color} border border-${color}/30`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {course.level.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </span>
                </div>

                <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{course.title}</h2>
                <p className="text-gray-400 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>{course.description}</p>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-${color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                    />
                  </div>
                </div>

                <motion.button
                  onClick={() => navigate(`/learning/${course.id}`)}
                  className={`w-full py-3 border border-${color}/30 text-${color} font-semibold hover:bg-${color}/10 transition-all flex items-center justify-center gap-2`}
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  data-testid={`course-start-btn-${idx}`}
                >
                  {course.progress > 0 ? 'CONTINUE' : 'START COURSE'}
                  <ChevronRight className="w-5 h-5" />
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

export default LearningHub;