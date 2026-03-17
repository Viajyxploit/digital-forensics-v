import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Award, Target } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import ForensicsLabEnvironment from './ForensicsLabEnvironment';
import NetworkLabEnvironment from './NetworkLabEnvironment';
import IncidentResponseLab from './IncidentResponseLab';
import MalwareLabEnvironment from './MalwareLabEnvironment';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LabEnvironment = ({ courseId, onClose }) => {
  const [labs, setLabs] = useState([]);
  const [currentLab, setCurrentLab] = useState(null);
  const [labScenario, setLabScenario] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLabs();
  }, [courseId]);

  const fetchLabs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/courses/${courseId}/labs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLabs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch labs', error);
      setLoading(false);
    }
  };

  const startLab = async (lab) => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch lab scenario
      const labType = getLabType(courseId);
      const response = await axios.get(`${API}/labs/${labType}/${lab.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setLabScenario(response.data);
      setCurrentLab(lab);
      
      // Start lab session
      await axios.post(`${API}/labs/start?lab_id=${lab.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Lab started!');
    } catch (error) {
      console.error('Failed to start lab', error);
      toast.error('Failed to start lab');
    }
  };

  const getLabType = (courseId) => {
    const mapping = {
      'course-1': 'digital_forensics',
      'course-2': 'network_security',
      'course-3': 'malware_analysis',
      'course-4': 'incident_response'
    };
    return mapping[courseId] || 'digital_forensics';
  };

  const handleTaskComplete = async (taskId, answer) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/labs/submit-task`,
        {
          lab_id: currentLab.id,
          task_id: taskId,
          answer: answer
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(response.data.feedback);
      setProgress({ ...progress, [taskId]: true });
    } catch (error) {
      console.error('Failed to submit task', error);
    }
  };

  const renderLabComponent = () => {
    if (!labScenario) return null;

    const labType = getLabType(courseId);

    switch (labType) {
      case 'digital_forensics':
        return <ForensicsLabEnvironment scenario={labScenario} onTaskComplete={handleTaskComplete} />;
      case 'network_security':
        return <NetworkLabEnvironment scenario={labScenario} onTaskComplete={handleTaskComplete} />;
      case 'incident_response':
        return <IncidentResponseLab scenario={labScenario} onTaskComplete={handleTaskComplete} />;
      case 'malware_analysis':
        return <MalwareLabEnvironment scenario={labScenario} onTaskComplete={handleTaskComplete} />;
      default:
        return <p>Lab type not supported</p>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Loading labs...</p>
      </div>
    );
  }

  if (currentLab && labScenario) {
    return (
      <div className="space-y-6" data-testid="active-lab">
        <div className="flex items-center justify-between">
          <motion.button
            onClick={() => {
              setCurrentLab(null);
              setLabScenario(null);
            }}
            className="flex items-center gap-2 text-cyan-core hover:text-white transition-colors"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
            whileHover={{ x: -5 }}
            data-testid="back-to-labs-btn"
          >
            <ArrowLeft className="w-5 h-5" />
            BACK TO LABS
          </motion.button>

          <div className="glass-panel px-4 py-2">
            <p className="text-sm text-gray-400">Lab Progress</p>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-laser-yellow" />
              <span className="font-bold">{Object.keys(progress).length} / {labScenario.tasks.length} Tasks</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            {labScenario.title}
          </h2>
          <p className="text-gray-400 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {labScenario.description}
          </p>
          <span className={`px-3 py-1 text-xs font-bold ${{
            'beginner': 'bg-acid-lime/20 text-acid-lime',
            'intermediate': 'bg-solar-orange/20 text-solar-orange',
            'advanced': 'bg-neon-red/20 text-neon-red'
          }[labScenario.difficulty]}`}>
            {labScenario.difficulty.toUpperCase()}
          </span>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            LAB TASKS
          </h3>
          <div className="space-y-2">
            {labScenario.tasks.map((task, idx) => (
              <div
                key={task.id}
                className={`flex items-start gap-3 p-3 border-l-4 ${ 
                  progress[task.id] 
                    ? 'border-acid-lime bg-acid-lime/10' 
                    : 'border-cyan-core/30 bg-surface/30'
                }`}
              >
                {progress[task.id] ? (
                  <CheckCircle className="w-5 h-5 text-acid-lime flex-shrink-0 mt-0.5" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-cyan-core flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Task {task.id}: {task.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Type: {task.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {renderLabComponent()}
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="lab-selection">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          INTERACTIVE LABS
        </h2>
        <motion.button
          onClick={onClose}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          CLOSE
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {labs.map((lab, idx) => (
          <motion.div
            key={lab.id}
            className="glass-panel p-6 hover:border-cyan-core/50 transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5 }}
            data-testid={`lab-card-${idx}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  {lab.title}
                </h3>
                <p className="text-sm text-gray-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {lab.description}
                </p>
              </div>
              <span className={`px-3 py-1 text-xs font-bold flex-shrink-0 ${{
                'beginner': 'bg-acid-lime/20 text-acid-lime',
                'intermediate': 'bg-solar-orange/20 text-solar-orange',
                'advanced': 'bg-neon-red/20 text-neon-red'
              }[lab.difficulty]}`}>
                {lab.difficulty.toUpperCase()}
              </span>
            </div>

            <motion.button
              onClick={() => startLab(lab)}
              className="w-full py-3 bg-cyan-core text-black font-bold hover:bg-white transition-colors"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-testid={`start-lab-${idx}-btn`}
            >
              START LAB
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LabEnvironment;
