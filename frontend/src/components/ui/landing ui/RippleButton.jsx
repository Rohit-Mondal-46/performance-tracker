import React, { useState, useRef } from 'react';

export function RippleButton({
  children,
  onClick,
  className = '',
  variant = 'primary'
}) {
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);

  const handleClick = (e) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newRipple = { id: Date.now(), x, y };
      setRipples(prev => [...prev, newRipple]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    }
    
    onClick?.();
  };

  const baseClasses = variant === 'primary' 
    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-300/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 hover:border-blue-600/50 dark:hover:border-blue-400/50';

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className={`relative overflow-hidden ${baseClasses} px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl ${className}`}
    >
      {children}
      
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animationDuration: '0.6s',
          }}
        />
      ))}
    </button>
  );
}