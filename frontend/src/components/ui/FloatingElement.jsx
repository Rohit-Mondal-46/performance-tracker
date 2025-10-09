import React from 'react';


export function FloatingElement({ children, className = '', delay = 0, intensity = 'medium' }) {
  const intensityClasses = {
    low: 'animate-float',
    medium: 'animate-float',
    high: 'animate-float'
  };

  const intensityStyles = {
    low: { animationDuration: '8s' },
    medium: { animationDuration: '6s' },
    high: { animationDuration: '4s' }
  };

  return (
    <div 
      className={`${intensityClasses[intensity]} ${className}`}
      style={{ 
        animationDelay: `${delay}ms`,
        ...intensityStyles[intensity]
      }}
    >
      {children}
    </div>
  );
}