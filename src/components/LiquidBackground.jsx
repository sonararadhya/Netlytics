import React, { useEffect, useRef, useState } from 'react';

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
      
      // Update and draw ripples
      ripples.current = ripples.current.filter(ripple => ripple.v > 0.01);
      
      ripples.current.forEach(ripple => {
        ripple.r += 2; // Expansion speed
        ripple.v *= 0.96; // Fade speed
        
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.r, 0, Math.PI * 2);
        
        // Dynamic color based on theme (read from CSS variable)
        const accentColor = getComputedStyle(document.body).getPropertyValue('--neon-cyan').trim() || '#00f3ff';
        
        ctx.strokeStyle = accentColor;
        ctx.globalAlpha = ripple.v * 0.3;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add a secondary inner ring for more "liquid" feel
        if (ripple.r > 20) {
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.r - 15, 0, Math.PI * 2);
          ctx.globalAlpha = ripple.v * 0.15;
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
    // Only add ripple every few pixels to avoid too many
    const lastRipple = ripples.current[ripples.current.length - 1];
    if (!lastRipple || Math.hypot(e.clientX - lastRipple.x, e.clientY - lastRipple.y) > 25) {
      addRipple(e);
    }
  };

  return (
    <div className="liquid-wrapper" onMouseMove={handleMouseMove} onClick={addRipple}>
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
          filter: 'blur(2px)' // Soften the ripples
        }}
      />
      <div className="liquid-content-layer">
        {children}
      </div>
    </div>
  );
};

export default LiquidBackground;
