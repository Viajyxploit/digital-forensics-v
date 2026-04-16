import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Shield, Activity, Bug, AlertTriangle, ChevronRight } from 'lucide-react';
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

      console.log("API RESPONSE:", response.data);

      // ✅ SAFE DATA HANDLE
      if (Array.isArray(response.data)) {
        setCourses(response.data);
      } else if (Array.isArray(response.data.courses)) {
        setCourses(response.data.courses);
      } else {
        setCourses([]);
      }

    } catch (error) {
      console.error('Failed to fetch courses', error);
      setCourses([]); // prevent crash
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
    <div className="min-h-screen bg-deep-obsidian text-white p-8 pb-32">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-5xl font-bold mb-2">LEARNING HUB</h1>
        <p className="text-gray-400">Master digital forensics and cybersecurity</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ✅ SAFE RENDER */}
        {Array.isArray(courses) && courses.length > 0 ? (
          courses.map((course, idx) => {

            const Icon = iconMap[course?.icon] || Shield;
            const color = colorMap[course?.color] || 'cyan-core';

            return (
              <motion.div
                key={course?.id || idx}
                className="glass-panel overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >

                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course?.image_url || ''}
                    alt={course?.title || ''}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6">

                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 text-xs bg-${color}/20 text-${color}`}>
                      {course?.level || 'BEGINNER'}
                    </span>

                    <span className="flex items-center gap-1 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      {course?.duration || 'N/A'}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold mb-3">
                    {course?.title || 'Untitled'}
                  </h2>

                  <p className="text-gray-400 mb-4">
                    {course?.description || 'No description'}
                  </p>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{course?.progress || 0}%</span>
                    </div>

                    <div className="h-2 bg-gray-700 rounded-full">
                      <div
                        className={`h-full bg-${color}`}
                        style={{ width: `${course?.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/learning/${course?.id}`)}
                    className={`w-full py-3 border border-${color}/30 text-${color}`}
                  >
                    {course?.progress > 0 ? 'CONTINUE' : 'START COURSE'}
                    <ChevronRight className="inline ml-2 w-4 h-4" />
                  </button>

                </div>
              </motion.div>
            );
          })
        ) : (
          <p className="text-gray-400">No courses available</p>
        )}

      </div>

      <PlatformFooter />
    </div>
  );
};

export default LearningHub;
