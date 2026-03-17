import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, File, CheckCircle, Hash, Clock } from 'lucide-react';
import { toast } from 'sonner';

const ForensicsLabEnvironment = ({ scenario, onTaskComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [collectedEvidence, setCollectedEvidence] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(['root']);

  const renderFileTree = (node, path = '') => {
    const currentPath = path + '/' + node.name;
    const isExpanded = expandedFolders.includes(currentPath);

    if (node.type === 'directory') {
      return (
        <div key={currentPath} className="ml-4">
          <motion.div
            className="flex items-center gap-2 py-2 px-3 hover:bg-cyan-core/10 cursor-pointer rounded"
            onClick={() => {
              if (isExpanded) {
                setExpandedFolders(expandedFolders.filter(f => f !== currentPath));
              } else {
                setExpandedFolders([...expandedFolders, currentPath]);
              }
            }}
            whileHover={{ x: 5 }}
          >
            <FolderOpen className="w-5 h-5 text-bright-blue" />
            <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{node.name}</span>
          </motion.div>
          {isExpanded && node.children && (
            <div className="ml-4">
              {node.children.map(child => renderFileTree(child, currentPath))}
            </div>
          )}
        </div>
      );
    }

    return (
      <motion.div
        key={currentPath}
        className={`flex items-center gap-2 py-2 px-3 ml-4 hover:bg-cyan-core/10 cursor-pointer rounded ${
          node.suspicious ? 'border-l-2 border-neon-red' : ''
        }`}
        onClick={() => setSelectedFile(node)}
        whileHover={{ x: 5 }}
        data-testid={`file-${node.name}`}
      >
        <File className={`w-5 h-5 ${node.suspicious ? 'text-neon-red' : 'text-gray-400'}`} />
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }} className={node.hidden ? 'text-solar-orange' : ''}>
          {node.name} {node.hidden && '(Hidden)'}
        </span>
        {node.suspicious && <span className="text-xs text-neon-red">[SUSPICIOUS]</span>}
      </motion.div>
    );
  };

  const collectEvidence = () => {
    if (!selectedFile) return;
    
    if (!collectedEvidence.find(e => e.name === selectedFile.name)) {
      setCollectedEvidence([...collectedEvidence, selectedFile]);
      toast.success(`Evidence collected: ${selectedFile.name}`);
      
      // Check if all evidence items are collected
      if (collectedEvidence.length + 1 === scenario.evidence_items.length) {
        onTaskComplete(1, { collected: [...collectedEvidence, selectedFile] });
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-testid="forensics-lab">
      {/* File System Browser */}
      <div className="lg:col-span-2 glass-panel p-6">
        <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          FILE SYSTEM BROWSER
        </h3>
        <div className="bg-black/60 p-4 rounded max-h-96 overflow-y-auto">
          {renderFileTree(scenario.file_system.root)}
        </div>
      </div>

      {/* File Details */}
      <div className="space-y-4">
        <div className="glass-panel p-6">
          <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            FILE DETAILS
          </h3>
          {selectedFile ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Name</p>
                <p className="font-mono text-cyan-core">{selectedFile.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Size</p>
                <p className="font-mono">{selectedFile.size} bytes</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Modified</p>
                <p className="font-mono text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {selectedFile.modified}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Hash (MD5)</p>
                <p className="font-mono text-sm flex items-center gap-2">
                  <Hash className="w-4 h-4 text-bright-blue" />
                  {selectedFile.hash}
                </p>
              </div>
              {selectedFile.suspicious && (
                <div className="mt-4 p-3 bg-neon-red/20 border border-neon-red/50 rounded">
                  <p className="text-sm text-neon-red font-semibold">⚠️ SUSPICIOUS FILE DETECTED</p>
                </div>
              )}
              <motion.button
                onClick={collectEvidence}
                className="w-full mt-4 py-2 bg-acid-lime text-black font-bold hover:bg-white transition-colors"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-testid="collect-evidence-btn"
              >
                COLLECT AS EVIDENCE
              </motion.button>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Select a file to view details</p>
          )}
        </div>

        {/* Collected Evidence */}
        <div className="glass-panel p-6">
          <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            EVIDENCE CHAIN
          </h3>
          <div className="space-y-2">
            {collectedEvidence.map((evidence, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-acid-lime/10 border border-acid-lime/30 rounded">
                <CheckCircle className="w-4 h-4 text-acid-lime" />
                <span className="text-sm font-mono">{evidence.name}</span>
              </div>
            ))}
            {collectedEvidence.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No evidence collected yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForensicsLabEnvironment;