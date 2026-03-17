import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Cpu, Lock, Zap, ChevronRight, Terminal, Brain, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

const LandingPage = () => {
  const navigate = useNavigate();
  const [particlesInit, setParticlesInit] = useState(false);

  const initParticles = async (engine) => {
    await loadSlim(engine);
    setParticlesInit(true);
  };

  const particlesOptions = {
    particles: {
      number: { value: 50, density: { enable: true, value_area: 800 } },
      color: { value: '#00F2EA' },
      opacity: { value: 0.3, random: true },
      size: { value: 2, random: true },
      move: { enable: true, speed: 1, direction: 'none', out_mode: 'out' },
      line_linked: { enable: true, distance: 150, color: '#00F2EA', opacity: 0.2, width: 1 }
    },
    interactivity: {
      events: { onhover: { enable: true, mode: 'repulse' } },
      modes: { repulse: { distance: 100, duration: 0.4 } }
    },
    retina_detect: true
  };

  const features = [
    { icon: Brain, color: 'electric-violet', title: 'AI-Powered Analysis', desc: 'Advanced machine learning for threat detection', route: '/dashboard' },
    { icon: Shield, color: 'cyan-core', title: 'Digital Forensics', desc: 'Professional-grade investigation tools', route: '/forensics' },
    { icon: Terminal, color: 'acid-lime', title: 'Live Analysis', desc: 'Real-time file and data examination', route: '/forensics' },
    { icon: Database, color: 'bright-blue', title: 'Evidence Collection', desc: 'Secure chain of custody management', route: '/forensics' },
    { icon: Zap, color: 'laser-yellow', title: 'Threat Monitor', desc: 'Continuous security surveillance', route: '/threats' },
    { icon: Lock, color: 'neon-red', title: 'Learning Platform', desc: 'Expert-led cybersecurity courses', route: '/learning' }
  ];

  const handleFeatureClick = (route) => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate(route);
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-deep-obsidian text-white relative overflow-hidden">
      <Particles init={initParticles} options={particlesOptions} className="absolute inset-0 z-0" />
      
      <nav className="relative z-10 flex justify-between items-center px-12 py-6 glass-panel" data-testid="landing-nav">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Shield className="w-8 h-8 text-cyan-core" />
          <span className="text-2xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>CYBERSENTINELS</span>
        </motion.div>
        
        <motion.button
          onClick={() => navigate('/auth')}
          className="px-6 py-2 bg-white text-black font-bold clip-path-button hover:bg-cyan-core transition-colors duration-300"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          data-testid="nav-get-started-btn"
        >
          GET STARTED
        </motion.button>
      </nav>

      <section className="relative z-10 px-12 py-32 text-center hero-glow" data-testid="hero-section">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight uppercase mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            DIGITAL FORENSICS
            <br />
            <span className="text-cyan-core">AI-POWERED</span> PLATFORM
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Master cybersecurity with cutting-edge AI technology. Analyze threats, collect evidence, and become a certified digital forensics expert.
          </p>
          
          <motion.button
            onClick={() => navigate('/auth')}
            className="px-12 py-4 bg-cyan-core text-black text-xl font-bold clip-path-button hover:bg-white transition-colors duration-300 inline-flex items-center gap-3"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 242, 234, 0.5)' }}
            whileTap={{ scale: 0.98 }}
            data-testid="hero-launch-platform-btn"
          >
            LAUNCH PLATFORM
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </motion.div>
      </section>

      <section className="relative z-10 px-12 py-24" data-testid="features-section">
        <motion.h2 
          className="text-4xl md:text-5xl font-semibold text-center mb-16 tracking-tight"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          ADVANCED CAPABILITIES
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                onClick={() => handleFeatureClick(feature.route)}
                className="glass-panel p-8 group hover:border-cyan-core/50 transition-all duration-500 cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                data-testid={`feature-card-${idx}`}
              >
                <Icon className={`w-12 h-12 text-${feature.color} mb-4 group-hover:animate-pulse-glow`} />
                <h3 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{feature.title}</h3>
                <p className="text-gray-400" style={{ fontFamily: 'Outfit, sans-serif' }}>{feature.desc}</p>
                <div className="mt-4 text-cyan-core text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to explore →
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 px-12 py-24 text-center" data-testid="cta-section">
        <motion.div
          className="glass-panel max-w-4xl mx-auto p-16"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl font-bold mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            START YOUR JOURNEY TODAY
          </h2>
          <p className="text-xl text-gray-400 mb-10" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Join thousands of professionals mastering digital forensics and cybersecurity
          </p>
          <motion.button
            onClick={() => navigate('/auth')}
            className="px-12 py-4 bg-electric-violet text-white text-xl font-bold clip-path-button hover:bg-cyan-core transition-colors duration-300"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            data-testid="cta-join-now-btn"
          >
            JOIN NOW
          </motion.button>
        </motion.div>
      </section>

      <footer className="relative z-10 glass-panel px-12 py-8 mt-24 text-center" data-testid="footer">
        <p className="text-gray-500 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
          © 2026 CyberSentinels. All Rights Reserved. | Advanced Digital Forensics Platform
        </p>
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Owner:</span>
            <span className="text-cyan-core font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Vijay</span>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Author:</span>
            <span className="text-electric-violet font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Vijay</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;