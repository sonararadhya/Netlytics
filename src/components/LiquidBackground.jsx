import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const LiquidBlob = ({ colorClass, baseLeft, baseTop, mousePos, index, size }) => {
  const [orbCenter, setOrbCenter] = useState({ x: 0, y: 0 });
  
  // Springs for smooth, liquid-like pushing and reforming. Heavy mass for sluggish fluid resistance
  const springX = useSpring(0, { damping: 20, stiffness: 50, mass: 3 });
  const springY = useSpring(0, { damping: 20, stiffness: 50, mass: 3 });

  useEffect(() => {
    // Initial center calc based on viewport
    const calculateCenter = () => {
      setOrbCenter({
        x: window.innerWidth * (parseFloat(baseLeft) / 100),
        y: window.innerHeight * (parseFloat(baseTop) / 100)
      });
    };
    calculateCenter();
    window.addEventListener('resize', calculateCenter);
    return () => window.removeEventListener('resize', calculateCenter);
  }, [baseLeft, baseTop]);

  useEffect(() => {
    if (!mousePos || mousePos.x === -1000) return;
    
    // Calculate distance between mouse and this orb's resting center
    const dx = mousePos.x - orbCenter.x;
    const dy = mousePos.y - orbCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // High threshold to repel early
    const threshold = 600; 
    if (distance < threshold) {
      // Exponential force curve so it pushes harder the closer you get
      const force = Math.pow((threshold - distance) / threshold, 2.5);
      const pushX = -(dx / distance) * force * 400; 
      const pushY = -(dy / distance) * force * 400;
      
      springX.set(pushX);
      springY.set(pushY);
    } else {
      // Return to rest smoothly
      springX.set(0);
      springY.set(0);
    }
  }, [mousePos, orbCenter, springX, springY]);

  // Blobs slowly drift organically
  return (
    <motion.div
      className={`liquid-orb ${colorClass}`}
      style={{
        left: baseLeft,
        top: baseTop,
        x: springX,
        y: springY,
        translateX: '-50%',
        translateY: '-50%',
        width: size,
        height: size,
      }}
      animate={{
        scale: [1, 1.15, 0.9, 1],
        rotate: [0, 90, 180, 270, 360],
        borderRadius: ["40% 60% 70% 30%", "50% 50% 40% 60%", "60% 40% 30% 70%", "40% 60% 70% 30%"] // organic amorphous shapes
      }}
      transition={{ 
        duration: 30 + index * 5, 
        repeat: Infinity, 
        ease: 'linear' 
      }}
    />
  );
};

const LiquidBackground = ({ children }) => {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    // passive true for performance
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="liquid-wrapper">
      <div className="liquid-bg-container">
        {/* SVG Liquid Surface Tension Matrix */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <filter id="liquid-meld">
            <feGaussianBlur in="SourceGraphic" stdDeviation="35" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 60 -35" />
          </filter>
        </svg>
        
        <div style={{ width: '100%', height: '100%', position: 'absolute', filter: 'url(#liquid-meld)' }}>
          <LiquidBlob index={1} colorClass="orb-cyan" baseLeft="20%" baseTop="25%" size="45vw" mousePos={mousePos} />
          <LiquidBlob index={2} colorClass="orb-purple" baseLeft="80%" baseTop="75%" size="50vw" mousePos={mousePos} />
          <LiquidBlob index={3} colorClass="orb-dark-accent" baseLeft="55%" baseTop="45%" size="40vw" mousePos={mousePos} />
          <LiquidBlob index={4} colorClass="orb-neon-pink" baseLeft="30%" baseTop="80%" size="35vw" mousePos={mousePos} />
        </div>
      </div>

      <div className="liquid-content-layer">
        {children}
      </div>
    </div>
  );
};

export default LiquidBackground;
