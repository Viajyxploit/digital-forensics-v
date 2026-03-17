import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle, Play, Clock, Download, Award, Beaker } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import Quiz from '../components/Quiz';
import LabEnvironment from '../components/labs/LabEnvironment';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showLabs, setShowLabs] = useState(false);
  const [courseCompleted, setCourseCompleted] = useState(false);

  useEffect(() => {
    fetchModules();
  }, [courseId]);

  const fetchModules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/courses/${courseId}/modules`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModules(response.data);
      if (response.data.length > 0) {
        setSelectedModule(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch modules', error);
    }
  };


  const downloadCertificate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/certificate/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${courseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Certificate downloaded!');
    } catch (error) {
      console.error('Failed to download certificate', error);
      toast.error(error.response?.data?.detail || 'Failed to download certificate');
    }
  };

  const checkCourseCompletion = () => {
    const completed = modules.every(m => m.completed);
    setCourseCompleted(completed);
  };

  useEffect(() => {
    if (modules.length > 0) {
      checkCourseCompletion();
    }
  }, [modules]);
  const markComplete = async () => {
    if (!selectedModule) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/progress`,
        { module_id: selectedModule.id, completed: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Module marked as complete!');
      fetchModules();
    } catch (error) {
      console.error('Failed to update progress', error);
      toast.error('Failed to update progress');
    }
  };

  return (
    <div className="min-h-screen bg-deep-obsidian text-white p-8 pb-32" data-testid="course-detail-page">
      <motion.button
        onClick={() => navigate('/learning')}
        className="flex items-center gap-2 mb-8 text-cyan-core hover:text-white transition-colors"
        style={{ fontFamily: 'Rajdhani, sans-serif' }}
        whileHover={{ x: -5 }}
        data-testid="back-to-learning-btn"
      >
        <ArrowLeft className="w-5 h-5" />
        BACK TO LEARNING HUB
      </motion.button>

      <div className="mb-8 flex justify-end">
        <motion.button
          onClick={() => setShowLabs(!showLabs)}
          className="flex items-center gap-2 px-6 py-3 bg-electric-violet text-white font-bold hover:bg-cyan-core transition-colors"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          data-testid="open-labs-btn"
        >
          <Beaker className="w-5 h-5" />
          {showLabs ? 'CLOSE LABS' : 'OPEN INTERACTIVE LABS'}
        </motion.button>
      </div>

      {showLabs ? (
        <LabEnvironment courseId={courseId} onClose={() => setShowLabs(false)} />
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>MODULES</h2>
          {modules.map((module, idx) => (
            <motion.button
              key={module.id}
              onClick={() => setSelectedModule(module)}
              className={`w-full glass-panel p-4 text-left hover:border-cyan-core/50 transition-all ${
                selectedModule?.id === module.id ? 'border-cyan-core/50' : ''
              }`}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              data-testid={`module-item-${idx}`}
            >
              <div className="flex items-start gap-3">
                {module.completed ? (
                  <CheckCircle className="w-6 h-6 text-acid-lime flex-shrink-0" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-500 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{module.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {module.duration}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selectedModule ? (
            <motion.div
              key={selectedModule.id}
              className="glass-panel p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              data-testid="module-content-panel"
            >
              <h1 className="text-4xl font-bold mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{selectedModule.title}</h1>
              
              {selectedModule.video_url && (
                <div className="mb-6 glass-panel p-8 flex items-center justify-center h-64">
                  <Play className="w-16 h-16 text-cyan-core" />
                  <p className="ml-4 text-gray-400">Video Player Placeholder</p>
                </div>
              )}

              <div className="prose prose-invert max-w-none mb-8">
                <p className="text-lg leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {selectedModule.content}
                </p>
              </div>

              <div className="flex gap-4">
                <motion.button
                  onClick={markComplete}
                  className={`px-8 py-3 ${
                    selectedModule.completed
                      ? 'bg-acid-lime/20 border border-acid-lime/30 text-acid-lime'
                      : 'bg-cyan-core text-black hover:bg-white'
                  } font-bold clip-path-button transition-colors duration-300`}
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={selectedModule.completed}
                  data-testid="mark-complete-btn"
                >
                  {selectedModule.completed ? 'COMPLETED' : 'MARK AS COMPLETE'}
                </motion.button>

                {selectedModule.completed && (
                  <motion.button
                    onClick={() => setShowQuiz(!showQuiz)}
                    className="px-8 py-3 bg-laser-yellow text-black font-bold hover:bg-white transition-colors duration-300"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    data-testid="take-quiz-btn"
                  >
                    {showQuiz ? 'HIDE QUIZ' : 'TAKE QUIZ'}
                  </motion.button>
                )}
              </div>

              {showQuiz && selectedModule.completed && (
                <div className="mt-8">
                  <Quiz moduleId={selectedModule.id} onComplete={() => {
                    fetchModules();
                    toast.success('Great job! Continue learning!');
                  }} />
                </div>
              )}

              {courseCompleted && (
                <motion.div
                  className="mt-8 glass-panel p-6 border-l-4 border-laser-yellow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="w-8 h-8 text-laser-yellow" />
                      <div>
                        <h3 className="text-xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>COURSE COMPLETED!</h3>
                        <p className="text-gray-400" style={{ fontFamily: 'Outfit, sans-serif' }}>Download your certificate</p>
                      </div>
                    </div>
                    <motion.button
                      onClick={downloadCertificate}
                      className="flex items-center gap-2 px-6 py-3 bg-laser-yellow text-black font-bold hover:bg-white transition-colors"
                      style={{ fontFamily: 'Rajdhani, sans-serif' }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      data-testid="download-certificate-btn"
                    >
                      <Download className="w-5 h-5" />
                      DOWNLOAD CERTIFICATE
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <div className="glass-panel p-8 flex items-center justify-center h-full">
              <p className="text-gray-500" style={{ fontFamily: 'Outfit, sans-serif' }}>Select a module to begin learning</p>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default CourseDetail;