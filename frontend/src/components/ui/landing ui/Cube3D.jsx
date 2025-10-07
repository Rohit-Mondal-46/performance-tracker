import React, { useState, useEffect } from 'react';

export function Cube3D({ className = '' }) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => ({
        x: prev.x + 1,
        y: prev.y + 0.5
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`perspective-1000 ${className}`}>
      <div 
        className="preserve-3d w-24 h-24 relative"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
      >
        {/* Cube faces */}
        {[
          { transform: 'translateZ(12px)', bg: 'from-blue-500 to-blue-600' },
          { transform: 'rotateY(90deg) translateZ(12px)', bg: 'from-purple-500 to-purple-600' },
          { transform: 'rotateY(180deg) translateZ(12px)', bg: 'from-pink-500 to-pink-600' },
          { transform: 'rotateY(-90deg) translateZ(12px)', bg: 'from-green-500 to-green-600' },
          { transform: 'rotateX(90deg) translateZ(12px)', bg: 'from-orange-500 to-orange-600' },
          { transform: 'rotateX(-90deg) translateZ(12px)', bg: 'from-indigo-500 to-indigo-600' },
        ].map((face, index) => (
          <div
            key={index}
            className={`absolute w-24 h-24 bg-gradient-to-br ${face.bg} opacity-80 border border-white/20`}
            style={{ transform: face.transform }}
          />
        ))}
      </div>
    </div>
  );
}