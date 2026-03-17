import React from 'react';
import { motion } from 'framer-motion';
import { User, Code } from 'lucide-react';

const PlatformFooter = () => {
  return (
    <motion.footer
      className="fixed bottom-0 left-0 right-0 glass-panel px-8 py-3 z-30 border-t border-white/10"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      data-testid="platform-footer"
    >
      <div className="flex items-center justify-center gap-8">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-cyan-core" />
          <span className="text-gray-400">Owner:</span>
          <span className="text-white font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Vijay</span>
        </div>
        <div className="w-px h-4 bg-white/20" />
        <div className="flex items-center gap-2 text-sm">
          <Code className="w-4 h-4 text-electric-violet" />
          <span className="text-gray-400">Author:</span>
          <span className="text-white font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Vijay</span>
        </div>
      </div>
    </motion.footer>
  );
};

export default PlatformFooter;
