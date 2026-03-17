import React from 'react';
import { motion } from 'framer-motion';

const HexViewer = ({ hexData }) => {
  if (!hexData || hexData.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No hex data available
      </div>
    );
  }

  return (
    <div className="glass-panel p-6" data-testid="hex-viewer">
      <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
        HEX VIEWER
      </h3>
      <div className="bg-black/60 p-4 rounded font-mono text-xs overflow-x-auto">
        <div className="grid grid-cols-3 gap-4 text-gray-400 mb-2 pb-2 border-b border-white/10">
          <div>Offset</div>
          <div>Hex Bytes</div>
          <div>ASCII</div>
        </div>
        {hexData.map((line, idx) => (
          <motion.div
            key={idx}
            className="grid grid-cols-3 gap-4 py-1 hover:bg-cyan-core/10 transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.02 }}
          >
            <div className="text-bright-blue">{line.offset}</div>
            <div className="text-acid-lime">{line.hex}</div>
            <div className="text-gray-300">{line.ascii}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HexViewer;