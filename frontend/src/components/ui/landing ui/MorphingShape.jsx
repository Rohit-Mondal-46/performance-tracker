import React, { useState, useEffect } from 'react';

export function MorphingShape({ className = '' }) {
  const [morphState, setMorphState] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMorphState(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getShapeTransform = () => {
    switch (morphState) {
      case 0:
        return 'rotate(0deg) scale(1)';
      case 1:
        return 'rotate(90deg) scale(1.1) skew(5deg)';
      case 2:
        return 'rotate(180deg) scale(0.9) skew(-5deg)';
      case 3:
        return 'rotate(270deg) scale(1.05) skew(3deg)';
      default:
        return 'rotate(0deg) scale(1)';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        className="w-32 h-32 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-3xl transition-all duration-2000 ease-in-out"
        style={{
          transform: getShapeTransform(),
          filter: 'blur(1px)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/50 via-purple-500/50 to-pink-500/50 rounded-3xl blur-xl animate-pulse" />
    </div>
  );
}