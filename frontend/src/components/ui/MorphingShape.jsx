import React from 'react';


export function MorphingShape({ 
  size = 200, 
  color = 'bg-gradient-to-br from-blue-400 to-purple-600',
  className = '',
  speed = 'medium'
}) {
  const speedClasses = {
    slow: 'animate-morph',
    medium: 'animate-morph',
    fast: 'animate-morph'
  };

  const speedStyles = {
    slow: { animationDuration: '12s' },
    medium: { animationDuration: '8s' },
    fast: { animationDuration: '4s' }
  };

  return (
    <div 
      className={`
        ${color} 
        ${speedClasses[speed]} 
        blur-3xl opacity-20 
        ${className}
      `}
      style={{ 
        width: size, 
        height: size,
        ...speedStyles[speed]
      }}
    />
  );
}