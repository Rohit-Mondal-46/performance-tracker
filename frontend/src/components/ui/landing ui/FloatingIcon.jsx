import React from 'react';

export function FloatingIcon({
  icon: Icon,
  delay = 0,
  color = 'blue',
  size = 'md'
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const positions = [
    { top: '10%', left: '5%' },
    { top: '20%', right: '8%' },
    { top: '60%', left: '3%' },
    { top: '70%', right: '5%' },
    { top: '40%', left: '10%' },
    { top: '50%', right: '12%' }
  ];

  const position = positions[delay % positions.length];

  return (
    <div
      className={`absolute ${sizeClasses[size]} animate-float opacity-10 hover:opacity-40 transition-opacity duration-300 pointer-events-none`}
      style={{
        ...position,
        animationDelay: `${delay}s`,
        animationDuration: `${6 + Math.random() * 4}s`
      }}
    >
      <div className={`w-full h-full bg-gradient-to-br from-${color}-400 to-${color}-600 rounded-2xl flex items-center justify-center shadow-lg`}>
        <Icon className="w-1/2 h-1/2 text-white" />
      </div>
    </div>
  );
}