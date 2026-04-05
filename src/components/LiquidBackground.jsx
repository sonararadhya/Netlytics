import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const BackgroundOrb = ({ colorClass, delay = 0, size = "40vw", initialPos = { x: "20%", y: "20%" } }) => (
  <motion.div
    className={`liquid-orb ${colorClass}`}
    style={{
      position: 'absolute',
      width: size,
      height: size,
      left: initialPos.x,
      top: initialPos.y,
      borderRadius: '50%',
      filter: 'blur(80px)',
      opacity: 0.4,
      zIndex: 0,
    }}
    animate={{
      x: [0, 50, -30, 0],
      y: [0, -40, 60, 0],
      scale: [1, 1.1, 0.9, 1],
    }}
    transition={{
      duration: 25,
      delay,
      repeat: Infinity,
      ease: "linear"
    }}
  />
);

const LiquidBackground = ({ children }) => {
  const canvasRef = useRef(null);
  const ripples = useRef([]);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ripples.current = ripples.current.filter(ripple => ripple.v > 0.01);
      
      ripples.current.forEach(ripple => {
        ripple.r += 2.5; 
        ripple.v *= 0.95; 
        
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.r, 0, Math.PI * 2);
        
        const accentColor = getComputedStyle(document.body).getPropertyValue('--neon-cyan').trim() || '#00f3ff';
        
        ctx.strokeStyle = accentColor;
        ctx.globalAlpha = ripple.v * 0.4;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        if (ripple.r > 30) {
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.r - 20, 0, Math.PI * 2);
          ctx.globalAlpha = ripple.v * 0.2;
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [windowSize]);

  const addRipple = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ripples.current.push({ x, y, r: 0, v: 1 });
  };

  const handleMouseMove = (e) => {
    const lastRipple = ripples.current[ripples.current.length - 1];
    if (!lastRipple || Math.hypot(e.clientX - lastRipple.x, e.clientY - lastRipple.y) > 40) {
      addRipple(e);
    }
  };

  return (
    <div className="liquid-wrapper" onMouseMove={handleMouseMove} onClick={addRipple}>
      {/* Background Orbs to power Glassmorphism */}
      <div className="background-elements" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <BackgroundOrb colorClass="orb-cyan" size="50vw" initialPos={{ x: '10%', y: '10%' }} delay={0} />
        <BackgroundOrb colorClass="orb-purple" size="60vw" initialPos={{ x: '60%', y: '50%' }} delay={2} />
        <BackgroundOrb colorClass="orb-neon-pink" size="45vw" initialPos={{ x: '30%', y: '70%' }} delay={5} />
      </div>

      <canvas 
        ref={canvasRef}
        width={windowSize.width}
        height={windowSize.height}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 1,
          filter: 'blur(1px)'
        }}
      />
      <div className="liquid-content-layer" style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </div>
    </div>
  );
};

export default LiquidBackground;
