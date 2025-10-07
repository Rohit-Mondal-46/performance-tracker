import React, { useState, useEffect } from 'react';

export function ParallaxSection({ children, speed = 0.5 }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset * speed);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div
      className="w-full"
      style={{
        transform: `translateY(${offset}px)`,
      }}
    >
      {children}
    </div>
  );
}