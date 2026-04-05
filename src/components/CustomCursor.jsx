import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  // Use springs for smooth following effect
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorX = useSpring(-100, springConfig);
  const cursorY = useSpring(-100, springConfig);

  useEffect(() => {
    // Only run cursor effect if device has a pointer/mouse
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      // Check if target is interactive
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

  // Don't render on mobile/touch interfaces
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return null;

  return (
    <>
      {/* Inner precise dot */}
      <motion.div
        className="custom-cursor-dot"
        animate={{
          x: mousePosition.x - 3,
          y: mousePosition.y - 3,
          opacity: isHovering ? 0 : 1
        }}
        transition={{ type: 'tween', ease: 'backOut', duration: 0.1 }}
      />
      
      {/* Outer following ring */}
      <motion.div
        className="custom-cursor-ring"
        style={{
          x: cursorX,
          y: cursorY,
        }}
        animate={{
          x: cursorX.get() - (isHovering ? 24 : 16),
          y: cursorY.get() - (isHovering ? 24 : 16),
          width: isHovering ? 48 : 32,
          height: isHovering ? 48 : 32,
          backgroundColor: isHovering ? 'rgba(0, 243, 255, 0.15)' : 'transparent',
          borderColor: isHovering ? 'rgba(0, 243, 255, 1)' : 'rgba(0, 243, 255, 0.6)',
          mixBlendMode: isHovering ? 'screen' : 'normal',
          boxShadow: isHovering 
            ? '0 0 20px rgba(0, 243, 255, 0.4)' 
            : '0 0 8px rgba(0, 243, 255, 0.2)'
        }}
      />
    </>
  );
};

export default CustomCursor;
