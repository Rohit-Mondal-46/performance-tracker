import React, { useState, useEffect, useRef } from 'react';

export function Card3D({ 
  children, 
  className = '', 
  delay = 0, 
  hoverEffect = 'lift',
  glowColor = 'blue'
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const getHoverTransform = () => {
    if (!isHovered) return '';
    
    switch (hoverEffect) {
      case 'lift':
        return 'translateY(-12px) scale(1.03) rotateX(5deg)';
      case 'rotate':
        return 'rotateY(10deg) rotateX(5deg) scale(1.02)';
      case 'scale':
        return 'scale(1.05) translateZ(20px)';
      case 'flip':
        return 'rotateY(180deg) scale(1.02)';
      default:
        return 'translateY(-8px) scale(1.02)';
    }
  };

  const getGlowColor = () => {
    switch (glowColor) {
      case 'purple':
        return 'rgba(139, 92, 246, 0.3)';
      case 'green':
        return 'rgba(16, 185, 129, 0.3)';
      case 'orange':
        return 'rgba(245, 158, 11, 0.3)';
      default:
        return 'rgba(59, 130, 246, 0.3)';
    }
  };

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-1000 ${
        isVisible 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-20 opacity-0 scale-95'
      } ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      <div 
        className="group relative transform transition-all duration-700 cursor-pointer"
        style={{
          transform: getHoverTransform(),
          boxShadow: isHovered ? `0 25px 50px ${getGlowColor()}` : 'none',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
        
        {/* Animated border gradient */}
        <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-x"></div>
        </div>
      </div>
    </div>
  );
}