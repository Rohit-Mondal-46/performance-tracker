import React from 'react';


export function GlassCard({ children, className = '', hover3d = true, glow = false }) {
  return (
    <div className={`
      relative
      glass backdrop-blur-xl bg-white/10 dark:bg-black/10
      border border-white/20 dark:border-white/10
      rounded-2xl shadow-xl
      overflow-hidden
      ${hover3d ? 'group transform transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-2 hover:shadow-2xl' : ''}
      ${glow ? 'hover:shadow-2xl hover:shadow-blue-500/30' : ''}
      ${className}
    `}>
      <div className="relative z-10">
        {children}
      </div>

      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out -z-10"></div>
    </div>
  );
}