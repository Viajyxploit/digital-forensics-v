import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Shield, Wifi } from 'lucide-react';
import { toast } from 'sonner';

const NetworkLabEnvironment = ({ scenario, onTaskComplete }) => {
  const [selectedPacket, setSelectedPacket] = useState(null);
  const [flaggedIPs, setFlaggedIPs] = useState([]);
  const [detectedThreats, setDetectedThreats] = useState([]);

  const flagIP = (ip) => {
    if (!flaggedIPs.includes(ip)) {
      setFlaggedIPs([...flaggedIPs, ip]);
      toast.success(`IP ${ip} flagged as suspicious`);
      
      // Check if correct threat IPs are flagged
      const correctFlags = scenario.threat_ips.every(tip => [...flaggedIPs, ip].includes(tip));
      if (correctFlags) {
        onTaskComplete(1, { flagged_ips: [...flaggedIPs, ip] });
      }
    }
  };

  const analyzeThreat = (packet) => {
    if (packet.threat && !detectedThreats.find(t => t.timestamp === packet.timestamp)) {
      setDetectedThreats([...detectedThreats, packet]);
      toast.success(`Threat detected: ${packet.type}`);
    }
  };

  const getSeverityColor = (threat) => {
    if (!threat) return 'text-acid-lime';
    return 'text-neon-red';
  };

  return (
    <div className="space-y-6" data-testid="network-lab">
      {/* Traffic Capture Table */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            <Wifi className="inline w-6 h-6 mr-2 text-bright-blue" />
            NETWORK TRAFFIC CAPTURE
          </h3>
          <div className="text-sm">
            <span className="text-gray-400">Packets: </span>
            <span className="text-cyan-core font-bold">{scenario.traffic_capture.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr className="text-left">
                <th className="p-3 font-semibold">Timestamp</th>
                <th className="p-3 font-semibold">Source IP</th>
                <th className="p-3 font-semibold">Destination IP</th>
                <th className="p-3 font-semibold">Protocol</th>
                <th className="p-3 font-semibold">Size</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {scenario.traffic_capture.map((packet, idx) => (
                <motion.tr
                  key={idx}
                  className={`border-b border-white/5 hover:bg-cyan-core/10 cursor-pointer ${
                    packet.threat ? 'bg-neon-red/10' : ''
                  }`}
                  onClick={() => setSelectedPacket(packet)}
                  whileHover={{ x: 5 }}
                  data-testid={`packet-${idx}`}
                >
                  <td className="p-3 font-mono text-xs">{packet.timestamp}</td>
                  <td className="p-3 font-mono text-cyan-core">{packet.source_ip}</td>
                  <td className="p-3 font-mono text-bright-blue">{packet.dest_ip}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-electric-violet/20 rounded text-xs">
                      {packet.protocol}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-xs">{packet.size}B</td>
                  <td className="p-3">
                    {packet.threat ? (
                      <span className="flex items-center gap-1 text-neon-red text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        THREAT
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-acid-lime text-xs">
                        <Shield className="w-3 h-3" />
                        SAFE
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {packet.threat && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          flagIP(packet.dest_ip);
                          analyzeThreat(packet);
                        }}
                        className="px-2 py-1 bg-neon-red/20 hover:bg-neon-red/40 text-xs rounded transition-colors"
                      >
                        FLAG
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Packet Details */}
        <div className="glass-panel p-6">
          <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            PACKET DETAILS
          </h3>
          {selectedPacket ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Source</p>
                  <p className="font-mono text-cyan-core">{selectedPacket.source_ip}</p>
                </div>
                <div>
                  <p className="text-gray-400">Destination</p>
                  <p className="font-mono text-bright-blue">{selectedPacket.dest_ip}</p>
                </div>
                <div>
                  <p className="text-gray-400">Protocol</p>
                  <p className="font-mono">{selectedPacket.protocol}</p>
                </div>
                <div>
                  <p className="text-gray-400">Port</p>
                  <p className="font-mono">{selectedPacket.port || 'N/A'}</p>
                </div>
              </div>
              {selectedPacket.threat && (
                <div className="mt-4 p-4 bg-neon-red/20 border border-neon-red/50 rounded">
                  <p className="text-neon-red font-bold mb-2">⚠️ THREAT DETECTED</p>
                  <p className="text-sm">Type: {selectedPacket.type}</p>
                  <p className="text-xs text-gray-400 mt-2">This traffic shows characteristics of {selectedPacket.type.replace('_', ' ').toLowerCase()}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Select a packet to view details</p>
          )}
        </div>

        {/* Detected Threats */}
        <div className="glass-panel p-6">
          <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            DETECTED THREATS
          </h3>
          <div className="space-y-2">
            {detectedThreats.map((threat, idx) => (
              <div key={idx} className="p-3 bg-neon-red/10 border border-neon-red/30 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-neon-red">{threat.type}</span>
                  <Activity className="w-4 h-4 text-neon-red" />
                </div>
                <p className="text-xs text-gray-400">{threat.source_ip} → {threat.dest_ip}</p>
                <p className="text-xs font-mono mt-1">{threat.timestamp}</p>
              </div>
            ))}
            {detectedThreats.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No threats detected yet</p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <h4 className="text-sm font-semibold mb-2">Flagged IPs</h4>
            {flaggedIPs.map((ip, idx) => (
              <div key={idx} className="inline-block px-2 py-1 bg-solar-orange/20 rounded text-xs mr-2 mb-2">
                {ip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkLabEnvironment;