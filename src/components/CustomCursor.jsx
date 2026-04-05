import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  // Smooth trailing spring for the outer glass ring
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorX = useSpring(-100, springConfig);
  const cursorY = useSpring(-100, springConfig);

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      const isInteractive = 
        window.getComputedStyle(target).cursor === 'pointer' || 
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'input' ||
        target.closest('button') || target.closest('a');
      
      setIsHovering(!!isInteractive);
    };

    const handleMouseOut = () => {
      setIsHovering(false);
    }

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);

    document.body.classList.add('custom-cursor-active');

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      document.body.classList.remove('custom-cursor-active');
    };
  }, [cursorX, cursorY]);

  return (
    <div className="custom-cursor-wrapper">
      {/* Inner Cyberpunk Crosshair */}
      <motion.div
        className="custom-cursor-crosshair"
        animate={{
          x: mousePosition.x - 8,
          y: mousePosition.y - 8,
          rotate: isHovering ? 90 : 0,
          scale: isHovering ? 0 : 1,
          opacity: isHovering ? 0 : 1
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 0V16M0 8H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="8" cy="8" r="2" fill="currentColor" />
        </svg>
      </motion.div>
      
      {/* Outer morphing Glass Ring */}
      <motion.div
        className="custom-cursor-glass-ring"
        style={{
          x: cursorX,
          y: cursorY,
        }}
        animate={{
          x: cursorX.get() - (isHovering ? 32 : 16),
          y: cursorY.get() - (isHovering ? 32 : 16),
          width: isHovering ? 64 : 32,
          height: isHovering ? 64 : 32,
          borderRadius: isHovering ? '12px' : '50%',
          rotate: isHovering ? 45 : 0,
          backdropFilter: isHovering ? 'blur(6px) brightness(1.3)' : 'blur(0px) brightness(1)',
          backgroundColor: isHovering ? 'rgba(0, 243, 255, 0.1)' : 'transparent',
          border: isHovering ? '2px solid rgba(0, 243, 255, 0.8)' : '1px solid rgba(0, 243, 255, 0.5)',
          boxShadow: isHovering 
            ? '0 0 25px rgba(0, 243, 255, 0.5), inset 0 0 15px rgba(0, 243, 255, 0.3)' 
            : '0 0 10px rgba(0, 243, 255, 0.2)'
        }}
      />
    </div>
  );
};

export default CustomCursor;
