import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);

  // Directly mutate DOM values for zero-latency crosshair performance
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth trail spring for the outer ring
  const springConfig = { damping: 25, stiffness: 600, mass: 0.1 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const updateMousePosition = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
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

    // passive: true avoids jank
    window.addEventListener('mousemove', updateMousePosition, { passive: true });
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);

    document.body.classList.add('custom-cursor-active');

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      document.body.classList.remove('custom-cursor-active');
    };
  }, [mouseX, mouseY]);

  return (
    <div className="custom-cursor-wrapper">
      {/* Inner Cyberpunk Crosshair (Instant) */}
      <motion.div
        className="custom-cursor-crosshair"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          rotate: isHovering ? 90 : 0,
          scale: isHovering ? 0 : 1,
          opacity: isHovering ? 0 : 1
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 0V18M0 9H18" stroke="currentColor" strokeWidth="2" />
        </svg>
      </motion.div>
      
      {/* Outer morphing Glass Ring (Trailing) */}
      <motion.div
        className="custom-cursor-glass-ring"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isHovering ? 64 : 36,
          height: isHovering ? 64 : 36,
          borderRadius: isHovering ? '12px' : '50%',
          rotate: isHovering ? 45 : 0,
          backdropFilter: isHovering ? 'blur(6px) brightness(1.3)' : 'blur(0px) brightness(1)',
          backgroundColor: isHovering ? 'rgba(0, 243, 255, 0.1)' : 'transparent',
          border: isHovering ? '2px solid rgba(0, 243, 255, 0.8)' : '2px solid rgba(0, 243, 255, 0.4)',
          boxShadow: isHovering 
            ? '0 0 25px rgba(0, 243, 255, 0.5), inset 0 0 15px rgba(0, 243, 255, 0.3)' 
            : '0 0 10px rgba(0, 243, 255, 0.3)'
        }}
      />
    </div>
  );
};

export default CustomCursor;
