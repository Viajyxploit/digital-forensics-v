import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, Shield, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const IncidentResponseLab = ({ scenario, onTaskComplete }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [mitigationActions, setMitigationActions] = useState([]);
  const [isolatedSystems, setIsolatedSystems] = useState(false);

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'text-neon-red';
      case 'warning': return 'text-solar-orange';
      case 'info': return 'text-bright-blue';
      default: return 'text-gray-400';
    }
  };

  const getSeverityBg = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-neon-red/20 border-neon-red';
      case 'warning': return 'bg-solar-orange/20 border-solar-orange';
      case 'info': return 'bg-bright-blue/20 border-bright-blue';
      default: return 'bg-gray-500/20 border-gray-500';
    }
  };

  const takeAction = (action) => {
    if (!mitigationActions.includes(action)) {
      setMitigationActions([...mitigationActions, action]);
      toast.success(`Action taken: ${action.replace('_', ' ')}`);
      
      // Check if correct actions are taken
      const correctActions = scenario.correct_actions.every(ca => [...mitigationActions, action].includes(ca));
      if (correctActions) {
        onTaskComplete(5, { actions: [...mitigationActions, action] });
      }
    }
  };

  return (
    <div className="space-y-6" data-testid="incident-response-lab">
      {/* Incident Timeline */}
      <div className="glass-panel p-6">
        <h3 className="text-xl font-bold mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          INCIDENT TIMELINE
        </h3>
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-cyan-core/30" />
          {scenario.timeline.map((event, idx) => (
            <motion.div
              key={idx}
              className={`flex items-start gap-4 mb-6 cursor-pointer p-4 rounded hover:bg-white/5 ${
                selectedEvent === event ? 'bg-white/10' : ''
              }`}
              onClick={() => setSelectedEvent(event)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ x: 5 }}
              data-testid={`timeline-event-${idx}`}
            >
              <div className={`relative z-10 w-16 flex-shrink-0 flex items-center gap-2`}>
                <Clock className="w-4 h-4 text-cyan-core" />
                <span className="text-sm font-mono">{event.time}</span>
              </div>
              <div className={`flex-1 p-3 border-l-4 ${getSeverityBg(event.severity)}`}>
                <p className={`font-semibold ${getSeverityColor(event.severity)}`}>
                  {event.event}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Logs */}
        <div className="glass-panel p-6">
          <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            SYSTEM LOGS
          </h3>
          <div className="bg-black/60 p-4 rounded max-h-96 overflow-y-auto space-y-2">
            {scenario.system_logs.map((log, idx) => (
              <div key={idx} className="font-mono text-xs p-2 hover:bg-white/5 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-500">{log.timestamp}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    log.level === 'CRITICAL' ? 'bg-neon-red/20 text-neon-red' :
                    log.level === 'ERROR' ? 'bg-solar-orange/20 text-solar-orange' :
                    log.level === 'ALERT' ? 'bg-laser-yellow/20 text-laser-yellow' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-bright-blue">[{log.source}]</span>
                </div>
                <p className="text-gray-300">{log.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mitigation Actions */}
        <div className="glass-panel p-6">
          <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            RESPONSE ACTIONS
          </h3>
          
          <div className="space-y-3 mb-6">
            <motion.button
              onClick={() => {
                setIsolatedSystems(true);
                takeAction('isolate_system');
              }}
              disabled={isolatedSystems}
              className={`w-full py-3 px-4 text-left border-2 transition-all ${
                isolatedSystems 
                  ? 'border-acid-lime bg-acid-lime/10 text-acid-lime' 
                  : 'border-neon-red hover:bg-neon-red/10'
              }`}
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
              whileHover={{ scale: isolatedSystems ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-testid="isolate-system-btn"
            >
              <div className="flex items-center justify-between">
                <span>ISOLATE INFECTED SYSTEMS</span>
                {isolatedSystems && <CheckCircle className="w-5 h-5" />}
              </div>
            </motion.button>

            {[
              { id: 'block_c2', label: 'BLOCK C2 SERVER' },
              { id: 'restore_from_backup', label: 'RESTORE FROM BACKUP' },
              { id: 'patch_vulnerability', label: 'PATCH VULNERABILITY' }
            ].map((action) => (
              <motion.button
                key={action.id}
                onClick={() => takeAction(action.id)}
                disabled={mitigationActions.includes(action.id)}
                className={`w-full py-3 px-4 text-left border-2 transition-all ${
                  mitigationActions.includes(action.id)
                    ? 'border-acid-lime bg-acid-lime/10 text-acid-lime'
                    : 'border-electric-violet hover:bg-electric-violet/10'
                }`}
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                whileHover={{ scale: mitigationActions.includes(action.id) ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <span>{action.label}</span>
                  {mitigationActions.includes(action.id) && <CheckCircle className="w-5 h-5" />}
                </div>
              </motion.button>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10">
            <h4 className="text-sm font-semibold mb-3">Actions Taken</h4>
            <div className="space-y-2">
              {mitigationActions.length === 0 && isolatedSystems === false ? (
                <p className="text-gray-500 text-sm">No actions taken yet</p>
              ) : (
                <>
                  {isolatedSystems && (
                    <div className="flex items-center gap-2 text-sm text-acid-lime">
                      <CheckCircle className="w-4 h-4" />
                      <span>Systems isolated</span>
                    </div>
                  )}
                  {mitigationActions.map((action, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-acid-lime">
                      <CheckCircle className="w-4 h-4" />
                      <span>{action.replace('_', ' ').toUpperCase()}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentResponseLab;