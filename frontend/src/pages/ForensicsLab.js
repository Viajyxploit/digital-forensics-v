import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Download, Search, Hash, AlertTriangle, CheckCircle, Activity, Shield } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import HexViewer from '../components/HexViewer';
import PlatformFooter from '../components/PlatformFooter';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ForensicsLab = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setAnalysis(null);
    }
  };

  const analyzeFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API}/forensics/upload-advanced`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setAnalysis(response.data.analysis);
      toast.success('File analyzed successfully!');
    } catch (error) {
      console.error('Upload failed', error);
      toast.error('Failed to analyze file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep-obsidian text-white p-8 pb-32" data-testid="forensics-lab-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>FORENSICS LAB</h1>
        <p className="text-gray-400" style={{ fontFamily: 'Outfit, sans-serif' }}>Analyze files and extract digital evidence</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            className="glass-panel p-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>UPLOAD FILE</h2>
            
            <label className="block">
              <div className="border-2 border-dashed border-cyan-core/30 hover:border-cyan-core/60 p-8 text-center transition-all group">
                <Upload className="w-12 h-12 mx-auto mb-4 text-cyan-core group-hover:animate-float" />
                <p className="text-sm text-gray-400 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Any file type accepted</p>
                <input 
                  type="file" 
                  onChange={handleFileSelect} 
                  className="hidden"
                  data-testid="file-upload-input"
                />
              </div>
            </label>

            {selectedFile && (
              <motion.div
                className="mt-4 p-4 bg-surface/50 border border-white/10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                data-testid="selected-file-info"
              >
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-cyan-core" />
                  <div className="flex-1">
                    <p className="font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>{selectedFile.name}</p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={analyzeFile}
                  className="w-full py-2 bg-acid-lime text-black font-bold hover:bg-white transition-colors"
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={uploading}
                  data-testid="analyze-file-btn"
                >
                  {uploading ? 'ANALYZING...' : 'ANALYZE FILE'}
                </motion.button>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            className="glass-panel p-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>RECENT FILES</h2>
            <div className="space-y-2">
              {['sample.exe', 'data.bin', 'evidence.zip'].map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 hover:bg-white/5 transition-colors" data-testid={`recent-file-${idx}`}>
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>{file}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-2">
          <motion.div
            className="glass-panel p-8"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            data-testid="analysis-panel"
          >
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>ANALYSIS RESULTS</h2>
            
            {!analysis ? (
              <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                <Search className="w-20 h-20 mb-4" />
                <p style={{ fontFamily: 'Outfit, sans-serif' }}>Upload a file to begin analysis</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="glass-panel p-4">
                    <p className="text-sm text-gray-400 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>File Size</p>
                    <p className="text-xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{(analysis.file_size / 1024).toFixed(2)} KB</p>
                  </div>
                  <div className="glass-panel p-4">
                    <p className="text-sm text-gray-400 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Threat Level</p>
                    <p className={`text-xl font-bold ${
                      analysis.threat_analysis?.threat_level === 'low' ? 'text-acid-lime' : 
                      analysis.threat_analysis?.threat_level === 'medium' ? 'text-solar-orange' : 
                      'text-neon-red'
                    }`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                      {analysis.threat_analysis?.threat_level?.toUpperCase()}
                    </p>
                  </div>
                  <div className="glass-panel p-4">
                    <p className="text-sm text-gray-400 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Entropy</p>
                    <p className="text-xl font-bold text-electric-violet" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {analysis.entropy}
                    </p>
                  </div>
                </div>

                <div className="glass-panel p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    <Activity className="w-5 h-5 text-bright-blue" />
                    FILE TYPE
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">MIME Type:</span>
                      <span className="text-cyan-core font-mono">{analysis.file_type?.mime_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Description:</span>
                      <span className="text-white">{analysis.file_type?.description}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    <Hash className="w-5 h-5 text-bright-blue" />
                    HASH VALUES
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(analysis.hashes || {}).map(([algorithm, hash]) => (
                      <div key={algorithm}>
                        <p className="text-xs text-gray-400 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          {algorithm.toUpperCase()}
                        </p>
                        <p className="font-mono text-sm text-cyan-core break-all">{hash}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <HexViewer hexData={analysis.hex_preview || []} />

                <div className="glass-panel p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    <Shield className="w-5 h-5 text-acid-lime" />
                    THREAT ANALYSIS
                  </h3>
                  <div className="space-y-2">
                    {(analysis.threat_analysis?.findings || []).map((finding, idx) => (
                      <div key={idx} className="flex items-start gap-2" data-testid={`finding-${idx}`}>
                        <CheckCircle className="w-4 h-4 text-acid-lime mt-1 flex-shrink-0" />
                        <p className="text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>{finding}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {analysis.strings && analysis.strings.length > 0 && (
                  <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                      EXTRACTED STRINGS
                    </h3>
                    <div className="bg-black/60 p-4 rounded max-h-64 overflow-y-auto">
                      {analysis.strings.map((str, idx) => (
                        <p key={idx} className="font-mono text-xs text-gray-300 mb-1">{str}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
      
      <PlatformFooter />

export default ForensicsLab;