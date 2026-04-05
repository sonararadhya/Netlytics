import React from 'react';
import { motion } from 'framer-motion';

const LiquidBackground = ({ children }) => {
  return (
    <div className="liquid-wrapper">
      <div className="liquid-bg-container">
        {/* Animated glowing orbs that act as "liquid" blobs through blur and contrast */}
        <motion.div
          animate={{
            scale: [1, 1.2, 0.9, 1],
            rotate: [0, 90, 180, 0],
            x: [0, 40, -40, 0],
            y: [0, 30, -20, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="liquid-orb orb-cyan"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1.1, 1],
            rotate: [0, -60, -120, 0],
            x: [0, -50, 30, 0],
            y: [0, -40, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="liquid-orb orb-purple"
        />
        <motion.div
          animate={{
            scale: [1.2, 0.8, 1.3, 1.2],
            rotate: [0, 100, -50, 0],
            x: [30, -30, 20, 30],
            y: [-30, 20, -10, -30]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="liquid-orb orb-dark-accent"
        />
      </div>
      {/* Main content goes above the liquid layer */}
      <div className="liquid-content-layer">
        {children}
      </div>
    </div>
  );
};

export default LiquidBackground;
